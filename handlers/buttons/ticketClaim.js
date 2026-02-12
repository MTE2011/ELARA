const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

    // Check if user has permission to claim tickets
    const hasPermission = 
        interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        (config.ticketSupportRoleId && interaction.member.roles.cache.has(config.ticketSupportRoleId));

    if (!hasPermission) {
        return interaction.reply({
            content: '❌ You do not have permission to claim tickets.',
            ephemeral: true
        });
    }

    if (ticket.claimedBy) {
        return interaction.reply({
            content: `❌ This ticket has already been claimed by <@${ticket.claimedBy}>`,
            ephemeral: true
        });
    }

    try {
        // Update ticket
        client.db.updateTicket(interaction.guild.id, interaction.channel.id, {
            claimedBy: interaction.user.id,
            claimedAt: Date.now()
        });

        const claimEmbed = new EmbedBuilder()
            .setTitle('✋ Ticket Claimed')
            .setDescription(
                `This ticket has been claimed by ${interaction.user}.\n\n` +
                `They will assist you shortly.`
            )
            .setColor(config.embedColor)
            .setTimestamp();

        await interaction.reply({ embeds: [claimEmbed] });

        logger.info(`Ticket #${ticket.ticketNumber} claimed by ${interaction.user.tag} in ${interaction.guild.name}`);

    } catch (error) {
        logger.error('Error claiming ticket:', error);
        
        await interaction.reply({
            content: '❌ Failed to claim ticket. Please try again.',
            ephemeral: true
        });
    }
};
