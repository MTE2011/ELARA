const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View information about the server'),
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        const guild = interaction.guild;

        const serverEmbed = new EmbedBuilder()
            .setTitle(`📊 ${guild.name} - Server Information`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(config.embedColor)
            .addFields(
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
                { name: '💬 Channels', value: guild.channels.cache.size.toString(), inline: true },
                { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
                { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: false }
            )
            .setFooter({ text: `Server ID: ${guild.id}` })
            .setTimestamp();

        if (guild.description) {
            serverEmbed.setDescription(guild.description);
        }

        await interaction.reply({ embeds: [serverEmbed] });
    }
};
