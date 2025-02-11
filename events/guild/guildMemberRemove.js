const { EmbedBuilder } = require('discord.js');
const BoosterNotification = require('../../settings/models/boosterDatabase.js');

module.exports = async (client, member) => {
    const guildSettings = await BoosterNotification.findOne({ guildId: member.guild.id });

    if (!guildSettings || !guildSettings.isEnabled || !guildSettings.channelId) return;

    const channel = member.guild.channels.cache.get(guildSettings.channelId);
    if (!channel) return;

    const totalBoosters = member.guild.premiumSubscriptionCount || 0;

    // Mengganti placeholder dalam pesan kustom
    const customMessage = guildSettings.message
        .replace('{user}', member.user.toString())
        .replace('{totalboosters}', totalBoosters);

    const embed = new EmbedBuilder()
        .setTitle('🚀 Server Boost Removed 🚀')
        .setDescription(`${member.user.tag} has removed their server boost.\n${customMessage}`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor('Red')
        .setTimestamp()
        .setFooter({ 
            text: `Server Boost Removed 🎉 〚🚀〛boost・sistem•${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}`
        });

    channel.send({ embeds: [embed] });
};
