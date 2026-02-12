# 🌙 Elara Discord Bot - Project Summary

## Overview

Elara is a comprehensive Discord management bot built with Discord.js v14, featuring a modular architecture and extensive customization options. The bot is designed for medium to large Discord servers and includes all essential management features.

## Architecture

### Core Structure

The bot follows a modular, event-driven architecture with clear separation of concerns:

- **index.js** - Entry point that validates environment variables and loads the main bot
- **blue.js** - Main bot file that initializes the Discord client, loads handlers, and manages the bot lifecycle
- **config.js** - Centralized configuration loader from environment variables
- **handlers/** - Command and event loaders that automatically discover and register modules
- **commands/** - Slash commands organized by category (tickets, moderation, partnership, etc.)
- **events/** - Discord.js event handlers (ready, interactionCreate, messageCreate, etc.)
- **utils/** - Utility modules (database, logger)
- **data/** - JSON-based data storage for server configurations and user data

### Key Design Decisions

1. **Modular Command System**: Commands are organized by category in separate folders, making it easy to add, remove, or modify features without affecting other parts of the bot.

2. **Per-Server Configuration**: Each server has its own configuration stored in JSON files, allowing the bot to work differently in different servers.

3. **JSON Storage**: Uses JSON files for data storage by default, making it easy to deploy without external database dependencies. Can be extended to MongoDB for production use.

4. **Event-Driven Architecture**: All bot functionality is driven by Discord events, ensuring efficient resource usage and scalability.

5. **Comprehensive Error Handling**: All commands and events include try-catch blocks and proper error responses to prevent crashes.

## Features Implemented

### 1. Ticket System
- Button-based ticket creation with customizable panel
- Private ticket channels with proper permissions
- Ticket claiming system for support staff
- Automatic transcript generation
- Ticket logging to dedicated channels
- Close/reopen functionality

**Files:**
- `commands/tickets/ticket-setup.js`
- `handlers/buttons/ticketCreate.js`
- `handlers/buttons/ticketClose.js`
- `handlers/buttons/ticketClaim.js`

### 2. Anti-Link System
- Automatic detection of Discord invites
- Detection of external links
- Whitelist support for approved domains
- Role-based bypass system
- Channel exclusion support
- Integration with warning system

**Files:**
- `events/messageCreate.js` (handleAntiLink function)

### 3. Partnership System
- `/partner` command for partnership requests
- Customizable minimum member requirements
- Partnership embed with server information
- Role ping support for partnership team
- Cooldown system to prevent spam

**Files:**
- `commands/partnership/partner.js`

### 4. Rules System
- `/rules-add` command to add rules
- `/rules-setup` command to post rules panel
- Button-based rule acceptance
- Automatic role assignment after acceptance
- Easy rule management

**Files:**
- `commands/rules/rules-add.js`
- `commands/rules/rules-setup.js`
- `handlers/buttons/rulesAccept.js`

### 5. Welcome & Leave System
- Customizable welcome messages with placeholders
- Customizable leave messages
- Auto-role assignment on join
- Optional welcome DMs
- Embed-based messages with user avatars

**Files:**
- `events/guildMemberAdd.js`
- `events/guildMemberRemove.js`

### 6. Giveaway System
- `/giveaway-start` command to create giveaways
- Button-based entry system
- Multiple winners support
- Automatic winner selection
- Scheduled giveaway endings
- Duplicate entry prevention

**Files:**
- `commands/giveaway/giveaway-start.js`
- `handlers/buttons/giveawayEnter.js`

### 7. Moderation System
- `/warn` - Warn users with reason tracking
- `/timeout` - Timeout users for specified duration
- `/kick` - Kick users from server
- `/ban` - Ban users with message deletion options
- Warning history system
- Moderation logging
- DM notifications to punished users

**Files:**
- `commands/moderation/warn.js`
- `commands/moderation/timeout.js`
- `commands/moderation/kick.js`
- `commands/moderation/ban.js`

### 8. Leveling System
- XP gain per message with cooldown
- Automatic level calculation
- Level-up notifications
- `/rank` command to check user level
- `/leaderboard` command to view top users
- Level-based role rewards
- Customizable XP rates

**Files:**
- `commands/leveling/rank.js`
- `commands/leveling/leaderboard.js`
- `events/messageCreate.js` (handleLeveling function)

### 9. Utility Commands
- `/help` - Comprehensive help menu
- `/ping` - Bot and API latency
- `/serverinfo` - Server statistics
- `/userinfo` - User information
- `/embed` - Custom embed builder

**Files:**
- `commands/utility/help.js`
- `commands/utility/ping.js`
- `commands/utility/serverinfo.js`
- `commands/utility/userinfo.js`
- `commands/utility/embed.js`

### 10. Configuration System
- `/set` command with 18+ subcommands
- `/guide` command with setup instructions
- Per-server configuration storage
- Easy enable/disable for each feature
- Channel and role configuration

**Files:**
- `commands/config/set.js`
- `commands/config/guide.js`

## Technical Specifications

### Dependencies
- **discord.js** v14.14.1 - Discord API wrapper
- **dotenv** v16.4.1 - Environment variable management
- **mongoose** v8.1.1 - MongoDB support (optional)

### Environment Variables
- `DISCORD_TOKEN` - Bot token (required)
- `OWNER_ID` - Bot owner's Discord user ID (required)
- `CLIENT_ID` - Bot's client ID (required for command deployment)
- `PREFIX` - Default prefix for text commands (optional)
- `EMBED_COLOR` - Default embed color (optional)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

### Data Storage

All data is stored in JSON files in the `data/` directory:

- **server-configs.json** - Per-server configuration
- **tickets.json** - Active and closed tickets
- **warnings.json** - User warning history
- **levels.json** - User XP and level data
- **giveaways.json** - Active and ended giveaways

### Permissions Required

The bot requires the following permissions:
- Administrator (recommended for full functionality)
- Or individual permissions:
  - Manage Channels
  - Manage Roles
  - Kick Members
  - Ban Members
  - Moderate Members
  - Manage Messages
  - Read Message History
  - Send Messages
  - Embed Links
  - Attach Files
  - Use External Emojis

## File Structure

```
elara-bot/
├── commands/
│   ├── config/
│   │   ├── guide.js
│   │   └── set.js
│   ├── giveaway/
│   │   └── giveaway-start.js
│   ├── leveling/
│   │   ├── leaderboard.js
│   │   └── rank.js
│   ├── moderation/
│   │   ├── ban.js
│   │   ├── kick.js
│   │   ├── timeout.js
│   │   └── warn.js
│   ├── partnership/
│   │   └── partner.js
│   ├── rules/
│   │   ├── rules-add.js
│   │   └── rules-setup.js
│   ├── tickets/
│   │   └── ticket-setup.js
│   └── utility/
│       ├── embed.js
│       ├── help.js
│       ├── ping.js
│       ├── serverinfo.js
│       └── userinfo.js
├── events/
│   ├── guildCreate.js
│   ├── guildMemberAdd.js
│   ├── guildMemberRemove.js
│   ├── interactionCreate.js
│   ├── messageCreate.js
│   └── ready.js
├── handlers/
│   ├── buttons/
│   │   ├── giveawayEnter.js
│   │   ├── rulesAccept.js
│   │   ├── ticketClaim.js
│   │   ├── ticketClose.js
│   │   └── ticketCreate.js
│   ├── commandHandler.js
│   └── eventHandler.js
├── utils/
│   ├── database.js
│   └── logger.js
├── data/ (auto-created)
├── .env.example
├── .gitignore
├── blue.js
├── CHANGELOG.md
├── config.js
├── CONTRIBUTING.md
├── deploy-commands.js
├── index.js
├── LICENSE
├── package.json
├── PROJECT_SUMMARY.md
├── QUICKSTART.md
├── README.md
└── SETUP_GUIDE.md
```

## Documentation

### User Documentation
- **README.md** - Comprehensive overview, installation, and usage guide
- **QUICKSTART.md** - 5-minute quick start guide
- **SETUP_GUIDE.md** - Detailed step-by-step setup for each feature

### Developer Documentation
- **CONTRIBUTING.md** - Guidelines for developers
- **PROJECT_SUMMARY.md** - This file, technical overview
- **CHANGELOG.md** - Version history and changes

## Deployment

### Local Development
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run deploy
npm start
```

### Production Deployment
1. Set up a VPS or hosting service
2. Install Node.js 16.9.0 or higher
3. Clone the repository
4. Install dependencies
5. Configure environment variables
6. Deploy commands
7. Use a process manager (PM2, systemd) to keep the bot running

### Command Deployment
```bash
npm run deploy
```

This registers all slash commands globally. Commands may take up to 1 hour to appear in all servers.

## Security Considerations

1. **Environment Variables**: All sensitive data is stored in `.env` file which is gitignored
2. **Permission Checks**: All commands verify user permissions before execution
3. **Role Hierarchy**: Bot checks role hierarchy before moderation actions
4. **Input Validation**: User input is validated and sanitized
5. **Error Handling**: Errors are caught and logged without exposing internal details

## Performance

- **Event-driven**: Efficient resource usage with event-based architecture
- **Cooldowns**: Command cooldowns prevent spam and abuse
- **Caching**: Discord.js caching reduces API calls
- **Async/Await**: Non-blocking operations for better performance

## Scalability

- **Per-server Configuration**: Each server has independent settings
- **Modular Design**: Easy to add or remove features
- **Database Abstraction**: Can switch from JSON to MongoDB for larger deployments
- **Stateless**: Bot can be restarted without data loss

## Future Enhancements

Potential features for future versions:
- MongoDB integration for production scalability
- Auto-moderation (spam, caps, mass mentions detection)
- Voice channel logging
- Message edit/delete logging
- Custom command system
- Reaction roles
- Starboard system
- Music system
- Economy system
- Suggestion system with voting
- Advanced analytics and statistics

## Support

For issues, questions, or contributions:
- Check the documentation files
- Review the `/guide` command in Discord
- Check console logs for errors
- Contact the bot developer

## License

MIT License - See LICENSE file for details

---

**Elara v1.0.0** - Built with ❤️ for Discord communities
