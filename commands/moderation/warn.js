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
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        await this.warn(interaction, user, reason, client);
    },

    async executePrefix(message, args, client) {
        const userMention = args[0];
        const reason = args.slice(1).join(' ');

        if (!userMention || !reason) {
            return message.reply('❌ Usage: `warn <@user> <reason>`');
        }

        const userId = userMention.replace(/[<@!>]/g, '');
        const user = await client.users.fetch(userId).catch(() => null);

        if (!user) {
            return message.reply('❌ Invalid user provided.');
        }

        await this.warn(message, user, reason, client);
    },

    async warn(context, user, reason, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.moderationEnabled) {
            const msg = '❌ Moderation system is not enabled on this server.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const member = context.guild.members.cache.get(user.id);
        if (!member) {
            const msg = '❌ User not found in this server.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const moderator = context.member || context.author;
        const moderatorId = moderator.id;

        if (member.id === moderatorId) {
            const msg = '❌ You cannot warn yourself.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        if (member.roles.highest.position >= context.member.roles.highest.position && context.guild.ownerId !== moderatorId) {
            const msg = '❌ You cannot warn this user (role hierarchy).';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        // Add warning
        client.db.addWarning(guildId, user.id, {
            reason: reason,
            moderator: moderatorId,
            timestamp: Date.now()
        });

        const warnings = client.db.getWarnings(guildId, user.id);

        const warnEmbed = new EmbedBuilder()
            .setTitle('⚠️ User Warned')
            .setDescription(
                `**User:** ${user.tag}\n` +
                `**Moderator:** ${moderator.user ? moderator.user.tag : moderator.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Total Warnings:** ${warnings.length}`
            )
            .setColor('#FFA500')
            .setTimestamp();

        if (context.reply) {
            await context.reply({ embeds: [warnEmbed] });
        } else {
            await context.reply({ embeds: [warnEmbed] });
        }

        // Try to DM user
        try {
            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('⚠️ You have been warned')
                        .setDescription(
                            `You have been warned in **${context.guild.name}**\n\n` +
                            `**Reason:** ${reason}\n` +
                            `**Moderator:** ${moderator.user ? moderator.user.tag : moderator.tag}\n` +
                            `**Total Warnings:** ${warnings.length}`
                        )
                        .setColor('#FFA500')
                        .setTimestamp()
                ]
            });
        } catch (error) {}

        // Log to moderation channel
        if (config.moderationLogChannelId) {
            const logChannel = context.guild.channels.cache.get(config.moderationLogChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [warnEmbed] });
            }
        }
    }
};
