const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('View the setup guide for Elara')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        const guideEmbed = new EmbedBuilder()
            .setTitle('🌙 Elara Setup Guide')
            .setDescription(
                'Welcome to Elara! Follow this guide to set up all the features.\n\n' +
                '**Getting Started:**\n' +
                'All configuration is done through the `/set` command. Only server owners or users with the Administrator permission can configure the bot.'
            )
            .setColor(config.embedColor)
            .addFields(
                {
                    name: '🎫 Ticket System Setup',
                    value: 
                        '1. Create a category for tickets\n' +
                        '2. `/set ticket-category <category>` - Set the ticket category\n' +
                        '3. `/set ticket-log-channel <channel>` - Set log channel (optional)\n' +
                        '4. `/set ticket-support-role <role>` - Set support role (optional)\n' +
                        '5. `/set ticket-enabled true` - Enable the system\n' +
                        '6. `/ticket-setup <channel>` - Send the ticket panel',
                    inline: false
                },
                {
                    name: '🔗 Anti-Link System Setup',
                    value:
                        '1. `/set antilink-enabled true` - Enable anti-link\n' +
                        '2. Configure whitelist and bypass roles in database if needed',
                    inline: false
                },
                {
                    name: '🤝 Partnership System Setup',
                    value:
                        '1. Create a channel for partnership requests\n' +
                        '2. `/set partnership-channel <channel>` - Set partnership channel\n' +
                        '3. `/set partnership-enabled true` - Enable the system\n' +
                        '4. Users can now use `/partner` to submit requests',
                    inline: false
                },
                {
                    name: '📜 Rules System Setup',
                    value:
                        '1. `/rules-add <rule>` - Add rules (repeat for each rule)\n' +
                        '2. `/set rules-role <role>` - Set the role given after accepting\n' +
                        '3. `/set rules-enabled true` - Enable the system\n' +
                        '4. `/rules-setup <channel>` - Post the rules panel',
                    inline: false
                },
                {
                    name: '👋 Welcome/Leave System Setup',
                    value:
                        '1. `/set welcome-channel <channel>` - Set welcome channel\n' +
                        '2. `/set welcome-enabled true` - Enable welcome messages\n' +
                        '3. `/set leave-channel <channel>` - Set leave channel\n' +
                        '4. `/set leave-enabled true` - Enable leave messages',
                    inline: false
                },
                {
                    name: '🎉 Giveaway System Setup',
                    value:
                        '1. `/set giveaway-enabled true` - Enable giveaways\n' +
                        '2. Use `/giveaway-start` to create giveaways',
                    inline: false
                },
                {
                    name: '🛡️ Moderation System Setup',
                    value:
                        '1. `/set moderation-log-channel <channel>` - Set log channel\n' +
                        '2. `/set moderation-enabled true` - Enable moderation\n' +
                        '3. Use `/warn`, `/timeout`, `/kick`, `/ban` commands',
                    inline: false
                },
                {
                    name: '📊 Leveling System Setup',
                    value:
                        '1. `/set leveling-channel <channel>` - Set level-up channel (optional)\n' +
                        '2. `/set leveling-enabled true` - Enable leveling\n' +
                        '3. Users gain XP by chatting and can check `/rank`',
                    inline: false
                },
                {
                    name: '📝 Important Notes',
                    value:
                        '• Make sure Elara has proper permissions in all channels\n' +
                        '• Place Elara\'s role above other roles for moderation\n' +
                        '• Test each system after setup to ensure it works\n' +
                        '• Use `/help` to see all available commands',
                    inline: false
                }
            )
            .setFooter({ text: 'Need more help? Contact the bot developer' })
            .setTimestamp();

        await interaction.reply({ embeds: [guideEmbed], ephemeral: true });
    }
};
