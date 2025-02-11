const { EmbedBuilder } = require('discord.js');
const BoosterNotification = require('../../settings/models/boosterDatabase.js');

module.exports = async (client, oldMember, newMember) => {
    // Cek apakah anggota baru saja memberikan boost
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const guildSettings = await BoosterNotification.findOne({ guildId: newMember.guild.id });

        // Jika tidak ada pengaturan atau tidak diaktifkan, keluar
        if (!guildSettings || !guildSettings.isEnabled || !guildSettings.channelId) return;

        const channel = newMember.guild.channels.cache.get(guildSettings.channelId);
        if (!channel) return;

        const totalBoosters = newMember.guild.premiumSubscriptionCount || 0;

        // Mengganti placeholder dalam pesan kustom, gunakan pesan default jika tidak ada
        const defaultMessage = `${newMember.user.toString()} has just boosted the server! 🎉 We now have ${totalBoosters} boosts!`;
        const customMessage = guildSettings.message
            ? guildSettings.message
                    .replace('{user}', newMember.user.toString())
                    .replace('{totalboosters}', totalBoosters)
            : defaultMessage;

        // Pastikan pesan tidak kosong
        if (!customMessage.trim()) return console.error('Custom message is empty.');

        const embed = new EmbedBuilder()
            .setAuthor({ name: "🎉🎉 BOOSTER PARTY 🎉🎉", iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(customMessage)
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .setColor(client.color)
            .setFooter({
                text: `Server Boosted 🎉 〚🚀〛boost・sistem•${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}`,
            });

        // Kirim pesan ke saluran
        channel.send({ embeds: [embed] }).catch(err => console.error('Failed to send message:', err));
    }
};
