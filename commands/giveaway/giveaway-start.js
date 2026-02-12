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
        const data = {
            prize: interaction.options.getString('prize'),
            duration: interaction.options.getInteger('duration'),
            winners: interaction.options.getInteger('winners'),
            channel: interaction.options.getChannel('channel') || interaction.channel
        };
        await this.start(interaction, data, client);
    },

    async executePrefix(message, args, client) {
        if (args.length < 3) {
            return message.reply('❌ Usage: `giveaway-start <prize> <duration_mins> <winners> [#channel]`');
        }

        const data = {
            prize: args[0],
            duration: parseInt(args[1]),
            winners: parseInt(args[2]),
            channel: message.guild.channels.cache.get(args[3]?.replace(/[<#>]/g, '')) || message.channel
        };

        if (isNaN(data.duration) || isNaN(data.winners)) {
            return message.reply('❌ Duration and winners must be numbers.');
        }

        await this.start(message, data, client);
    },

    async start(context, data, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.giveawayEnabled) {
            const msg = '❌ Giveaway system is not enabled. Use `set giveaway-enabled true` first.';
            return context.reply ? (context.ephemeral ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg)) : context.reply(msg);
        }

        if (data.duration < 1) {
            const msg = '❌ Duration must be at least 1 minute.';
            return context.reply ? (context.ephemeral ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg)) : context.reply(msg);
        }

        const endTime = Date.now() + (data.duration * 60 * 1000);
        const user = context.user || context.author;

        const giveawayEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(
                `**Prize:** ${data.prize}\n\n` +
                `**Winners:** ${data.winners}\n` +
                `**Ends:** <t:${Math.floor(endTime / 1000)}:R>\n` +
                `**Hosted by:** ${user}\n\n` +
                `Click the button below to enter!`
            )
            .setColor(config.embedColor)
            .setFooter({ text: `${data.winners} winner(s) | Ends` })
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
            const message = await data.channel.send({ embeds: [giveawayEmbed], components: [row] });

            // Save giveaway to database
            client.db.addGiveaway(guildId, message.id, {
                messageId: message.id,
                channelId: data.channel.id,
                prize: data.prize,
                winners: data.winners,
                endTime: endTime,
                hostId: user.id,
                entries: [],
                ended: false
            });

            const successMsg = `✅ Giveaway started in ${data.channel}!`;
            if (context.reply) {
                if (context.deferred || context.replied) {
                    await context.editReply({ content: successMsg });
                } else {
                    await context.reply({ content: successMsg, ephemeral: true });
                }
            }

            // Schedule giveaway end
            setTimeout(async () => {
                await endGiveaway(message.id, guildId, client);
            }, data.duration * 60 * 1000);

        } catch (error) {
            const errorMsg = '❌ Failed to start giveaway. Make sure I have permission to send messages in that channel.';
            if (context.reply) {
                if (context.deferred || context.replied) {
                    await context.editReply({ content: errorMsg });
                } else {
                    await context.reply({ content: errorMsg, ephemeral: true });
                }
            }
        }
    }
};

async function endGiveaway(messageId, guildId, client) {
    const giveaways = client.db.getGiveaways(guildId);
    const giveaway = giveaways ? giveaways[messageId] : null;
    
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
