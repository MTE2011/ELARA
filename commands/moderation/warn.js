const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
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
                content: '❌ You cannot warn yourself.',
                ephemeral: true
            });
        }

        if (member.id === client.user.id) {
            return interaction.reply({
                content: '❌ I cannot warn myself.',
                ephemeral: true
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: '❌ You cannot warn this user (role hierarchy).',
                ephemeral: true
            });
        }

        // Add warning
        client.db.addWarning(interaction.guild.id, user.id, {
            reason: reason,
            moderator: interaction.user.id,
            timestamp: Date.now()
        });

        const warnings = client.db.getWarnings(interaction.guild.id, user.id);

        const warnEmbed = new EmbedBuilder()
            .setTitle('⚠️ User Warned')
            .setDescription(
                `**User:** ${user.tag}\n` +
                `**Moderator:** ${interaction.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Total Warnings:** ${warnings.length}`
            )
            .setColor('#FFA500')
            .setTimestamp();

        await interaction.reply({ embeds: [warnEmbed] });

        // Try to DM user
        try {
            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('⚠️ You have been warned')
                        .setDescription(
                            `You have been warned in **${interaction.guild.name}**\n\n` +
                            `**Reason:** ${reason}\n` +
                            `**Moderator:** ${interaction.user.tag}\n` +
                            `**Total Warnings:** ${warnings.length}`
                        )
                        .setColor('#FFA500')
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
                await logChannel.send({ embeds: [warnEmbed] });
            }
        }
    }
};
