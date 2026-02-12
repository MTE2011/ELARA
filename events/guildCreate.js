const logger = require('../utils/logger');

module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {
        logger.info(`Joined new server: ${guild.name} (${guild.id})`);
        logger.info(`Server has ${guild.memberCount} members`);

        // Initialize default configuration for the new server
        const defaultConfig = client.db.getDefaultConfig(guild.id);
        client.db.setServerConfig(guild.id, defaultConfig);

        logger.info(`Initialized configuration for ${guild.name}`);
    }
};
