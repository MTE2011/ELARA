const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules-setup')
        .setDescription('Set up the rules acceptance system')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to post rules')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const config = client.db.getServerConfig(interaction.guild.id);

        if (!config.rulesEnabled) {
            return interaction.reply({
                content: '❌ Rules system is not enabled. Use `/set rules-enabled true` first.',
                ephemeral: true
            });
        }

        if (!config.rulesContent || config.rulesContent.length === 0) {
            return interaction.reply({
                content: '❌ No rules have been set. Use `/rules-add` to add rules first.',
                ephemeral: true
            });
        }

        const rulesText = config.rulesContent
            .map((rule, index) => `**${index + 1}.** ${rule}`)
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('📜 Server Rules')
            .setDescription(
                `Please read and accept our server rules to gain access to the server.\n\n${rulesText}\n\n` +
                `By clicking "Accept Rules" below, you agree to follow all server rules.`
            )
            .setColor(config.embedColor)
            .setFooter({ text: 'Click the button below to accept the rules' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rules_accept')
                    .setLabel('Accept Rules')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            );

        try {
            await channel.send({ embeds: [embed], components: [row] });
            
            // Update config with rules channel
            client.db.updateServerConfig(interaction.guild.id, {
                rulesChannelId: channel.id
            });

            await interaction.reply({
                content: `✅ Rules have been posted to ${channel}`,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to post rules. Make sure I have permission to send messages in that channel.',
                ephemeral: true
            });
        }
    }
};
