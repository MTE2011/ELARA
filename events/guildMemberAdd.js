const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const config = client.db.getServerConfig(member.guild.id);

        // Welcome System
        if (config.welcomeEnabled && config.welcomeChannelId) {
            const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
            
            if (welcomeChannel) {
                try {
                    // Replace placeholders
                    let welcomeMessage = config.welcomeMessage
                        .replace(/@user/g, member.toString())
                        .replace(/@svname/g, member.guild.name)
                        .replace(/@count/g, member.guild.memberCount.toString())
                        .replace(/@time/g, `<t:${Math.floor(Date.now() / 1000)}:F>`)
                        // Legacy support for old placeholders
                        .replace(/{user}/g, member.toString())
                        .replace(/{username}/g, member.user.username)
                        .replace(/{server}/g, member.guild.name)
                        .replace(/{membercount}/g, member.guild.memberCount.toString());

                    const welcomeEmbed = new EmbedBuilder()
                        .setTitle('👋 Welcome!')
                        .setDescription(welcomeMessage)
                        .setColor(config.embedColor)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Member #${member.guild.memberCount}` })
                        .setTimestamp();

                    await welcomeChannel.send({ embeds: [welcomeEmbed] });

                } catch (error) {
                    logger.error('Error sending welcome message:', error);
                }
            }
        }

        // Auto-role on join
        if (config.welcomeRoleId) {
            const role = member.guild.roles.cache.get(config.welcomeRoleId);
            if (role) {
                try {
                    await member.roles.add(role);
                    logger.debug(`Added welcome role to ${member.user.tag} in ${member.guild.name}`);
                } catch (error) {
                    logger.error('Error adding welcome role:', error);
                }
            }
        }

        // Welcome DM
        if (config.welcomeDM) {
            try {
                let dmMessage = config.welcomeMessage
                    .replace(/@user/g, member.user.username)
                    .replace(/@svname/g, member.guild.name)
                    .replace(/@count/g, member.guild.memberCount.toString())
                    .replace(/@time/g, `<t:${Math.floor(Date.now() / 1000)}:F>`)
                    // Legacy support
                    .replace(/{user}/g, member.user.username)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{membercount}/g, member.guild.memberCount.toString());

                await member.send({
                    content: `Welcome to **${member.guild.name}**!\n\n${dmMessage}`
                });
            } catch (error) {
                logger.debug('Could not send welcome DM (user has DMs disabled)');
            }
        }

        logger.info(`${member.user.tag} joined ${member.guild.name}`);
    }
};
