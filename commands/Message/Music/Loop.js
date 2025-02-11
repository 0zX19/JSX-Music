const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    config: {
        name: "loop",
        aliases: ["repeat"],
        description: "Loop song in queue!",
        accessableby: "Member",
        category: "Music",
        usage: "<song | queue | off>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "loop_loading")}`)]
        });

        // Check if valid arguments are passed
        if (!args[0] || !["song", "queue", "off"].includes(args[0].toLowerCase())) {
            return msg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle("Loop")
                        .setDescription("Please provide a valid argument.")
                        .addFields(
                            { name: "**Usage**", value: `\`${prefix}loop <song | queue | off>\`` },
                            { name: "**Example(s)**", value: `\`${prefix}loop song\`\n\`${prefix}loop queue\`\n\`${prefix}loop off\`` }
                        )
                ]
            });
        }

        const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)] });

        const { channel } = message.member.voice;
        if (!channel || !channel.permissionsFor(message.guild.members.me).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
            return msg.edit({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)]
            });
        }

        if (message.guild.members.me.voice.channel && !message.guild.members.me.voice.channel.equals(channel)) {
            return msg.edit({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "noplayer", "no_voice", { channel: channel.name })}`)]
            });
        }

        // Handle loop functionality
        if (args[0].toLowerCase() === 'song') {
            player.setTrackRepeat(!player.trackRepeat);
            const loopedMsg = player.trackRepeat
                ? client.i18n.get(language, "music", "loop_current")
                : client.i18n.get(language, "music", "unloop_current");

            return msg.edit({
                embeds: [new EmbedBuilder().setDescription(loopedMsg).setColor(client.color)]
            });
        }

        if (args[0].toLowerCase() === 'queue') {
            player.setQueueRepeat(!player.queueRepeat);
            const queueMsg = player.queueRepeat
                ? client.i18n.get(language, "music", "loop_all")
                : client.i18n.get(language, "music", "unloop_all");

            return msg.edit({
                embeds: [new EmbedBuilder().setDescription(queueMsg).setColor(client.color)]
            });
        }

        // Deactivate all looping
        if (args[0].toLowerCase() === 'off') {
            player.setTrackRepeat(false);
            player.setQueueRepeat(false);

            return msg.edit({
                embeds: [new EmbedBuilder().setDescription(`✅ Looping is now deactivated.`).setColor(client.color)]
            });
        }
    }
};
