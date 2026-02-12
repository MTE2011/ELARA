const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('Submit a partnership request')
        .addStringOption(option =>
            option.setName('server-name')
                .setDescription('Name of your server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('invite-link')
                .setDescription('Permanent invite link to your server')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('member-count')
                .setDescription('Number of members in your server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Brief description of your server')
                .setRequired(true)),
    
    cooldown: 3600, // 1 hour cooldown
    
    async execute(interaction, client) {
        const data = {
            serverName: interaction.options.getString('server-name'),
            inviteLink: interaction.options.getString('invite-link'),
            memberCount: interaction.options.getInteger('member-count'),
            description: interaction.options.getString('description')
        };
        await this.submit(interaction, data, client);
    },

    async executePrefix(message, args, client) {
        // Simple prefix parsing: partner "Server Name" "Invite" "Count" "Description"
        // Or just partner <name> <invite> <count> <desc...>
        if (args.length < 4) {
            return message.reply('❌ Usage: `partner <server-name> <invite-link> <member-count> <description>`');
        }

        const data = {
            serverName: args[0],
            inviteLink: args[1],
            memberCount: parseInt(args[2]),
            description: args.slice(3).join(' ')
        };

        if (isNaN(data.memberCount)) {
            return message.reply('❌ Member count must be a number.');
        }

        await this.submit(message, data, client);
    },

    async submit(context, data, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.partnershipEnabled) {
            const msg = '❌ Partnership system is not enabled on this server.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        if (!config.partnershipChannelId) {
            const msg = '❌ Partnership channel is not configured. Please contact an administrator.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        // Validate invite link
        if (!data.inviteLink.includes('discord.gg/') && !data.inviteLink.includes('discord.com/invite/')) {
            const msg = '❌ Please provide a valid Discord invite link.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        // Check minimum member requirement
        if (data.memberCount < config.partnershipRequirements.minMembers) {
            const msg = `❌ Your server must have at least ${config.partnershipRequirements.minMembers} members to partner.`;
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const partnershipChannel = context.guild.channels.cache.get(config.partnershipChannelId);
        if (!partnershipChannel) {
            const msg = '❌ Partnership channel not found. Please contact an administrator.';
            return context.reply ? context.reply(msg) : context.reply({ content: msg, ephemeral: true });
        }

        const user = context.user || context.author;

        try {
            const partnerEmbed = new EmbedBuilder()
                .setTitle(`🤝 Partnership Request: ${data.serverName}`)
                .setDescription(data.description)
                .addFields(
                    { name: '👥 Members', value: data.memberCount.toString(), inline: true },
                    { name: '🔗 Invite', value: `[Join Server](${data.inviteLink})`, inline: true },
                    { name: '📝 Submitted by', value: `${user.tag}`, inline: true }
                )
                .setColor(config.embedColor)
                .setTimestamp()
                .setFooter({ text: `Partnership Request • ${data.serverName}` });

            await partnershipChannel.send({
                content: config.partnershipRoleId ? `<@&${config.partnershipRoleId}>` : '',
                embeds: [partnerEmbed]
            });

            const successMsg = '✅ Your partnership request has been submitted! Our team will review it soon.';
            if (context.reply) {
                await context.reply(successMsg);
            } else {
                await context.reply({ content: successMsg, ephemeral: true });
            }

        } catch (error) {
            const errorMsg = '❌ Failed to submit partnership request. Please try again later.';
            if (context.reply) {
                await context.reply(errorMsg);
            } else {
                await context.reply({ content: errorMsg, ephemeral: true });
            }
        }
    }
};
