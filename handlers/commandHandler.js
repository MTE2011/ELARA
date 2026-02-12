const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    let commandCount = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Skip if not a directory
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            
            try {
                const command = require(filePath);

                // Validate command structure
                if (!command.data || !command.execute) {
                    logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
                    continue;
                }

                // Set command to collection
                client.commands.set(command.data.name, command);
                commandCount++;
                logger.debug(`Loaded command: ${command.data.name} from ${folder}/${file}`);

            } catch (error) {
                logger.error(`Error loading command from ${filePath}:`, error);
            }
        }
    }

    logger.info(`Successfully loaded ${commandCount} commands`);
};
