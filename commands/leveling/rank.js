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
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.levelingEnabled) {
            return interaction.reply({
                content: '❌ Leveling system is not enabled on this server.',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user') || interaction.user;
        const userData = client.db.getUserLevel(interaction.guild.id, user.id);

        // Calculate XP needed for next level
        const currentLevelXp = Math.pow((userData.level / 0.1), 2);
        const nextLevelXp = Math.pow(((userData.level + 1) / 0.1), 2);
        const xpNeeded = Math.floor(nextLevelXp - userData.xp);

        // Get user rank
        const leaderboard = client.db.getLeaderboard(interaction.guild.id, 100);
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

        await interaction.reply({ embeds: [rankEmbed] });
    }
};
