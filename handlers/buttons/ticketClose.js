const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = async (interaction, client) => {
    const config = client.db.getServerConfig(interaction.guild.id);
    const ticket = client.db.getTickets(interaction.guild.id)[interaction.channel.id];

    if (!ticket) {
        return interaction.reply({
            content: '❌ This is not a valid ticket channel.',
            ephemeral: true
        });
    }

    // Check permissions - only ticket creator, staff, or admins can close
    const hasPermission = 
        interaction.user.id === ticket.userId ||
        interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        (config.ticketSupportRoleId && interaction.member.roles.cache.has(config.ticketSupportRoleId));

    if (!hasPermission) {
        return interaction.reply({
            content: '❌ You do not have permission to close this ticket.',
            ephemeral: true
        });
    }

    await interaction.deferReply();

    try {
        // Create transcript
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages
            .reverse()
            .map(msg => `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}`)
            .join('\n');

        // Update ticket status
        client.db.updateTicket(interaction.guild.id, interaction.channel.id, {
            status: 'closed',
            closedBy: interaction.user.id,
            closedAt: Date.now()
        });

        // Send closing message
        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(
                `This ticket has been closed by ${interaction.user}.\n\n` +
                `The channel will be deleted in 10 seconds.`
            )
            .setColor('#FF0000')
            .setTimestamp();

        await interaction.editReply({ embeds: [closeEmbed] });

        // Log ticket closure
        if (config.ticketLogChannelId) {
            const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔒 Ticket Closed')
                    .setDescription(
                        `**Ticket:** #${ticket.ticketNumber}\n` +
                        `**Created by:** <@${ticket.userId}>\n` +
                        `**Closed by:** ${interaction.user.tag} (${interaction.user.id})\n` +
                        `**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor('#FF0000')
                    .setTimestamp();

                // Send transcript as file
                const buffer = Buffer.from(transcript, 'utf-8');
                const attachment = {
                    attachment: buffer,
                    name: `ticket-${ticket.ticketNumber}-transcript.txt`
                };

                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }
        }

        // Delete channel after 10 seconds
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
                client.db.removeTicket(interaction.guild.id, interaction.channel.id);
                logger.info(`Ticket #${ticket.ticketNumber} deleted in ${interaction.guild.name}`);
            } catch (error) {
                logger.error('Error deleting ticket channel:', error);
            }
        }, 10000);

        logger.info(`Ticket #${ticket.ticketNumber} closed by ${interaction.user.tag} in ${interaction.guild.name}`);

    } catch (error) {
        logger.error('Error closing ticket:', error);
        
        await interaction.editReply({
            content: '❌ Failed to close ticket. Please try again or contact an administrator.'
        });
    }
};
