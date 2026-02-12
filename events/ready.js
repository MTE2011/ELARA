const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.info(`✓ ${client.user.tag} is now online!`);
        logger.info(`✓ Serving ${client.guilds.cache.size} servers`);
        logger.info(`✓ Monitoring ${client.users.cache.size} users`);

        // Set bot status
        client.user.setPresence({
            activities: [{
                name: 'your server | /help',
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        logger.info('Bot is ready and operational');
    }
};
