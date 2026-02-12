const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('View the setup guide for Elara')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);
        const prefix = config.prefix || client.config.prefix || '!';
        const embed = this.getGuideEmbed(interaction.guild, config, prefix);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async executePrefix(message, args, client) {
        const config = client.db.getServerConfig(message.guild.id);
        const prefix = config.prefix || client.config.prefix || '!';
        const embed = this.getGuideEmbed(message.guild, config, prefix);
        await message.reply({ embeds: [embed] });
    },

    getGuideEmbed(guild, config, prefix) {
        return new EmbedBuilder()
            .setTitle('🌙 Elara Setup Guide')
            .setDescription(
                `Welcome to Elara! Follow this guide to set up all the features. You can use prefix commands (e.g., \`${prefix}set\`) or slash commands.\n\n` +
                '**Getting Started:**\n' +
                `All configuration is done through the \`${prefix}set\` command. Only server owners or users with the Administrator permission can configure the bot.`
            )
            .setColor(config.embedColor)
            .addFields(
                {
                    name: '🎫 Ticket System Setup',
                    value: 
                        `1. Create a category for tickets\n` +
                        `2. \`${prefix}set ticket-category <category_id>\`\n` +
                        `3. \`${prefix}set ticket-log-channel <#channel>\`\n` +
                        `4. \`${prefix}set ticket-support-role <@role>\`\n` +
                        `5. \`${prefix}set ticket-enabled true\`\n` +
                        `6. \`${prefix}ticket-setup <#channel>\``,
                    inline: false
                },
                {
                    name: '📜 Rules System Setup',
                    value:
                        `1. \`${prefix}rules-add <rule_text>\` (repeat for each rule)\n` +
                        `2. \`${prefix}set rules-role <@role>\`\n` +
                        `3. \`${prefix}set rules-enabled true\`\n` +
                        `4. \`${prefix}rules-setup <#channel>\``,
                    inline: false
                },
                {
                    name: '👋 Welcome/Leave System Setup',
                    value:
                        `1. \`${prefix}set welcome-channel <#channel>\`\n` +
                        `2. \`${prefix}set welcome-enabled true\`\n` +
                        `3. \`${prefix}set leave-channel <#channel>\`\n` +
                        `4. \`${prefix}set leave-enabled true\``,
                    inline: false
                },
                {
                    name: '🛡️ Moderation System Setup',
                    value:
                        `1. \`${prefix}set moderation-log-channel <#channel>\`\n` +
                        `2. \`${prefix}set moderation-enabled true\`\n` +
                        `3. Use \`${prefix}warn\`, \`${prefix}timeout\`, \`${prefix}kick\`, \`${prefix}ban\``,
                    inline: false
                },
                {
                    name: '📊 Leveling System Setup',
                    value:
                        `1. \`${prefix}set leveling-channel <#channel>\`\n` +
                        `2. \`${prefix}set leveling-enabled true\`\n` +
                        `3. Check rank with \`${prefix}rank\``,
                    inline: false
                }
            )
            .setFooter({ text: `Use ${prefix}help to see all commands` })
            .setTimestamp();
    }
};
