# 🤝 Contributing to Elara

Thank you for your interest in contributing to Elara! This document provides guidelines for developers who want to extend or modify the bot.

## 📁 Project Structure

Understanding the project structure is key to contributing effectively:

```
elara-bot/
├── commands/           # Slash commands (organized by category)
├── events/            # Discord.js event handlers
├── handlers/          # Loaders and processors
│   └── buttons/       # Button interaction handlers
├── utils/             # Utility modules
├── data/              # JSON data storage (gitignored)
├── index.js           # Entry point (validates env, loads blue.js)
├── blue.js            # Main bot file (client setup, initialization)
├── config.js          # Configuration loader from .env
└── deploy-commands.js # Command registration script
```

## 🔧 Adding a New Command

### Step 1: Create Command File

Create a new file in the appropriate category folder under `commands/`:

```javascript
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mycommand')
        .setDescription('Description of my command')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input description')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    permissions: PermissionFlagsBits.Administrator, // Optional
    cooldown: 5, // Optional cooldown in seconds
    ownerOnly: false, // Optional, set to true for owner-only commands
    
    async execute(interaction, client) {
        // Your command logic here
        await interaction.reply('Hello!');
    }
};
```

### Step 2: Deploy Commands

After creating a new command, run:
```bash
node deploy-commands.js
```

### Step 3: Test

Test your command in Discord to ensure it works as expected.

## 🎯 Adding a New Event Handler

Create a new file in the `events/` folder:

```javascript
const logger = require('../utils/logger');

module.exports = {
    name: 'eventName', // Discord.js event name
    once: false, // Set to true if this should only run once
    
    async execute(arg1, arg2, client) {
        // Your event logic here
        logger.info('Event triggered');
    }
};
```

The event handler will automatically load it on bot startup.

## 🔘 Adding a New Button Handler

Create a new file in `handlers/buttons/`:

```javascript
const logger = require('../../utils/logger');

module.exports = async (interaction, client) => {
    // Your button logic here
    await interaction.reply({
        content: 'Button clicked!',
        ephemeral: true
    });
};
```

Then register it in `events/interactionCreate.js`:

```javascript
const buttonHandlers = {
    'ticket_create': require('../handlers/buttons/ticketCreate'),
    'ticket_close': require('../handlers/buttons/ticketClose'),
    'my_new_button': require('../handlers/buttons/myNewButton'), // Add this
};
```

## 🗄️ Working with the Database

The database utility (`utils/database.js`) provides methods for managing server configurations and data.

### Reading Configuration
```javascript
const config = client.db.getServerConfig(guildId);
console.log(config.ticketEnabled);
```

### Updating Configuration
```javascript
client.db.updateServerConfig(guildId, {
    ticketEnabled: true,
    ticketCategoryId: 'category-id'
});
```

### Adding New Configuration Fields

1. Add default value in `utils/database.js` in the `getDefaultConfig()` method:
```javascript
getDefaultConfig(guildId) {
    return {
        // ... existing fields
        myNewFeature: false,
        myNewChannelId: null
    };
}
```

2. Add configuration option in `commands/config/set.js`:
```javascript
.addSubcommand(subcommand =>
    subcommand
        .setName('my-feature-enabled')
        .setDescription('Enable or disable my feature')
        .addBooleanOption(option => 
            option.setName('value')
                .setDescription('Enable or disable')
                .setRequired(true)))
```

3. Handle the subcommand in the execute function:
```javascript
case 'my-feature-enabled':
    updates.myNewFeature = interaction.options.getBoolean('value');
    break;
```

## 📝 Logging

Use the logger utility for consistent logging:

```javascript
const logger = require('../utils/logger');

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

Log levels can be controlled via the `LOG_LEVEL` environment variable.

## 🎨 Styling Guidelines

### Embeds
Always use the server's configured embed color:
```javascript
const config = client.db.getServerConfig(interaction.guild.id);

const embed = new EmbedBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .setColor(config.embedColor)
    .setTimestamp();
```

### Error Messages
Use consistent error message format:
```javascript
await interaction.reply({
    content: '❌ Error message here',
    ephemeral: true
});
```

### Success Messages
Use consistent success message format:
```javascript
await interaction.reply({
    content: '✅ Success message here',
    ephemeral: true
});
```

## 🧪 Testing

Before submitting changes:

1. **Test all affected commands** - Make sure your changes don't break existing functionality
2. **Test error cases** - Ensure proper error handling
3. **Test permissions** - Verify permission checks work correctly
4. **Check logs** - Look for any errors or warnings in console
5. **Test in multiple servers** - Ensure per-server configuration works

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` for a reason
2. **Validate user input** - Always validate and sanitize user input
3. **Check permissions** - Always verify user has required permissions
4. **Use ephemeral replies** - Use `ephemeral: true` for sensitive information
5. **Handle errors gracefully** - Never expose internal errors to users

## 📚 Useful Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🐛 Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages from console
- Discord.js version
- Node.js version

## 💡 Feature Requests

When requesting features:
- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Consider how it fits with existing features

## 📋 Code Style

- Use `const` and `let`, avoid `var`
- Use async/await instead of promises when possible
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure and patterns
- Use semicolons consistently

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All commands tested
- [ ] No console errors
- [ ] `.env` file configured correctly
- [ ] Commands deployed with `deploy-commands.js`
- [ ] Bot has proper permissions in server
- [ ] Database files backed up (if using JSON storage)
- [ ] Error handling implemented
- [ ] Logging configured appropriately

---

Thank you for contributing to Elara! 🌙
