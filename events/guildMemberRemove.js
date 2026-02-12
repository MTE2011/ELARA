const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const config = client.db.getServerConfig(member.guild.id);

        // Leave System
        if (config.leaveEnabled && config.leaveChannelId) {
            const leaveChannel = member.guild.channels.cache.get(config.leaveChannelId);
            
            if (leaveChannel) {
                try {
                    // Replace placeholders
                    let leaveMessage = config.leaveMessage
                        .replace(/{user}/g, member.user.tag)
                        .replace(/{username}/g, member.user.username)
                        .replace(/{server}/g, member.guild.name)
                        .replace(/{membercount}/g, member.guild.memberCount.toString());

                    const leaveEmbed = new EmbedBuilder()
                        .setTitle('👋 Goodbye')
                        .setDescription(leaveMessage)
                        .setColor('#FF0000')
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Member count: ${member.guild.memberCount}` })
                        .setTimestamp();

                    await leaveChannel.send({ embeds: [leaveEmbed] });

                } catch (error) {
                    logger.error('Error sending leave message:', error);
                }
            }
        }

        logger.info(`${member.user.tag} left ${member.guild.name}`);
    }
};
