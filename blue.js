const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const database = require('./utils/database');

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();
client.config = config;
client.db = database;

// Load command handler
const commandHandler = require('./handlers/commandHandler');
commandHandler(client);

// Load event handler
const eventHandler = require('./handlers/eventHandler');
eventHandler(client);

// Error handling
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', error);
});

// Login to Discord
client.login(config.token)
    .then(() => {
        logger.info('Bot login initiated');
    })
    .catch(error => {
        logger.error('Failed to login:', error);
        process.exit(1);
    });

module.exports = client;
