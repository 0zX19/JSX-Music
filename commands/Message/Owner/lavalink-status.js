const { EmbedBuilder } = require('discord.js');

module.exports = {
    ownerOnly: true,
    config: {
        name: "node",
        description: "Get the Lavalink node stats",
        accessableby: "Owner",
        category: "Owner",
    },
    run: async (client, message) => {
        const nodes = [...message.client.manager.nodes.values()];

        if (!nodes || nodes.length === 0) {
            return message.channel.send('❌ No nodes are currently connected.');
        }

        // Initial embed to show fetching status
        const embedStats = new EmbedBuilder()
            .setColor(client.color)
            .setDescription('🔄 Fetching Lavalink node stats...');
        let msg = await message.channel.send({ embeds: [embedStats] });

        // Function to create an embed with node stats
        const createEmbed = () => {
            const embed = new EmbedBuilder()
                .setTitle('Lavalink Node Status')
                .setColor(client.color)
                .setTimestamp();

            nodes.forEach(node => {
                const stats = node.stats || {};
                embed.addFields({
                    name: `Node: **${node.options.identifier}**`,
                    value: `**Status:** ${node.connected ? '🟢 Connected' : '🔴 Disconnected'}\n` +
                           `**Players:** ${stats.players || 0}\n` +
                           `**Uptime:** ${msToTime(stats.uptime || 0)}\n` +
                           `**Memory Usage:** ${formatBytes(stats.memory?.allocated || 0)}\n` +
                           `**CPU Load:** ${stats.cpu?.lavalinkLoad?.toFixed(2) || '0.00'}%`,
                    inline: false,
                });
            });

            return embed;
        };

        // Helper functions
        const msToTime = duration => {
            const milliseconds = Math.floor((duration % 1000) / 100);
            const seconds = Math.floor((duration / 1000) % 60);
            const minutes = Math.floor((duration / (1000 * 60)) % 60);
            const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
            const days = Math.floor(duration / (1000 * 60 * 60 * 24));

            return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s ${milliseconds}ms`.trim();
        };

        const formatBytes = (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
        };

        // Interval for updating stats
        const interval = setInterval(async () => {
            if (msg.deleted) {
                clearInterval(interval);
                return;
            }

            try {
                await msg.edit({ embeds: [createEmbed()] });
            } catch (error) {
                console.error('Error updating Lavalink node stats:', error);
                clearInterval(interval);
            }
        }, 10000); // Update every 10 seconds

        // Stop updating when the message is deleted or edited
        const stopUpdating = () => clearInterval(interval);
        message.client.on('messageDelete', deletedMessage => {
            if (deletedMessage.id === msg.id) stopUpdating();
        });
        message.client.on('messageUpdate', (oldMessage, newMessage) => {
            if (oldMessage.id === msg.id) stopUpdating();
        });
    },
};
