const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-start')
        .setDescription('Start a giveaway')
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('What are you giving away?')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Number of winners')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to host the giveaway')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    permissions: PermissionFlagsBits.ManageGuild,
    
    async execute(interaction, client) {
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.giveawayEnabled) {
            return interaction.reply({
                content: '❌ Giveaway system is not enabled on this server.',
                ephemeral: true
            });
        }

        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        const winners = interaction.options.getInteger('winners');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (duration < 1) {
            return interaction.reply({
                content: '❌ Duration must be at least 1 minute.',
                ephemeral: true
            });
        }

        if (winners < 1) {
            return interaction.reply({
                content: '❌ There must be at least 1 winner.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const endTime = Date.now() + (duration * 60 * 1000);

        const giveawayEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(
                `**Prize:** ${prize}\n\n` +
                `**Winners:** ${winners}\n` +
                `**Ends:** <t:${Math.floor(endTime / 1000)}:R>\n` +
                `**Hosted by:** ${interaction.user}\n\n` +
                `Click the button below to enter!`
            )
            .setColor(config.embedColor)
            .setFooter({ text: `${winners} winner(s) | Ends` })
            .setTimestamp(endTime);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_enter')
                    .setLabel('Enter Giveaway')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary)
            );

        try {
            const message = await channel.send({ embeds: [giveawayEmbed], components: [row] });

            // Save giveaway to database
            client.db.addGiveaway(interaction.guild.id, message.id, {
                messageId: message.id,
                channelId: channel.id,
                prize: prize,
                winners: winners,
                endTime: endTime,
                hostId: interaction.user.id,
                entries: [],
                ended: false
            });

            await interaction.editReply({
                content: `✅ Giveaway started in ${channel}!`
            });

            // Schedule giveaway end
            setTimeout(async () => {
                await endGiveaway(message.id, interaction.guild.id, client);
            }, duration * 60 * 1000);

        } catch (error) {
            await interaction.editReply({
                content: '❌ Failed to start giveaway. Make sure I have permission to send messages in that channel.'
            });
        }
    }
};

async function endGiveaway(messageId, guildId, client) {
    const giveaway = client.db.getGiveaways(guildId)[messageId];
    
    if (!giveaway || giveaway.ended) return;

    try {
        const guild = client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(giveaway.channelId);
        const message = await channel.messages.fetch(messageId);

        if (giveaway.entries.length === 0) {
            const noWinnersEmbed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY ENDED 🎉')
                .setDescription(
                    `**Prize:** ${giveaway.prize}\n\n` +
                    `No valid entries. Giveaway cancelled.`
                )
                .setColor('#FF0000')
                .setTimestamp();

            await message.edit({ embeds: [noWinnersEmbed], components: [] });
            client.db.updateGiveaway(guildId, messageId, { ended: true });
            return;
        }

        // Select random winners
        const winnerCount = Math.min(giveaway.winners, giveaway.entries.length);
        const winners = [];
        const entriesCopy = [...giveaway.entries];

        for (let i = 0; i < winnerCount; i++) {
            const randomIndex = Math.floor(Math.random() * entriesCopy.length);
            winners.push(entriesCopy[randomIndex]);
            entriesCopy.splice(randomIndex, 1);
        }

        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

        const endEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY ENDED 🎉')
            .setDescription(
                `**Prize:** ${giveaway.prize}\n\n` +
                `**Winner(s):** ${winnerMentions}\n` +
                `**Hosted by:** <@${giveaway.hostId}>`
            )
            .setColor('#00FF00')
            .setTimestamp();

        await message.edit({ embeds: [endEmbed], components: [] });
        await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);

        client.db.updateGiveaway(guildId, messageId, { ended: true, winnerIds: winners });

    } catch (error) {
        console.error('Error ending giveaway:', error);
    }
}
