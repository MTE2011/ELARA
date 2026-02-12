const logger = require('../utils/logger');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Ignore DMs
        if (!message.guild) return;

        const config = client.db.getServerConfig(message.guild.id);
        const prefix = config.prefix || client.config.prefix || '!';

        // Anti-Link System
        if (config.antiLinkEnabled) {
            await handleAntiLink(message, config, client);
        }

        // Leveling System
        if (config.levelingEnabled) {
            await handleLeveling(message, config, client);
        }

        // Prefix Command Handling
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || 
                        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // Check if command is owner-only
        if (command.ownerOnly && message.author.id !== client.config.ownerId) {
            return message.reply('❌ This command is only available to the bot owner.');
        }

        // Check permissions
        if (command.permissions) {
            if (!message.member.permissions.has(command.permissions)) {
                return message.reply('❌ You do not have permission to use this command.');
            }
        }

        // Cooldown handling
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏳ Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.data.name}\` again.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            // Execute command (using a common execute function or prefix-specific one)
            if (command.executePrefix) {
                await command.executePrefix(message, args, client);
            } else {
                // Fallback to execute if executePrefix is not defined
                // Note: This might need adjustment based on how commands are written
                await command.execute(message, client, args);
            }
            logger.debug(`${message.author.tag} executed prefix command ${prefix}${commandName} in ${message.guild.name}`);
        } catch (error) {
            logger.error(`Error executing prefix command ${commandName}:`, error);
            message.reply('❌ There was an error executing this command.');
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
