const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = { 
    config: {
        name: "shard-info",
        aliases: ["shardinfo"],
        category: "Information",
        description: "Displays the current shard and cluster information",
    },
    run: async (client, message, args) => {
        // Get the shard ID of the current guild
        const shardId = message.guild.shardId;

        // Get the current cluster ID
        const clusterId = client.cluster.id;

        // Get total shard count across all clusters
        const totalShards = client.cluster.info.TOTAL_SHARDS;

        // Get all shard IDs in the current cluster
        const shardIdsInCluster = [...client.cluster.ids.keys()];

        // Canvas settings
        const canvas = createCanvas(500, 300);
        const ctx = canvas.getContext('2d');

        // Background color
        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text information
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Shard and Cluster Information', 50, 50);

        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`Current Cluster ID: ${clusterId}`, 50, 100);
        ctx.fillText(`Current Shard ID: ${shardId}`, 50, 140);
        ctx.fillText(`Total Shards: ${totalShards}`, 50, 180);
        ctx.fillText(`Shard IDs in Current Cluster: ${shardIdsInCluster.join(', ')}`, 50, 220);

        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');

        // Create attachment directly from buffer
        const attachment = new AttachmentBuilder(buffer, { name: 'shard-info.png' });

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle('Shard and Cluster Information')
            .setDescription('Below is the visual representation of shard and cluster information, including an emoji.')
            .setImage('attachment://shard-info.png')
            .setTimestamp()
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            });

        // Send the embed with the image attachment
        message.channel.send({ embeds: [embed], files: [attachment] });
    }
};
