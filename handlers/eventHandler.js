const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    let eventCount = 0;

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        
        try {
            const event = require(filePath);

            // Validate event structure
            if (!event.name || !event.execute) {
                logger.warn(`Event at ${filePath} is missing required "name" or "execute" property`);
                continue;
            }

            // Register event
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            eventCount++;
            logger.debug(`Loaded event: ${event.name} from ${file}`);

        } catch (error) {
            logger.error(`Error loading event from ${filePath}:`, error);
        }
    }

    logger.info(`Successfully loaded ${eventCount} events`);
};
