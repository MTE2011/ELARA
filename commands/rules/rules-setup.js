const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rules-setup")
        .setDescription("Post the rules acceptance panel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel to send the rules panel")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator,
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel("channel");
        await this.setup(interaction, channel, client);
    },

    async executePrefix(message, args, client) {
        const channelMention = args[0];
        const channelId = channelMention ? channelMention.replace(/[<#>]/g, "") : message.channel.id;
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            return message.reply("❌ Invalid channel provided.");
        }

        await this.setup(message, channel, client);
    },

    async setup(context, channel, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        if (!config.rulesEnabled) {
            const msg = "❌ Rules system is not enabled. Use `set rules-enabled true` first.";
            return context.reply ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
        }

        if (!config.rulesAcceptRoleId) {
            const msg = "❌ Rules acceptance role is not set. Use `set rules-role <role>` first.";
            return context.reply ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
        }

        const rules = config.rulesContent || [];
        if (rules.length === 0) {
            const msg = "❌ No rules have been added yet. Use `rules-add <rule>` to add some.";
            return context.reply ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
        }

        const rulesText = rules.map((rule, index) => `**${index + 1}.** ${rule}`).join("\n\n");

        const embed = new EmbedBuilder()
            .setTitle(`📜 ${context.guild.name} - Server Rules`)
            .setDescription(
                "Welcome to our server! Please read and accept the rules below to gain access to the rest of the channels.\n\n" +
                rulesText +
                "\n\nBy clicking the button below, you agree to follow all the rules listed above."
            )
            .setColor(config.embedColor)
            .setFooter({ text: "Failure to follow rules may result in moderation action" })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("rules_accept")
                    .setLabel("Accept Rules")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success)
            );

        try {
            await channel.send({ embeds: [embed], components: [row] });
            
            const successMsg = `✅ Rules panel has been sent to ${channel}`;
            if (context.reply) {
                if (context.ephemeral) {
                    await context.reply({ content: successMsg, ephemeral: true });
                } else {
                    await context.reply(successMsg);
                }
            }

        } catch (error) {
            const errorMsg = "❌ Failed to send rules panel. Make sure I have permission to send messages in that channel.";
            if (context.reply) {
                if (context.ephemeral) {
                    await context.reply({ content: errorMsg, ephemeral: true });
                } else {
                    await context.reply(errorMsg);
                }
            }
        }
    }
};
