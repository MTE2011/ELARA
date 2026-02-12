const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules-add')
        .setDescription('Add a rule to the server rules')
        .addStringOption(option =>
            option.setName('rule')
                .setDescription('The rule to add')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const rule = interaction.options.getString('rule');
        const config = client.db.getServerConfig(interaction.guild.id);

        const currentRules = config.rulesContent || [];
        currentRules.push(rule);

        client.db.updateServerConfig(interaction.guild.id, {
            rulesContent: currentRules
        });

        await interaction.reply({
            content: `✅ Rule #${currentRules.length} has been added:\n> ${rule}`,
            ephemeral: true
        });
    }
};
