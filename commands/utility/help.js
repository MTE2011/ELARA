const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands'),
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        const helpEmbed = new EmbedBuilder()
            .setTitle('🌙 Elara - Help Menu')
            .setDescription('Here are all the available commands organized by category.')
            .setColor(config.embedColor)
            .addFields(
                {
                    name: '🎫 Ticket Commands',
                    value: '`/ticket-setup` - Set up the ticket system\n' +
                           'Use the ticket panel to create tickets',
                    inline: false
                },
                {
                    name: '🤝 Partnership Commands',
                    value: '`/partner` - Submit a partnership request',
                    inline: false
                },
                {
                    name: '📜 Rules Commands',
                    value: '`/rules-setup` - Post rules acceptance panel\n' +
                           '`/rules-add` - Add a new rule',
                    inline: false
                },
                {
                    name: '🎉 Giveaway Commands',
                    value: '`/giveaway-start` - Start a giveaway',
                    inline: false
                },
                {
                    name: '🛡️ Moderation Commands',
                    value: '`/warn` - Warn a member\n' +
                           '`/timeout` - Timeout a member\n' +
                           '`/kick` - Kick a member\n' +
                           '`/ban` - Ban a member',
                    inline: false
                },
                {
                    name: '📊 Leveling Commands',
                    value: '`/rank` - Check your rank and level\n' +
                           '`/leaderboard` - View the server leaderboard',
                    inline: false
                },
                {
                    name: '⚙️ Configuration Commands',
                    value: '`/set` - Configure bot settings\n' +
                           '`/guide` - View setup guide',
                    inline: false
                },
                {
                    name: '🔧 Utility Commands',
                    value: '`/help` - Show this menu\n' +
                           '`/ping` - Check bot latency\n' +
                           '`/serverinfo` - View server information\n' +
                           '`/userinfo` - View user information\n' +
                           '`/embed` - Create a custom embed',
                    inline: false
                }
            )
            .setFooter({ text: 'Elara - Discord Management Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
};
