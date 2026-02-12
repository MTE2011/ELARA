const logger = require('../../utils/logger');

module.exports = async (interaction, client) => {
    const giveaway = client.db.getGiveaways(interaction.guild.id)[interaction.message.id];

    if (!giveaway) {
        return interaction.reply({
            content: '❌ This giveaway no longer exists.',
            ephemeral: true
        });
    }

    if (giveaway.ended) {
        return interaction.reply({
            content: '❌ This giveaway has already ended.',
            ephemeral: true
        });
    }

    if (Date.now() > giveaway.endTime) {
        return interaction.reply({
            content: '❌ This giveaway has already ended.',
            ephemeral: true
        });
    }

    // Check if user already entered
    if (giveaway.entries.includes(interaction.user.id)) {
        return interaction.reply({
            content: '❌ You have already entered this giveaway!',
            ephemeral: true
        });
    }

    // Add user to entries
    giveaway.entries.push(interaction.user.id);
    client.db.updateGiveaway(interaction.guild.id, interaction.message.id, {
        entries: giveaway.entries
    });

    await interaction.reply({
        content: '✅ You have successfully entered the giveaway! Good luck! 🎉',
        ephemeral: true
    });

    logger.info(`${interaction.user.tag} entered giveaway in ${interaction.guild.name}`);
};
