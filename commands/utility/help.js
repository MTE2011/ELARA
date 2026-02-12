const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands'),
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        const prefix = config.prefix || client.config.prefix || '!';
        const helpEmbed = this.getHelpEmbed(config, prefix);
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },

    async executePrefix(message, args, client) {
        const config = client.db.getServerConfig(message.guild.id);
        const prefix = config.prefix || client.config.prefix || '!';
        const helpEmbed = this.getHelpEmbed(config, prefix);
        await message.reply({ embeds: [helpEmbed] });
    },

    getHelpEmbed(config, prefix) {
        return new EmbedBuilder()
            .setTitle('🌙 Elara - Help Menu')
            .setDescription(`Here are all the available commands. You can use them with the prefix \`${prefix}\` or as slash commands.`)
            .setColor(config.embedColor)
            .addFields(
                {
                    name: '🎫 Ticket Commands',
                    value: `\`${prefix}ticket-setup\` - Set up the ticket system\n` +
                           'Use the ticket panel to create tickets',
                    inline: false
                },
                {
                    name: '🤝 Partnership Commands',
                    value: `\`${prefix}partner\` - Submit a partnership request`,
                    inline: false
                },
                {
                    name: '📜 Rules Commands',
                    value: `\`${prefix}rules-setup\` - Post rules acceptance panel\n` +
                           `\`${prefix}rules-add\` - Add a new rule`,
                    inline: false
                },
                {
                    name: '🎉 Giveaway Commands',
                    value: `\`${prefix}giveaway-start\` - Start a giveaway`,
                    inline: false
                },
                {
                    name: '🛡️ Moderation Commands',
                    value: `\`${prefix}warn\` - Warn a member\n` +
                           `\`${prefix}timeout\` - Timeout a member\n' +
                           `\`${prefix}kick\` - Kick a member\n' +
                           `\`${prefix}ban\` - Ban a member`,
                    inline: false
                },
                {
                    name: '📊 Leveling Commands',
                    value: `\`${prefix}rank\` - Check your rank and level\n` +
                           `\`${prefix}leaderboard\` - View the server leaderboard`,
                    inline: false
                },
                {
                    name: '⚙️ Configuration Commands',
                    value: `\`${prefix}set\` - Configure bot settings\n` +
                           `\`${prefix}guide\` - View setup guide`,
                    inline: false
                },
                {
                    name: '🔧 Utility Commands',
                    value: `\`${prefix}help\` - Show this menu\n` +
                           `\`${prefix}ping\` - Check bot latency\n` +
                           `\`${prefix}serverinfo\` - View server information\n` +
                           `\`${prefix}userinfo\` - View user information\n` +
                           `\`${prefix}embed\` - Create a custom embed`,
                    inline: false
                }
            )
            .setFooter({ text: 'Elara - Discord Management Bot' })
            .setTimestamp();
    }
};
