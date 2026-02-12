const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('delete-days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    permissions: PermissionFlagsBits.BanMembers,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const deleteDays = interaction.options.getInteger('delete-days') || 0;
        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            if (member.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ You cannot ban yourself.',
                    ephemeral: true
                });
            }

            if (member.id === client.user.id) {
                return interaction.reply({
                    content: '❌ I cannot ban myself.',
                    ephemeral: true
                });
            }

            if (!member.bannable) {
                return interaction.reply({
                    content: '❌ I cannot ban this user (role hierarchy or permissions).',
                    ephemeral: true
                });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({
                    content: '❌ You cannot ban this user (role hierarchy).',
                    ephemeral: true
                });
            }
        }

        if (deleteDays < 0 || deleteDays > 7) {
            return interaction.reply({
                content: '❌ Delete days must be between 0 and 7.',
                ephemeral: true
            });
        }

        try {
            // Try to DM user before banning
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🔨 You have been banned')
                            .setDescription(
                                `You have been banned from **${interaction.guild.name}**\n\n` +
                                `**Reason:** ${reason}\n` +
                                `**Moderator:** ${interaction.user.tag}`
                            )
                            .setColor('#8B0000')
                            .setTimestamp()
                    ]
                });
            } catch (error) {
                // User has DMs disabled
            }

            await interaction.guild.members.ban(user.id, {
                reason: reason,
                deleteMessageSeconds: deleteDays * 24 * 60 * 60
            });

            const banEmbed = new EmbedBuilder()
                .setTitle('🔨 User Banned')
                .setDescription(
                    `**User:** ${user.tag}\n` +
                    `**Moderator:** ${interaction.user.tag}\n` +
                    `**Reason:** ${reason}\n` +
                    `**Messages Deleted:** ${deleteDays} days`
                )
                .setColor('#8B0000')
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });

            // Log to moderation channel
            if (config.moderationLogChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.moderationLogChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [banEmbed] });
                }
            }

        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to ban user. Make sure I have the proper permissions.',
                ephemeral: true
            });
        }
    }
};
