require('dotenv').config();

module.exports = {
    // Bot Token (Required)
    token: process.env.DISCORD_TOKEN,
    
    // Bot Owner ID (Required)
    ownerId: process.env.OWNER_ID,
    
    // Default Prefix (Optional)
    prefix: process.env.PREFIX || '!',
    
    // MongoDB URI (Optional - falls back to JSON storage)
    mongoUri: process.env.MONGODB_URI || null,
    
    // Session Secret (Optional)
    sessionSecret: process.env.SESSION_SECRET || 'elara-default-secret',
    
    // Default Embed Color (Optional)
    embedColor: process.env.EMBED_COLOR || '#5865F2',
    
    // Environment (Optional)
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Log Level (Optional)
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // Bot Information
    botName: 'Elara',
    botVersion: '1.0.0',
    
    // Permissions
    permissions: {
        moderator: 'Moderator', // Role name for moderators
        admin: 'ADMINISTRATOR' // Permission flag for admins
    }
};
