const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Load all commands
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if (command.data) {
            commands.push(command.data.toJSON());
            console.log(`✓ Loaded command: ${command.data.name}`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);

        // Register commands globally
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE'),
            { body: commands },
        );

        console.log(`\n✓ Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('\nCommands registered:');
        data.forEach(cmd => console.log(`  - /${cmd.name}`));

    } catch (error) {
        console.error('\n❌ Error deploying commands:', error);
    }
})();
