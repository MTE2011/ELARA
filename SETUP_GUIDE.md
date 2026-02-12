# 🌙 Elara - Complete Setup Guide

This guide will walk you through setting up every feature of Elara step by step.

## 📋 Prerequisites

Before you begin, make sure:
- ✅ Elara is invited to your server
- ✅ Elara's role is positioned high in the role hierarchy
- ✅ Elara has Administrator permission (or required permissions)
- ✅ You have Administrator permission in the server

## 🎫 Ticket System Setup

The ticket system allows users to create private support tickets.

### Step 1: Create a Category
1. Create a new category in your server called "Tickets" (or any name you prefer)
2. Set permissions so that `@everyone` cannot view this category
3. Make sure Elara can view and manage channels in this category

### Step 2: Configure Ticket Settings
```
/set ticket-category <select your ticket category>
/set ticket-log-channel <select a channel for ticket logs>
/set ticket-support-role <select your support team role>
/set ticket-enabled true
```

### Step 3: Create Ticket Panel
```
/ticket-setup <select the channel where users can create tickets>
```

This will send a panel with a button. Users click the button to create tickets.

### How It Works
- User clicks "Create Ticket" button
- A private channel is created in the ticket category
- Only the user, support role, and Elara can see it
- Staff can claim the ticket
- Anyone with permission can close the ticket
- Transcript is saved to the log channel when closed

---

## 🔗 Anti-Link System Setup

The anti-link system automatically removes Discord invites and unauthorized links.

### Step 1: Enable Anti-Link
```
/set antilink-enabled true
```

### Step 2: Configure (Advanced)
To configure whitelist, bypass roles, and excluded channels, you need to manually edit the server configuration in `data/server-configs.json`:

```json
{
  "your-server-id": {
    "antiLinkEnabled": true,
    "antiLinkWhitelist": ["youtube.com", "twitter.com"],
    "antiLinkBypassRoles": ["role-id-1", "role-id-2"],
    "antiLinkExcludedChannels": ["channel-id-1", "channel-id-2"]
  }
}
```

### How It Works
- Detects Discord invite links (discord.gg, discord.com/invite)
- Detects external links
- Checks against whitelist
- Checks if user has bypass role
- Checks if channel is excluded
- Deletes message if violation found
- Adds warning to user's record

---

## 🤝 Partnership System Setup

The partnership system allows users to submit partnership requests.

### Step 1: Create Partnership Channel
Create a channel where partnership requests will be posted (e.g., #partnerships)

### Step 2: Configure Partnership Settings
```
/set partnership-channel <select your partnership channel>
/set partnership-enabled true
```

### Step 3: (Optional) Set Partnership Role
If you want to ping a specific role when partnerships are submitted:
```
# You'll need to manually add this to the config file:
"partnershipRoleId": "your-role-id-here"
```

### Step 4: (Optional) Set Requirements
Edit `data/server-configs.json` to set minimum member requirements:
```json
{
  "partnershipRequirements": {
    "minMembers": 100,
    "requiresVerification": false
  }
}
```

### How It Works
- Users run `/partner` command
- They fill in server name, invite link, member count, and description
- Bot checks if they meet minimum member requirement
- Partnership request is posted to the partnership channel
- Staff can review and respond

---

## 📜 Rules System Setup

The rules system displays server rules and gives users a role after accepting them.

### Step 1: Add Your Rules
```
/rules-add Be respectful to all members
/rules-add No spamming or advertising
/rules-add Follow Discord's Terms of Service
/rules-add No NSFW content outside designated channels
/rules-add Listen to staff members
```

Repeat this command for each rule you want to add.

### Step 2: Create Rules Acceptance Role
1. Create a role called "Member" or "Verified" (or any name)
2. Set up your server so that users without this role cannot chat

### Step 3: Configure Rules Settings
```
/set rules-role <select the role to give after accepting>
/set rules-enabled true
```

### Step 4: Post Rules Panel
```
/rules-setup <select the channel for rules>
```

### How It Works
- New members see the rules
- They click "Accept Rules" button
- They receive the configured role
- They can now access the server

---

## 👋 Welcome & Leave System Setup

### Welcome System

### Step 1: Create Welcome Channel
Create a channel for welcome messages (e.g., #welcome)

### Step 2: Configure Welcome Settings
```
/set welcome-channel <select your welcome channel>
/set welcome-enabled true
```

### Step 3: (Optional) Customize Welcome Message
Edit `data/server-configs.json`:
```json
{
  "welcomeMessage": "Welcome {user} to {server}! We now have {membercount} members! 🎉"
}
```

**Available placeholders:**
- `{user}` - Mentions the user
- `{username}` - User's username
- `{server}` - Server name
- `{membercount}` - Total member count

### Leave System

### Step 1: Create Leave Channel
Create a channel for leave messages (e.g., #goodbye)

### Step 2: Configure Leave Settings
```
/set leave-channel <select your leave channel>
/set leave-enabled true
```

### Step 3: (Optional) Customize Leave Message
Edit `data/server-configs.json`:
```json
{
  "leaveMessage": "{user} has left {server}. We now have {membercount} members."
}
```

---

## 🎉 Giveaway System Setup

### Step 1: Enable Giveaways
```
/set giveaway-enabled true
```

### Step 2: Start a Giveaway
```
/giveaway-start 
  prize: Nitro Classic
  duration: 60 (in minutes)
  winners: 1
  channel: <optional, defaults to current channel>
```

### How It Works
- Giveaway is posted with a button
- Users click the button to enter
- Bot automatically selects winners when time is up
- Winners are announced in the channel

---

## 🛡️ Moderation System Setup

### Step 1: Create Moderation Log Channel
Create a channel for moderation logs (e.g., #mod-logs)

### Step 2: Configure Moderation Settings
```
/set moderation-log-channel <select your mod log channel>
/set moderation-enabled true
```

### Step 3: Use Moderation Commands
```
/warn @user <reason>
/timeout @user <duration in minutes> <reason>
/kick @user <reason>
/ban @user <reason> <optional: delete-days>
```

### How It Works
- Moderators use commands to punish users
- Actions are logged to the mod log channel
- Users receive DMs with the reason (if DMs are enabled)
- Warning history is tracked per user

---

## 📊 Leveling System Setup

### Step 1: (Optional) Create Level-Up Channel
Create a dedicated channel for level-up messages (e.g., #level-ups)

If you skip this, level-up messages will appear in the channel where the user leveled up.

### Step 2: Configure Leveling Settings
```
/set leveling-channel <select your level-up channel> (optional)
/set leveling-enabled true
```

### Step 3: (Optional) Configure Level Roles
Edit `data/server-configs.json` to add level-based role rewards:
```json
{
  "levelRoles": [
    { "level": 5, "roleId": "role-id-for-level-5" },
    { "level": 10, "roleId": "role-id-for-level-10" },
    { "level": 20, "roleId": "role-id-for-level-20" }
  ]
}
```

### Step 4: (Optional) Adjust XP Settings
Edit `data/server-configs.json`:
```json
{
  "xpPerMessage": 15,
  "xpCooldown": 60
}
```

### How It Works
- Users gain XP by sending messages
- XP cooldown prevents spam
- Users level up when they reach XP thresholds
- Level-up messages are sent
- Level roles are automatically assigned
- Users can check `/rank` and `/leaderboard`

---

## 🔧 Additional Configuration

### Custom Embed Color
Edit `.env` file:
```env
EMBED_COLOR=#5865F2
```

Use any hex color code.

### Moderator Role
Edit `config.js`:
```javascript
permissions: {
    moderator: 'Moderator', // Role name for moderators
    admin: 'ADMINISTRATOR'
}
```

---

## ✅ Final Checklist

After setup, verify:

- [ ] Ticket system creates channels correctly
- [ ] Anti-link deletes unauthorized links
- [ ] Partnership command works
- [ ] Rules panel gives roles when accepted
- [ ] Welcome messages appear when users join
- [ ] Giveaways can be created and entered
- [ ] Moderation commands work and log properly
- [ ] Users gain XP and level up
- [ ] All commands respond correctly
- [ ] Bot has proper permissions in all channels

---

## 🆘 Troubleshooting

### "Missing Permissions" Error
- Check that Elara's role is above the roles it needs to manage
- Grant Elara the Administrator permission
- Or manually grant specific permissions (Manage Channels, Manage Roles, etc.)

### Ticket Channels Not Creating
- Verify the ticket category exists
- Check that Elara has "Manage Channels" permission in the category
- Ensure ticket system is enabled

### Level-Up Messages Not Appearing
- Verify leveling is enabled
- Check that Elara has "Send Messages" permission
- Users need to wait for the XP cooldown between messages

### Commands Not Working
- Run `node deploy-commands.js` to register commands
- Wait up to 1 hour for commands to appear globally
- Restart Discord if needed

---

## 📞 Need More Help?

1. Check `/guide` in Discord
2. Review the main README.md
3. Check console logs for errors
4. Contact the bot developer

---

**Happy managing with Elara! 🌙**
