const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom embed')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Embed title')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Embed description')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Embed color (hex code, e.g., #5865F2)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Embed footer text')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('Thumbnail URL')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the embed (leave empty for current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    permissions: PermissionFlagsBits.ManageMessages,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || config.embedColor;
        const footer = interaction.options.getString('footer');
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!title && !description) {
            return interaction.reply({
                content: '❌ You must provide at least a title or description.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(color);

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);

        try {
            await channel.send({ embeds: [embed] });
            
            await interaction.reply({
                content: `✅ Embed sent to ${channel}`,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to send embed. Make sure I have permission to send messages in that channel.',
                ephemeral: true
            });
        }
    }
};
