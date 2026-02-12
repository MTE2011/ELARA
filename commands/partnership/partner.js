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
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.partnershipEnabled) {
            return interaction.reply({
                content: '❌ Partnership system is not enabled on this server.',
                ephemeral: true
            });
        }

        if (!config.partnershipChannelId) {
            return interaction.reply({
                content: '❌ Partnership channel is not configured. Please contact an administrator.',
                ephemeral: true
            });
        }

        const serverName = interaction.options.getString('server-name');
        const inviteLink = interaction.options.getString('invite-link');
        const memberCount = interaction.options.getInteger('member-count');
        const description = interaction.options.getString('description');

        // Validate invite link
        if (!inviteLink.includes('discord.gg/') && !inviteLink.includes('discord.com/invite/')) {
            return interaction.reply({
                content: '❌ Please provide a valid Discord invite link.',
                ephemeral: true
            });
        }

        // Check minimum member requirement
        if (memberCount < config.partnershipRequirements.minMembers) {
            return interaction.reply({
                content: `❌ Your server must have at least ${config.partnershipRequirements.minMembers} members to partner.`,
                ephemeral: true
            });
        }

        const partnershipChannel = interaction.guild.channels.cache.get(config.partnershipChannelId);
        if (!partnershipChannel) {
            return interaction.reply({
                content: '❌ Partnership channel not found. Please contact an administrator.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const partnerEmbed = new EmbedBuilder()
                .setTitle(`🤝 Partnership Request: ${serverName}`)
                .setDescription(description)
                .addFields(
                    { name: '👥 Members', value: memberCount.toString(), inline: true },
                    { name: '🔗 Invite', value: `[Join Server](${inviteLink})`, inline: true },
                    { name: '📝 Submitted by', value: `${interaction.user.tag}`, inline: true }
                )
                .setColor(config.embedColor)
                .setTimestamp()
                .setFooter({ text: `Partnership Request • ${serverName}` });

            const message = await partnershipChannel.send({
                content: config.partnershipRoleId ? `<@&${config.partnershipRoleId}>` : '',
                embeds: [partnerEmbed]
            });

            await interaction.editReply({
                content: '✅ Your partnership request has been submitted! Our team will review it soon.'
            });

        } catch (error) {
            await interaction.editReply({
                content: '❌ Failed to submit partnership request. Please try again later.'
            });
        }
    }
};
