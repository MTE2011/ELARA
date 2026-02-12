const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Set up the ticket system with a panel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the ticket panel')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        await this.setup(interaction, channel, client);
    },

    async executePrefix(message, args, client) {
        const channelMention = args[0];
        const channelId = channelMention ? channelMention.replace(/[<#>]/g, '') : message.channel.id;
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('❌ Invalid channel provided.');
        }

        await this.setup(message, channel, client);
    },

    async setup(context, channel, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.ticketEnabled) {
            const msg = '❌ Ticket system is not enabled. Use `set ticket-enabled true` first.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        if (!config.ticketCategoryId) {
            const msg = '❌ Ticket category is not set. Use `set ticket-category <category>` first.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket System')
            .setDescription(
                'Need help? Create a support ticket!\n\n' +
                '**How to create a ticket:**\n' +
                '• Click the button below\n' +
                '• A private channel will be created for you\n' +
                '• Explain your issue to our support team\n\n' +
                '**Ticket Categories:**\n' +
                '🛠️ Support - General help and questions\n' +
                '📋 Report - Report rule violations or bugs\n' +
                '🤝 Partnership - Partnership inquiries\n' +
                '📝 Application - Staff applications\n' +
                '❓ Other - Other inquiries'
            )
            .setColor(config.embedColor)
            .setFooter({ text: 'Click the button below to create a ticket' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel('Create Ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Primary)
            );

        try {
            await channel.send({ embeds: [embed], components: [row] });
            
            const successMsg = `✅ Ticket panel has been sent to ${channel}`;
            if (context.reply) {
                await context.reply(successMsg);
            } else {
                await context.reply({ content: successMsg, ephemeral: true });
            }
        } catch (error) {
            const errorMsg = '❌ Failed to send ticket panel. Make sure I have permission to send messages in that channel.';
            if (context.reply) {
                await context.reply(errorMsg);
            } else {
                await context.reply({ content: errorMsg, ephemeral: true });
            }
        }
    }
};
