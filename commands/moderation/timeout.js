const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    permissions: PermissionFlagsBits.ModerateMembers,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.moderationEnabled) {
            return interaction.reply({
                content: '❌ Moderation system is not enabled on this server.',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
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
                content: '❌ You cannot timeout yourself.',
                ephemeral: true
            });
        }

        if (member.id === client.user.id) {
            return interaction.reply({
                content: '❌ I cannot timeout myself.',
                ephemeral: true
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: '❌ You cannot timeout this user (role hierarchy).',
                ephemeral: true
            });
        }

        if (duration < 1 || duration > 40320) { // Max 28 days
            return interaction.reply({
                content: '❌ Duration must be between 1 minute and 28 days (40320 minutes).',
                ephemeral: true
            });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);

            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏱️ User Timed Out')
                .setDescription(
                    `**User:** ${user.tag}\n` +
                    `**Moderator:** ${interaction.user.tag}\n` +
                    `**Duration:** ${duration} minutes\n` +
                    `**Reason:** ${reason}`
                )
                .setColor('#FF6B6B')
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });

            // Try to DM user
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('⏱️ You have been timed out')
                            .setDescription(
                                `You have been timed out in **${interaction.guild.name}**\n\n` +
                                `**Duration:** ${duration} minutes\n` +
                                `**Reason:** ${reason}\n` +
                                `**Moderator:** ${interaction.user.tag}`
                            )
                            .setColor('#FF6B6B')
                            .setTimestamp()
                    ]
                });
            } catch (error) {
                // User has DMs disabled
            }

            // Log to moderation channel
            if (config.moderationLogChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.moderationLogChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [timeoutEmbed] });
                }
            }

        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to timeout user. Make sure I have the proper permissions.',
                ephemeral: true
            });
        }
    }
};
