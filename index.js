const config = require('./config');
const logger = require('./utils/logger');

// Validate required environment variables
if (!config.token) {
    logger.error('DISCORD_TOKEN is not set in .env file');
    process.exit(1);
}

if (!config.ownerId) {
    logger.error('OWNER_ID is not set in .env file');
    process.exit(1);
}

logger.info('Starting Elara Discord Bot...');
logger.info(`Environment: ${config.nodeEnv}`);
logger.info(`Log Level: ${config.logLevel}`);

// Import and start the main bot
require('./blue');
