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
        await this.addRule(interaction, rule, client);
    },

    async executePrefix(message, args, client) {
        const rule = args.join(' ');
        if (!rule) {
            return message.reply('❌ Usage: `rules-add <rule text>`');
        }
        await this.addRule(message, rule, client);
    },

    async addRule(context, rule, client) {
        const guildId = context.guild.id;
        const config = client.db.getServerConfig(guildId);

        const currentRules = config.rulesContent || [];
        currentRules.push(rule);

        client.db.updateServerConfig(guildId, {
            rulesContent: currentRules
        });

        const successMsg = `✅ Rule #${currentRules.length} has been added:\n> ${rule}`;
        if (context.reply) {
            await context.reply(successMsg);
        } else {
            await context.reply({ content: successMsg, ephemeral: true });
        }
    }
};
