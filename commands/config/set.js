const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Configure bot settings for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-enabled')
                .setDescription('Enable or disable the ticket system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-category')
                .setDescription('Set the category for ticket channels')
                .addChannelOption(option => option.setName('category').setDescription('Category channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-log-channel')
                .setDescription('Set the channel for ticket logs')
                .addChannelOption(option => option.setName('channel').setDescription('Log channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-support-role')
                .setDescription('Set the support role for tickets')
                .addRoleOption(option => option.setName('role').setDescription('Support role').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antilink-enabled')
                .setDescription('Enable or disable anti-link system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('partnership-enabled')
                .setDescription('Enable or disable partnership system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('partnership-channel')
                .setDescription('Set the channel for partnership requests')
                .addChannelOption(option => option.setName('channel').setDescription('Partnership channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rules-enabled')
                .setDescription('Enable or disable rules system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rules-role')
                .setDescription('Set the role given after accepting rules')
                .addRoleOption(option => option.setName('role').setDescription('Rules acceptance role').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcome-enabled')
                .setDescription('Enable or disable welcome system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcome-channel')
                .setDescription('Set the channel for welcome messages')
                .addChannelOption(option => option.setName('channel').setDescription('Welcome channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave-enabled')
                .setDescription('Enable or disable leave system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave-channel')
                .setDescription('Set the channel for leave messages')
                .addChannelOption(option => option.setName('channel').setDescription('Leave channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('giveaway-enabled')
                .setDescription('Enable or disable giveaway system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('moderation-enabled')
                .setDescription('Enable or disable moderation system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('moderation-log-channel')
                .setDescription('Set the channel for moderation logs')
                .addChannelOption(option => option.setName('channel').setDescription('Moderation log channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leveling-enabled')
                .setDescription('Enable or disable leveling system')
                .addBooleanOption(option => option.setName('value').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leveling-channel')
                .setDescription('Set the channel for level-up messages')
                .addChannelOption(option => option.setName('channel').setDescription('Leveling channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('prefix')
                .setDescription('Set the command prefix for this server')
                .addStringOption(option => option.setName('value').setDescription('New prefix').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const updates = {};

        switch (subcommand) {
            case 'ticket-enabled':
                updates.ticketEnabled = interaction.options.getBoolean('value');
                break;
            case 'ticket-category':
                updates.ticketCategoryId = interaction.options.getChannel('category').id;
                break;
            case 'ticket-log-channel':
                updates.ticketLogChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'ticket-support-role':
                updates.ticketSupportRoleId = interaction.options.getRole('role').id;
                break;
            case 'antilink-enabled':
                updates.antiLinkEnabled = interaction.options.getBoolean('value');
                break;
            case 'partnership-enabled':
                updates.partnershipEnabled = interaction.options.getBoolean('value');
                break;
            case 'partnership-channel':
                updates.partnershipChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'rules-enabled':
                updates.rulesEnabled = interaction.options.getBoolean('value');
                break;
            case 'rules-role':
                updates.rulesAcceptRoleId = interaction.options.getRole('role').id;
                break;
            case 'welcome-enabled':
                updates.welcomeEnabled = interaction.options.getBoolean('value');
                break;
            case 'welcome-channel':
                updates.welcomeChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'leave-enabled':
                updates.leaveEnabled = interaction.options.getBoolean('value');
                break;
            case 'leave-channel':
                updates.leaveChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'giveaway-enabled':
                updates.giveawayEnabled = interaction.options.getBoolean('value');
                break;
            case 'moderation-enabled':
                updates.moderationEnabled = interaction.options.getBoolean('value');
                break;
            case 'moderation-log-channel':
                updates.moderationLogChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'leveling-enabled':
                updates.levelingEnabled = interaction.options.getBoolean('value');
                break;
            case 'leveling-channel':
                updates.levelingChannelId = interaction.options.getChannel('channel').id;
                break;
            case 'prefix':
                updates.prefix = interaction.options.getString('value');
                break;
        }

        client.db.updateServerConfig(interaction.guild.id, updates);

        await interaction.reply({
            content: `✅ Configuration updated: **${subcommand}**`,
            ephemeral: true
        });
    },

    async executePrefix(message, args, client) {
        if (args.length < 2) {
            return message.reply('❌ Usage: `set <setting> <value>`\nExample: `set ticket-enabled true`');
        }

        const setting = args[0].toLowerCase();
        const value = args[1];
        const updates = {};

        // Helper to get ID from mention or raw ID
        const getId = (val) => val.replace(/[<@&#>!]/g, '');

        switch (setting) {
            case 'ticket-enabled':
                updates.ticketEnabled = value === 'true';
                break;
            case 'ticket-category':
                updates.ticketCategoryId = getId(value);
                break;
            case 'ticket-log-channel':
                updates.ticketLogChannelId = getId(value);
                break;
            case 'ticket-support-role':
                updates.ticketSupportRoleId = getId(value);
                break;
            case 'antilink-enabled':
                updates.antiLinkEnabled = value === 'true';
                break;
            case 'partnership-enabled':
                updates.partnershipEnabled = value === 'true';
                break;
            case 'partnership-channel':
                updates.partnershipChannelId = getId(value);
                break;
            case 'rules-enabled':
                updates.rulesEnabled = value === 'true';
                break;
            case 'rules-role':
                updates.rulesAcceptRoleId = getId(value);
                break;
            case 'welcome-enabled':
                updates.welcomeEnabled = value === 'true';
                break;
            case 'welcome-channel':
                updates.welcomeChannelId = getId(value);
                break;
            case 'leave-enabled':
                updates.leaveEnabled = value === 'true';
                break;
            case 'leave-channel':
                updates.leaveChannelId = getId(value);
                break;
            case 'giveaway-enabled':
                updates.giveawayEnabled = value === 'true';
                break;
            case 'moderation-enabled':
                updates.moderationEnabled = value === 'true';
                break;
            case 'moderation-log-channel':
                updates.moderationLogChannelId = getId(value);
                break;
            case 'leveling-enabled':
                updates.levelingEnabled = value === 'true';
                break;
            case 'leveling-channel':
                updates.levelingChannelId = getId(value);
                break;
            case 'prefix':
                updates.prefix = value;
                break;
            default:
                return message.reply(`❌ Unknown setting: \`${setting}\``);
        }

        client.db.updateServerConfig(message.guild.id, updates);
        await message.reply(`✅ Configuration updated: **${setting}**`);
    }
};
