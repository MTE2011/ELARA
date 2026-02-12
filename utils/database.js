const fs = require('fs');
const path = require('path');
const config = require('../config');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.configFile = path.join(this.dataDir, 'server-configs.json');
        this.ticketsFile = path.join(this.dataDir, 'tickets.json');
        this.warningsFile = path.join(this.dataDir, 'warnings.json');
        this.levelsFile = path.join(this.dataDir, 'levels.json');
        this.giveawaysFile = path.join(this.dataDir, 'giveaways.json');
        
        this.ensureDataFiles();
    }

    ensureDataFiles() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        const files = [
            this.configFile,
            this.ticketsFile,
            this.warningsFile,
            this.levelsFile,
            this.giveawaysFile
        ];

        files.forEach(file => {
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify({}, null, 2));
            }
        });
    }

    readData(file) {
        try {
            const data = fs.readFileSync(file, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${file}:`, error);
            return {};
        }
    }

    writeData(file, data) {
        try {
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing ${file}:`, error);
            return false;
        }
    }

    // Server Configuration Methods
    getServerConfig(guildId) {
        const configs = this.readData(this.configFile);
        return configs[guildId] || this.getDefaultConfig(guildId);
    }

    setServerConfig(guildId, configData) {
        const configs = this.readData(this.configFile);
        configs[guildId] = { ...this.getDefaultConfig(guildId), ...configData };
        return this.writeData(this.configFile, configs);
    }

    updateServerConfig(guildId, updates) {
        const configs = this.readData(this.configFile);
        const currentConfig = configs[guildId] || this.getDefaultConfig(guildId);
        configs[guildId] = { ...currentConfig, ...updates };
        return this.writeData(this.configFile, configs);
    }

    getDefaultConfig(guildId) {
        return {
            guildId: guildId,
            prefix: config.prefix,
            
            // Ticket System
            ticketEnabled: false,
            ticketCategoryId: null,
            ticketLogChannelId: null,
            ticketSupportRoleId: null,
            ticketCounter: 0,
            
            // Anti-Link System
            antiLinkEnabled: false,
            antiLinkWhitelist: [],
            antiLinkBypassRoles: [],
            antiLinkExcludedChannels: [],
            
            // Partnership System
            partnershipEnabled: false,
            partnershipChannelId: null,
            partnershipRoleId: null,
            partnershipRequirements: {
                minMembers: 100,
                requiresVerification: false
            },
            
            // Rules System
            rulesEnabled: false,
            rulesChannelId: null,
            rulesAcceptRoleId: null,
            rulesContent: [],
            
            // Welcome System
            welcomeEnabled: false,
            welcomeChannelId: null,
            welcomeMessage: 'Welcome {user} to {server}!',
            welcomeRoleId: null,
            welcomeDM: false,
            
            // Leave System
            leaveEnabled: false,
            leaveChannelId: null,
            leaveMessage: '{user} has left the server.',
            
            // Giveaway System
            giveawayEnabled: false,
            giveawayManagerRoleId: null,
            
            // Moderation System
            moderationEnabled: false,
            moderationLogChannelId: null,
            moderatorRoleId: null,
            autoModEnabled: false,
            
            // Leveling System
            levelingEnabled: false,
            levelingChannelId: null,
            levelRoles: [],
            xpPerMessage: 15,
            xpCooldown: 60,
            
            // Logging System
            loggingEnabled: false,
            logChannelId: null,
            logEvents: {
                messageDelete: true,
                messageEdit: true,
                memberJoin: true,
                memberLeave: true,
                roleUpdate: true,
                voiceStateUpdate: true
            },
            
            // General Settings
            embedColor: config.embedColor
        };
    }

    // Ticket Methods
    getTickets(guildId) {
        const tickets = this.readData(this.ticketsFile);
        return tickets[guildId] || {};
    }

    addTicket(guildId, channelId, ticketData) {
        const tickets = this.readData(this.ticketsFile);
        if (!tickets[guildId]) tickets[guildId] = {};
        tickets[guildId][channelId] = ticketData;
        return this.writeData(this.ticketsFile, tickets);
    }

    removeTicket(guildId, channelId) {
        const tickets = this.readData(this.ticketsFile);
        if (tickets[guildId] && tickets[guildId][channelId]) {
            delete tickets[guildId][channelId];
            return this.writeData(this.ticketsFile, tickets);
        }
        return false;
    }

    updateTicket(guildId, channelId, updates) {
        const tickets = this.readData(this.ticketsFile);
        if (tickets[guildId] && tickets[guildId][channelId]) {
            tickets[guildId][channelId] = { ...tickets[guildId][channelId], ...updates };
            return this.writeData(this.ticketsFile, tickets);
        }
        return false;
    }

    // Warning Methods
    getWarnings(guildId, userId) {
        const warnings = this.readData(this.warningsFile);
        if (!warnings[guildId]) return [];
        return warnings[guildId][userId] || [];
    }

    addWarning(guildId, userId, warningData) {
        const warnings = this.readData(this.warningsFile);
        if (!warnings[guildId]) warnings[guildId] = {};
        if (!warnings[guildId][userId]) warnings[guildId][userId] = [];
        warnings[guildId][userId].push(warningData);
        return this.writeData(this.warningsFile, warnings);
    }

    clearWarnings(guildId, userId) {
        const warnings = this.readData(this.warningsFile);
        if (warnings[guildId] && warnings[guildId][userId]) {
            warnings[guildId][userId] = [];
            return this.writeData(this.warningsFile, warnings);
        }
        return false;
    }

    // Level Methods
    getUserLevel(guildId, userId) {
        const levels = this.readData(this.levelsFile);
        if (!levels[guildId]) return { xp: 0, level: 0, messages: 0 };
        return levels[guildId][userId] || { xp: 0, level: 0, messages: 0 };
    }

    setUserLevel(guildId, userId, levelData) {
        const levels = this.readData(this.levelsFile);
        if (!levels[guildId]) levels[guildId] = {};
        levels[guildId][userId] = levelData;
        return this.writeData(this.levelsFile, levels);
    }

    getLeaderboard(guildId, limit = 10) {
        const levels = this.readData(this.levelsFile);
        if (!levels[guildId]) return [];
        
        const leaderboard = Object.entries(levels[guildId])
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
        
        return leaderboard;
    }

    // Giveaway Methods
    getGiveaways(guildId) {
        const giveaways = this.readData(this.giveawaysFile);
        return giveaways[guildId] || {};
    }

    addGiveaway(guildId, messageId, giveawayData) {
        const giveaways = this.readData(this.giveawaysFile);
        if (!giveaways[guildId]) giveaways[guildId] = {};
        giveaways[guildId][messageId] = giveawayData;
        return this.writeData(this.giveawaysFile, giveaways);
    }

    removeGiveaway(guildId, messageId) {
        const giveaways = this.readData(this.giveawaysFile);
        if (giveaways[guildId] && giveaways[guildId][messageId]) {
            delete giveaways[guildId][messageId];
            return this.writeData(this.giveawaysFile, giveaways);
        }
        return false;
    }

    updateGiveaway(guildId, messageId, updates) {
        const giveaways = this.readData(this.giveawaysFile);
        if (giveaways[guildId] && giveaways[guildId][messageId]) {
            giveaways[guildId][messageId] = { ...giveaways[guildId][messageId], ...updates };
            return this.writeData(this.giveawaysFile, giveaways);
        }
        return false;
    }
}

module.exports = new Database();
