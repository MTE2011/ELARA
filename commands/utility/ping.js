const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const pingEmbed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(
                `**Bot Latency:** ${latency}ms\n` +
                `**API Latency:** ${apiLatency}ms`
            )
            .setColor(config.embedColor)
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [pingEmbed] });
    },

    async executePrefix(message, args, client) {
        const config = client.db.getServerConfig(message.guild.id);
        const sent = await message.reply('Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const pingEmbed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(
                `**Bot Latency:** ${latency}ms\n` +
                `**API Latency:** ${apiLatency}ms`
            )
            .setColor(config.embedColor)
            .setTimestamp();

        await sent.edit({ content: '', embeds: [pingEmbed] });
    }
};
