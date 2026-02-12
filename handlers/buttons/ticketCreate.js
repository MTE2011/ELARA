const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = async (interaction, client) => {
    const config = client.db.getServerConfig(interaction.guild.id);

    if (!config.ticketEnabled) {
        return interaction.reply({
            content: '❌ Ticket system is not enabled on this server.',
            ephemeral: true
        });
    }

    if (!config.ticketCategoryId) {
        return interaction.reply({
            content: '❌ Ticket category is not configured. Please contact an administrator.',
            ephemeral: true
        });
    }

    const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
    if (!category) {
        return interaction.reply({
            content: '❌ Ticket category not found. Please contact an administrator.',
            ephemeral: true
        });
    }

    // Check if user already has an open ticket
    const existingTickets = client.db.getTickets(interaction.guild.id);
    const userTicket = Object.values(existingTickets).find(
        ticket => ticket.userId === interaction.user.id && ticket.status === 'open'
    );

    if (userTicket) {
        return interaction.reply({
            content: `❌ You already have an open ticket: <#${userTicket.channelId}>`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        // Increment ticket counter
        const ticketNumber = config.ticketCounter + 1;
        client.db.updateServerConfig(interaction.guild.id, { ticketCounter: ticketNumber });

        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ]
        });

        // Add support role to ticket if configured
        if (config.ticketSupportRoleId) {
            const supportRole = interaction.guild.roles.cache.get(config.ticketSupportRoleId);
            if (supportRole) {
                await ticketChannel.permissionOverwrites.create(supportRole, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }

        // Create ticket embed
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket #${ticketNumber}`)
            .setDescription(
                `Welcome ${interaction.user}, thank you for creating a ticket!\n\n` +
                `A staff member will be with you shortly. Please describe your issue in detail.\n\n` +
                `**Ticket Information:**\n` +
                `• Ticket Number: #${ticketNumber}\n` +
                `• Created by: ${interaction.user.tag}\n` +
                `• Status: Open`
            )
            .setColor(config.embedColor)
            .setTimestamp()
            .setFooter({ text: `Ticket #${ticketNumber}` });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await ticketChannel.send({
            content: config.ticketSupportRoleId ? `<@&${config.ticketSupportRoleId}>` : '',
            embeds: [ticketEmbed],
            components: [buttons]
        });

        // Save ticket to database
        client.db.addTicket(interaction.guild.id, ticketChannel.id, {
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            ticketNumber: ticketNumber,
            status: 'open',
            claimedBy: null,
            createdAt: Date.now(),
            messages: []
        });

        // Log ticket creation
        if (config.ticketLogChannelId) {
            const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('📝 Ticket Created')
                    .setDescription(
                        `**Ticket:** ${ticketChannel}\n` +
                        `**Number:** #${ticketNumber}\n` +
                        `**Created by:** ${interaction.user.tag} (${interaction.user.id})\n` +
                        `**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor('#00FF00')
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        await interaction.editReply({
            content: `✅ Ticket created! Please check ${ticketChannel}`
        });

        logger.info(`Ticket #${ticketNumber} created by ${interaction.user.tag} in ${interaction.guild.name}`);

    } catch (error) {
        logger.error('Error creating ticket:', error);
        
        await interaction.editReply({
            content: '❌ Failed to create ticket. Please contact an administrator.'
        });
    }
};
