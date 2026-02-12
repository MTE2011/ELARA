const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.levelingEnabled) {
            return interaction.reply({
                content: '❌ Leveling system is not enabled on this server.',
                ephemeral: true
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const perPage = 10;
        const start = (page - 1) * perPage;

        const leaderboard = client.db.getLeaderboard(interaction.guild.id, 100);
        const pageData = leaderboard.slice(start, start + perPage);

        if (pageData.length === 0) {
            return interaction.reply({
                content: '❌ No data found for this page.',
                ephemeral: true
            });
        }

        const leaderboardText = pageData.map((entry, index) => {
            const position = start + index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `**${position}.**`;
            return `${medal} <@${entry.userId}> - Level ${entry.level} (${entry.xp} XP)`;
        }).join('\n');

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
            .setDescription(leaderboardText)
            .setColor(config.embedColor)
            .setFooter({ text: `Page ${page} • Total users: ${leaderboard.length}` })
            .setTimestamp();

        await interaction.reply({ embeds: [leaderboardEmbed] });
    }
};
