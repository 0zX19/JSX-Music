const { white, green } = require('chalk');
const Premium = require('../../settings/models/Premium.js');
const { ActivityType, EmbedBuilder, WebhookClient } = require('discord.js');
const { ClusterClient } = require('discord-hybrid-sharding');
require('dotenv').config();
const moment = require('moment'); // Pastikan Anda menginstal moment.js dengan npm install moment

// Menggunakan format lokal untuk tanggal dan waktu
moment.locale('id'); // Set ke lokal Indonesia, sesuaikan jika perlu

// Inisialisasi webhook client dari .env
const webhookReadyClient = new WebhookClient({ url: process.env.WEBHOOL_READY });

module.exports = async (client) => {
    // Inisialisasi HybridSharding ClusterClient
    client.cluster = new ClusterClient(client);

    // Inisialisasi manajer dengan parameter yang diperlukan
    await client.manager.init(
        client.user.id,
        client.user.username,
        client.cluster.info.TOTAL_SHARDS
    );

    // Mendapatkan tanggal dan waktu saat ini
    const currentTime = moment().format('dddd, DD MMMM YYYY, HH:mm:ss'); // Contoh: Senin, 03 Desember 2024, 15:45:30

    // Membuat embed untuk log bot siap
    const readyEmbed = new EmbedBuilder()
        .setColor(0x00FF00) // Warna hijau
        .setTitle('Bot Ready')
        .setDescription(`**${client.user.tag}** is now online!`)
        .addFields(
            { name: '🤖 Bot ID', value: `**\`${client.user.id}\`**`, inline: true },
            { name: '📡 Shard Count', value: `**\`${client.cluster?.info?.TOTAL_SHARDS || 1}\`**`, inline: true },
            { name: '⏰ Online Since', value: `**\`${currentTime}\`**`, inline: false }
        )        
        .setTimestamp();

    // Mengirim log ke webhook saat bot online
    await webhookReadyClient.send({
        username: client.user.username, // Nama pengguna bot
        avatarURL: client.user.displayAvatarURL(), // Avatar bot
        embeds: [readyEmbed],
    });

    // Memuat pengguna premium dari database
    const users = await Premium.find();
    for (let user of users) {
        client.premiums.set(user.Id, user);
    }

    // Fungsi untuk memperbarui status bot
    const updateBotStatus = async () => {
        try {
            const promises = [
                client.cluster.broadcastEval("this.guilds.cache.size"),
                client.cluster.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            ];

            const results = await Promise.all(promises);

            const servers = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
            const members = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

            const formattedServers = servers.toLocaleString();
            const formattedMembers = members.toLocaleString();
            const totalShards = client.cluster.info.TOTAL_SHARDS || 1;

            const status = [
                { type: ActivityType.Streaming, name: `h,help` },
                { type: ActivityType.Streaming, name: `${formattedServers} Servers` },
                { type: ActivityType.Streaming, name: `${formattedMembers} Members` },
                { type: ActivityType.Streaming, name: `${totalShards} Shards` },
            ];

            const index = Math.floor(Math.random() * status.length);

            await client.user.setActivity(status[index].name, {
                type: status[index].type,
                url: "https://www.twitch.tv/harukachan_19",
            });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Warna merah
                .setTitle('Bot Status Update Failed')
                .setDescription(`Failed to update bot status: ${error.message}`)
                .setTimestamp();

            await webhookReadyClient.send({
                username: client.user.username,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [errorEmbed],
            });
        }
    };

    // Memperbarui status setiap 60 detik
    setInterval(updateBotStatus, 60000);
    updateBotStatus(); // Inisialisasi langsung
};
