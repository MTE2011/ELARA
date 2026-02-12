const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your or another user\'s rank and level')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check (leave empty for yourself)')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        await this.showRank(interaction, user, client);
    },

    async executePrefix(message, args, client) {
        const userMention = args[0];
        const userId = userMention ? userMention.replace(/[<@!>]/g, '') : message.author.id;
        const user = await client.users.fetch(userId).catch(() => null);

        if (!user) {
            return message.reply('❌ Invalid user provided.');
        }

        await this.showRank(message, user, client);
    },

    async showRank(context, user, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.levelingEnabled) {
            const msg = '❌ Leveling system is not enabled on this server.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const userData = client.db.getUserLevel(guildId, user.id);

        // Calculate XP needed for next level
        const currentLevelXp = Math.pow((userData.level / 0.1), 2);
        const nextLevelXp = Math.pow(((userData.level + 1) / 0.1), 2);
        const xpNeeded = Math.floor(nextLevelXp - userData.xp);

        // Get user rank
        const leaderboard = client.db.getLeaderboard(guildId, 100);
        const rank = leaderboard.findIndex(entry => entry.userId === user.id) + 1;

        const rankEmbed = new EmbedBuilder()
            .setTitle(`📊 Rank Card - ${user.username}`)
            .setDescription(
                `**Level:** ${userData.level}\n` +
                `**XP:** ${userData.xp}\n` +
                `**Messages:** ${userData.messages}\n` +
                `**Rank:** ${rank > 0 ? `#${rank}` : 'Unranked'}\n` +
                `**XP to Next Level:** ${xpNeeded}`
            )
            .setColor(config.embedColor)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (context.reply) {
            await context.reply({ embeds: [rankEmbed] });
        } else {
            await context.reply({ embeds: [rankEmbed] });
        }
    }
};
