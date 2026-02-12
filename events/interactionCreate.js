const { InteractionType, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`Command ${interaction.commandName} not found`);
                return;
            }

            // Check if command requires permissions
            if (command.permissions) {
                const member = interaction.member;
                
                if (!member.permissions.has(command.permissions)) {
                    return interaction.reply({
                        content: '❌ You do not have permission to use this command.',
                        ephemeral: true
                    });
                }
            }

            // Check if command is owner-only
            if (command.ownerOnly && interaction.user.id !== client.config.ownerId) {
                return interaction.reply({
                    content: '❌ This command is only available to the bot owner.',
                    ephemeral: true
                });
            }

            // Cooldown handling
            const { cooldowns } = client;

            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Map());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({
                        content: `⏳ Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.data.name}\` again.`,
                        ephemeral: true
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // Execute command
            try {
                await command.execute(interaction, client);
                logger.debug(`${interaction.user.tag} executed /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}:`, error);
                
                const errorMessage = {
                    content: '❌ There was an error executing this command.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // Handle button interactions
        if (interaction.isButton()) {
            const buttonHandlers = {
                'ticket_create': require('../handlers/buttons/ticketCreate'),
                'ticket_close': require('../handlers/buttons/ticketClose'),
                'ticket_claim': require('../handlers/buttons/ticketClaim'),
                'rules_accept': require('../handlers/buttons/rulesAccept'),
                'giveaway_enter': require('../handlers/buttons/giveawayEnter')
            };

            const handlerKey = Object.keys(buttonHandlers).find(key => 
                interaction.customId.startsWith(key)
            );

            if (handlerKey && buttonHandlers[handlerKey]) {
                try {
                    await buttonHandlers[handlerKey](interaction, client);
                } catch (error) {
                    logger.error(`Error handling button ${interaction.customId}:`, error);
                    
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: '❌ An error occurred while processing this action.',
                            ephemeral: true
                        });
                    }
                }
            }
        }

        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            // Handle select menu interactions here
            logger.debug(`Select menu interaction: ${interaction.customId}`);
        }

        // Handle modal submissions
        if (interaction.isModalSubmit()) {
            // Handle modal submissions here
            logger.debug(`Modal submission: ${interaction.customId}`);
        }
    }
};
