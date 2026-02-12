const logger = require('../utils/logger');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Ignore DMs
        if (!message.guild) return;

        const config = client.db.getServerConfig(message.guild.id);

        // Anti-Link System
        if (config.antiLinkEnabled) {
            await handleAntiLink(message, config, client);
        }

        // Leveling System
        if (config.levelingEnabled) {
            await handleLeveling(message, config, client);
        }
    }
};

async function handleAntiLink(message, config, client) {
    // Check if channel is excluded
    if (config.antiLinkExcludedChannels.includes(message.channel.id)) return;

    // Check if user has bypass role
    const hasBypassRole = config.antiLinkBypassRoles.some(roleId => 
        message.member.roles.cache.has(roleId)
    );
    if (hasBypassRole) return;

    // Check for Discord invites
    const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+/gi;
    const hasInvite = inviteRegex.test(message.content);

    // Check for links
    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    const links = message.content.match(linkRegex) || [];

    // Check if links are whitelisted
    const hasNonWhitelistedLink = links.some(link => {
        return !config.antiLinkWhitelist.some(whitelisted => link.includes(whitelisted));
    });

    if (hasInvite || hasNonWhitelistedLink) {
        try {
            await message.delete();
            
            const warning = await message.channel.send({
                content: `❌ ${message.author}, links are not allowed in this channel!`
            });

            setTimeout(() => warning.delete().catch(() => {}), 5000);

            // Add warning to user
            client.db.addWarning(message.guild.id, message.author.id, {
                reason: 'Posting unauthorized links',
                moderator: client.user.id,
                timestamp: Date.now()
            });

            logger.info(`Deleted link from ${message.author.tag} in ${message.guild.name}`);

        } catch (error) {
            logger.error('Error handling anti-link:', error);
        }
    }
}

async function handleLeveling(message, config, client) {
    const userId = message.author.id;
    const guildId = message.guild.id;

    // Check cooldown
    const cooldownKey = `${guildId}-${userId}`;
    if (client.cooldowns.has(cooldownKey)) {
        const lastMessage = client.cooldowns.get(cooldownKey);
        if (Date.now() - lastMessage < config.xpCooldown * 1000) return;
    }

    client.cooldowns.set(cooldownKey, Date.now());

    // Get user level data
    const userData = client.db.getUserLevel(guildId, userId);
    
    // Calculate XP gain (random between 10-20)
    const xpGain = Math.floor(Math.random() * 11) + 10;
    const newXp = userData.xp + xpGain;
    const newMessages = userData.messages + 1;

    // Calculate level
    const newLevel = Math.floor(0.1 * Math.sqrt(newXp));
    const oldLevel = userData.level;

    // Update user data
    client.db.setUserLevel(guildId, userId, {
        xp: newXp,
        level: newLevel,
        messages: newMessages
    });

    // Check for level up
    if (newLevel > oldLevel) {
        const levelUpMessage = `🎉 Congratulations ${message.author}! You've reached level **${newLevel}**!`;
        
        if (config.levelingChannelId) {
            const levelChannel = message.guild.channels.cache.get(config.levelingChannelId);
            if (levelChannel) {
                await levelChannel.send(levelUpMessage);
            }
        } else {
            await message.channel.send(levelUpMessage);
        }

        // Check for level roles
        for (const roleConfig of config.levelRoles) {
            if (newLevel >= roleConfig.level) {
                const role = message.guild.roles.cache.get(roleConfig.roleId);
                if (role && !message.member.roles.cache.has(role.id)) {
                    await message.member.roles.add(role).catch(() => {});
                }
            }
        }

        logger.info(`${message.author.tag} leveled up to ${newLevel} in ${message.guild.name}`);
    }
}
