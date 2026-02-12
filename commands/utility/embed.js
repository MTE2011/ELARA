const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom embed')
        .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(false))
        .addStringOption(option => option.setName('description').setDescription('Embed description').setRequired(false))
        .addStringOption(option => option.setName('color').setDescription('Embed color (hex code, e.g., #5865F2)').setRequired(false))
        .addStringOption(option => option.setName('footer').setDescription('Embed footer text').setRequired(false))
        .addStringOption(option => option.setName('image').setDescription('Image URL').setRequired(false))
        .addStringOption(option => option.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false))
        .addChannelOption(option => option.setName('channel').setDescription('Channel to send the embed').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    permissions: PermissionFlagsBits.ManageMessages,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        const data = {
            title: interaction.options.getString('title'),
            description: interaction.options.getString('description'),
            color: interaction.options.getString('color') || config.embedColor,
            footer: interaction.options.getString('footer'),
            image: interaction.options.getString('image'),
            thumbnail: interaction.options.getString('thumbnail'),
            channel: interaction.options.getChannel('channel') || interaction.channel
        };
        await this.sendEmbed(interaction, data);
    },

    async executePrefix(message, args, client) {
        // Usage: embed "Title" "Description" [#channel] [color]
        if (args.length < 1) {
            return message.reply('❌ Usage: `embed "Title" "Description" [#channel] [color]`');
        }

        const config = client.db.getServerConfig(message.guild.id);
        const data = {
            title: args[0],
            description: args[1]?.replace(/\\n/g, '\n'),
            channel: message.guild.channels.cache.get(args[2]?.replace(/[<#>]/g, '')) || message.channel,
            color: args[3] || config.embedColor
        };

        await this.sendEmbed(message, data);
    },

    async sendEmbed(context, data) {
        if (!data.title && !data.description) {
            const msg = '❌ You must provide at least a title or description.';
            return context.reply ? (context.ephemeral ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg)) : context.reply(msg);
        }

        const embed = new EmbedBuilder().setColor(data.color);
        if (data.title) embed.setTitle(data.title);
        if (data.description) embed.setDescription(data.description);
        if (data.footer) embed.setFooter({ text: data.footer });
        if (data.image) embed.setImage(data.image);
        if (data.thumbnail) embed.setThumbnail(data.thumbnail);

        try {
            await data.channel.send({ embeds: [embed] });
            const successMsg = `✅ Embed sent to ${data.channel}`;
            if (context.reply) {
                if (context.ephemeral) {
                    await context.reply({ content: successMsg, ephemeral: true });
                } else {
                    await context.reply(successMsg);
                }
            }
        } catch (error) {
            const errorMsg = '❌ Failed to send embed. Check my permissions.';
            if (context.reply) {
                if (context.ephemeral) {
                    await context.reply({ content: errorMsg, ephemeral: true });
                } else {
                    await context.reply(errorMsg);
                }
            }
        }
    }
};
