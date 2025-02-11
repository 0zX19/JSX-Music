const { WebhookClient, EmbedBuilder } = require("discord.js");
require("dotenv").config();

// Validasi Webhook URL
if (!process.env.WEBHOOK_MUSIC) {
    console.error("Missing WEBHOOK_MUSIC in environment variables. Exiting...");
    process.exit(1);
}

// Webhook untuk logging
const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_MUSIC });

module.exports = async (client, player) => {
    try {
        // Membuat embed untuk log
        const embed = new EmbedBuilder()
            .setTitle("Player Created")
            .setDescription(`Player was created for the guild: **${player.guild}**`)
            .setColor(0x00ff00) // Hijau
            .setTimestamp();

        // Mengirim embed ke webhook
		await webhookClient.send({
			username: client.user.username, // Nama pengguna bot
			avatarURL: client.user.displayAvatarURL(), // Avatar bot
			embeds: [embed],
		});
    } catch (err) {
        console.error("Failed to send log to webhook:", err);
    }
};
