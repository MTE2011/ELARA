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
        const page = interaction.options.getInteger('page') || 1;
        await this.showLeaderboard(interaction, page, client);
    },

    async executePrefix(message, args, client) {
        const page = parseInt(args[0]) || 1;
        await this.showLeaderboard(message, page, client);
    },

    async showLeaderboard(context, page, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.levelingEnabled) {
            const msg = '❌ Leveling system is not enabled on this server.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const perPage = 10;
        const start = (page - 1) * perPage;

        const leaderboard = client.db.getLeaderboard(guildId, 100);
        const pageData = leaderboard.slice(start, start + perPage);

        if (pageData.length === 0) {
            const msg = '❌ No data found for this page.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const leaderboardText = pageData.map((entry, index) => {
            const position = start + index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `**${position}.**`;
            return `${medal} <@${entry.userId}> - Level ${entry.level} (${entry.xp} XP)`;
        }).join('\n');

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`🏆 ${context.guild.name} Leaderboard`)
            .setDescription(leaderboardText)
            .setColor(config.embedColor)
            .setFooter({ text: `Page ${page} • Total users: ${leaderboard.length}` })
            .setTimestamp();

        if (context.reply) {
            await context.reply({ embeds: [leaderboardEmbed] });
        } else {
            await context.reply({ embeds: [leaderboardEmbed] });
        }
    }
};
