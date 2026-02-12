const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about (leave empty for yourself)')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!member) {
            return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        }

        const embed = this.getEmbed(member, user, config);
        await interaction.reply({ embeds: [embed] });
    },

    async executePrefix(message, args, client) {
        const userMention = args[0];
        const userId = userMention ? userMention.replace(/[<@!>]/g, '') : message.author.id;
        const member = message.guild.members.cache.get(userId);
        const config = client.db.getServerConfig(message.guild.id);

        if (!member) {
            return message.reply('❌ User not found in this server.');
        }

        const embed = this.getEmbed(member, member.user, config);
        await message.reply({ embeds: [embed] });
    },

    getEmbed(member, user, config) {
        const roles = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        return new EmbedBuilder()
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(member.displayHexColor || config.embedColor)
            .addFields(
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles.length > 0 ? roles.join(', ') : 'None', inline: false }
            )
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();
    }
};
