const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    permissions: PermissionFlagsBits.KickMembers,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server.',
                ephemeral: true
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot kick yourself.',
                ephemeral: true
            });
        }

        if (member.id === client.user.id) {
            return interaction.reply({
                content: '❌ I cannot kick myself.',
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: '❌ I cannot kick this user (role hierarchy or permissions).',
                ephemeral: true
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: '❌ You cannot kick this user (role hierarchy).',
                ephemeral: true
            });
        }

        try {
            // Try to DM user before kicking
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('👢 You have been kicked')
                            .setDescription(
                                `You have been kicked from **${interaction.guild.name}**\n\n` +
                                `**Reason:** ${reason}\n` +
                                `**Moderator:** ${interaction.user.tag}`
                            )
                            .setColor('#FF0000')
                            .setTimestamp()
                    ]
                });
            } catch (error) {
                // User has DMs disabled
            }

            await member.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setTitle('👢 User Kicked')
                .setDescription(
                    `**User:** ${user.tag}\n` +
                    `**Moderator:** ${interaction.user.tag}\n` +
                    `**Reason:** ${reason}`
                )
                .setColor('#FF0000')
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });

            // Log to moderation channel
            if (config.moderationLogChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.moderationLogChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [kickEmbed] });
                }
            }

        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to kick user. Make sure I have the proper permissions.',
                ephemeral: true
            });
        }
    }
};
