# ⚡ Elara - Quick Start Guide

Get Elara up and running in 5 minutes!

## 🚀 Step 1: Install Dependencies

```bash
npm install
```

## 🔑 Step 2: Configure Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or select existing)
3. Go to "Bot" tab and copy the token
4. Go to "OAuth2" > "General" and copy the Client ID

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
DISCORD_TOKEN=your_bot_token_here
OWNER_ID=your_discord_user_id_here
CLIENT_ID=your_bot_client_id_here
```

**How to get your User ID:**
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your username
3. Click "Copy ID"

## 📝 Step 3: Deploy Commands

```bash
npm run deploy
```

Wait for confirmation message.

## 🤖 Step 4: Invite Bot to Server

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" > "URL Generator"
4. Select scopes: `bot` and `applications.commands`
5. Select permissions: `Administrator` (recommended)
6. Copy the generated URL
7. Open URL in browser and invite to your server

## ▶️ Step 5: Start the Bot

```bash
npm start
```

You should see:
```
[timestamp] INFO: ✓ Elara#1234 is now online!
```

## ⚙️ Step 6: Configure in Discord

In your Discord server, run:

```
/guide
```

This will show you how to set up each feature.

### Quick Setup Example (Ticket System):

1. Create a category called "Tickets"
2. Run these commands:
```
/set ticket-category <select category>
/set ticket-enabled true
/ticket-setup <select channel>
```

Done! Users can now create tickets.

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step setup of all features
- Use `/help` in Discord to see all commands

## 🆘 Troubleshooting

**Commands not showing up?**
- Wait up to 1 hour for global commands to appear
- Restart Discord
- Make sure you ran `npm run deploy`

**Bot not responding?**
- Check console for errors
- Verify bot token is correct
- Make sure bot has permissions in server

**Permission errors?**
- Make sure bot's role is above other roles
- Grant Administrator permission

## 🎉 You're Done!

Elara is now running! Use `/guide` in Discord for detailed setup instructions.

---

**Need help?** Check the full documentation in README.md and SETUP_GUIDE.md
