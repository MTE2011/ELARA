const logger = require('../../utils/logger');

module.exports = async (interaction, client) => {
    const config = client.db.getServerConfig(interaction.guild.id);

    if (!config.rulesEnabled) {
        return interaction.reply({
            content: '❌ Rules system is not enabled on this server.',
            ephemeral: true
        });
    }

    if (!config.rulesAcceptRoleId) {
        return interaction.reply({
            content: '❌ Rules acceptance role is not configured. Please contact an administrator.',
            ephemeral: true
        });
    }

    const role = interaction.guild.roles.cache.get(config.rulesAcceptRoleId);
    if (!role) {
        return interaction.reply({
            content: '❌ Rules acceptance role not found. Please contact an administrator.',
            ephemeral: true
        });
    }

    // Check if user already has the role
    if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({
            content: '✅ You have already accepted the rules!',
            ephemeral: true
        });
    }

    try {
        await interaction.member.roles.add(role);
        
        await interaction.reply({
            content: '✅ Thank you for accepting the rules! You now have access to the server.',
            ephemeral: true
        });

        logger.info(`${interaction.user.tag} accepted rules in ${interaction.guild.name}`);

    } catch (error) {
        logger.error('Error adding rules role:', error);
        
        await interaction.reply({
            content: '❌ Failed to assign role. Please contact an administrator.',
            ephemeral: true
        });
    }
};
