# 🌙 Elara - Discord Management Bot

Elara is a powerful, feature-rich Discord bot designed to help you manage and automate your Discord server. With a clean, modular architecture and comprehensive features, Elara is perfect for medium to large servers.

## ✨ Features

### 🎫 Ticket System
- Button-based ticket creation
- Multiple ticket categories (Support, Report, Partnership, Application, Other)
- Ticket claiming system for staff
- Automatic ticket transcripts
- Ticket logging to dedicated channels
- Close, reopen, and delete tickets

### 🔗 Anti-Link Management
- Detect and remove Discord invites
- Detect and remove external links
- Whitelist specific domains
- Role-based bypass system
- Channel exclusion support
- Automatic warning system

### 🤝 Partnership System
- Partnership request command
- Customizable partnership requirements
- Partnership embed templates
- Role ping support
- Cooldown system to prevent spam

### 📜 Rules System
- Store and display server rules
- Button-based rule acceptance
- Auto-role assignment after accepting rules
- Easy rule management

### 👋 Welcome & Leave System
- Customizable welcome messages
- Customizable leave messages
- Support for placeholders (@user, @svname, @count, @time)
- Auto-role assignment on join
- Optional welcome DMs

### 🎉 Giveaway System
- Button-based giveaway entry
- Automatic winner selection
- Multiple winners support
- Scheduled giveaway endings
- Duplicate entry prevention

### 🛡️ Moderation System
- Warn, timeout, kick, and ban commands
- Warning history tracking
- Moderation logging
- Permission checks and role hierarchy

### 📊 Leveling System
- XP gain per message
- Customizable XP rates
- Level-up notifications
- Leaderboard system
- Level-based role rewards

### 🔧 Utility Commands
- Help menu with all commands
- Ping command for latency checking
- Server information command
- User information command
- Custom embed builder

### ⚙️ Configuration System
- Per-server settings
- Easy setup with `/set` command
- Enable/disable individual systems
- Comprehensive setup guide with `/guide`

## 📦 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- npm or pnpm
- A Discord bot token

### Step 1: Clone or Download

Download this bot to your local machine or server.

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your bot token and other settings:
```env
DISCORD_TOKEN=your_bot_token_here
OWNER_ID=your_discord_user_id_here
CLIENT_ID=your_bot_client_id_here
PREFIX=!
EMBED_COLOR=#5865F2
```

**How to get these values:**
- **DISCORD_TOKEN**: Go to [Discord Developer Portal](https://discord.com/developers/applications), select your application, go to "Bot" tab, and copy the token
- **OWNER_ID**: Enable Developer Mode in Discord (User Settings > Advanced), right-click your username, and select "Copy ID"
- **CLIENT_ID**: In Discord Developer Portal, go to "OAuth2" > "General" and copy "Client ID"

### Step 4: Deploy Slash Commands

Before running the bot, you need to register the slash commands:

```bash
node deploy-commands.js
```

This will register all commands globally. It may take up to an hour for commands to appear in all servers.

### Step 5: Invite the Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" > "URL Generator"
4. Select scopes: `bot` and `applications.commands`
5. Select bot permissions:
   - Administrator (recommended for full functionality)
   - Or select individual permissions as needed
6. Copy the generated URL and open it in your browser
7. Select your server and authorize the bot

### Step 6: Run the Bot

```bash
npm start
# or
node index.js
```

You should see:
```
[timestamp] INFO: Starting Elara Discord Bot...
[timestamp] INFO: Bot login initiated
[timestamp] INFO: ✓ Elara#1234 is now online!
```

## 🚀 Quick Setup Guide

Once the bot is in your server, follow these steps to set it up:

### 1. Use the Setup Guide
Run `/guide` to see a comprehensive setup guide for all systems.

### 2. Configure Each System

Example: Setting up the ticket system
```
/set ticket-category <your-ticket-category>
/set ticket-log-channel <your-log-channel>
/set ticket-support-role <your-support-role>
/set ticket-enabled true
/ticket-setup <channel-for-ticket-panel>
```

### 3. Test the Systems
Make sure to test each system after configuration to ensure everything works properly.

## 📚 Commands

### Ticket Commands
- `/ticket-setup` - Set up the ticket panel

### Partnership Commands
- `/partner` - Submit a partnership request

### Rules Commands
- `/rules-setup` - Post the rules acceptance panel
- `/rules-add` - Add a new rule

### Giveaway Commands
- `/giveaway-start` - Start a giveaway

### Moderation Commands
- `/warn` - Warn a member
- `/timeout` - Timeout a member
- `/kick` - Kick a member
- `/ban` - Ban a member

### Leveling Commands
- `/rank` - Check your rank and level
- `/leaderboard` - View the server leaderboard

### Configuration Commands
- `/set` - Configure bot settings
- `/guide` - View the setup guide

### Utility Commands
- `/help` - View all commands
- `/ping` - Check bot latency
- `/serverinfo` - View server information
- `/userinfo` - View user information
- `/embed` - Create a custom embed

## 🗂️ Project Structure

```
elara-bot/
├── commands/           # All slash commands organized by category
│   ├── tickets/       # Ticket system commands
│   ├── moderation/    # Moderation commands
│   ├── partnership/   # Partnership commands
│   ├── rules/         # Rules commands
│   ├── welcome/       # Welcome system commands
│   ├── giveaway/      # Giveaway commands
│   ├── leveling/      # Leveling commands
│   ├── utility/       # Utility commands
│   └── config/        # Configuration commands
├── events/            # Discord.js event handlers
├── handlers/          # Command and event loaders
│   └── buttons/       # Button interaction handlers
├── utils/             # Utility modules
│   ├── database.js    # Database handler
│   └── logger.js      # Logging utility
├── data/              # JSON data storage (auto-created)
├── index.js           # Entry point
├── blue.js            # Main bot file
├── config.js          # Configuration loader
├── deploy-commands.js # Command deployment script
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore file
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## 🔧 Configuration Details

All server-specific settings are stored in `data/server-configs.json`. Each server has its own configuration object.

### Configuration Options

The `/set` command allows you to configure:

- **Ticket System**: Category, log channel, support role, enabled status
- **Anti-Link System**: Enabled status, whitelist, bypass roles
- **Partnership System**: Channel, role, enabled status
- **Rules System**: Acceptance role, enabled status
- **Welcome System**: Channel, message, role, enabled status
- **Leave System**: Channel, message, enabled status
- **Giveaway System**: Enabled status
- **Moderation System**: Log channel, enabled status
- **Leveling System**: Channel, enabled status

## 🛠️ Troubleshooting

### Commands not showing up
- Make sure you ran `deploy-commands.js`
- Wait up to 1 hour for global commands to propagate
- Check that the bot has `applications.commands` scope

### Bot not responding to commands
- Check that the bot is online
- Verify the bot has proper permissions
- Check console for error messages

### Ticket system not working
- Ensure ticket category is set and exists
- Verify bot has permission to create channels in the category
- Check that ticket system is enabled with `/set ticket-enabled true`

### Permission errors
- Make sure the bot's role is above other roles in the server settings
- Grant the bot Administrator permission (recommended)
- Or manually grant required permissions for each feature

## 📝 Notes

- **Data Storage**: By default, the bot uses JSON file storage. For production use with multiple servers, consider implementing MongoDB support.
- **Permissions**: The bot requires Administrator permission for full functionality, or you can manually grant specific permissions.
- **Role Hierarchy**: Make sure the bot's role is positioned above roles it needs to manage.
- **Customization**: You can customize embed colors, messages, and other settings in the configuration.

## 🤝 Support

If you need help or have questions:
1. Check the `/guide` command in Discord
2. Review this README
3. Check the console logs for error messages
4. Contact the bot developer

## 📄 License

This project is licensed under the MIT License.

## 🎨 Theme

Elara uses a clean, modern, moonlight aesthetic with blue as the primary color. All embeds and messages maintain a professional, consistent style.

---

**Elara** - Your all-in-one Discord management solution 🌙
