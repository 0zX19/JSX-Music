const { EmbedBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "autoplay",
        description: "Auto play random music in the voice channel from YouTube, SoundCloud, and Spotify.",
        accessableby: "Member",
        category: "Music"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "autoplay_loading")}`)] });
        const player = client.manager.get(message.guild.id);
        if (!player) {
            return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)] });
        }

        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }

        const { channel } = message.member.voice;
        if (!channel || message.member.voice.channel !== message.guild.members.me.voice.channel) {
            return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
        }

        // Toggle autoplay
        const autoplay = player.get("autoplay");
        if (autoplay) {
            player.set("autoplay", false);
            player.queue.clear();

            const offEmbed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "autoplay_off")}`)
                .setColor(client.color);

            return msg.edit({ content: " ", embeds: [offEmbed] });
        } else {
            const currentTrack = player.queue.current;
            if (!currentTrack) return msg.edit({ content: `${client.i18n.get(language, "music", "no_current_track")}` });

            player.set("autoplay", true);
            player.set("requester", client.user); // Only the bot initiates autoplay

            // Identify the source and search for related content
            let search = '';
            if (currentTrack.uri.includes('youtube.com')) {
                search = `https://www.youtube.com/watch?v=${currentTrack.identifier}&list=RD${currentTrack.identifier}`;
            } else if (currentTrack.uri.includes('spotify.com')) {
                search = `spotify:${currentTrack.identifier}`;
            } else if (currentTrack.uri.includes('soundcloud.com')) {
                search = currentTrack.uri;
            } else {
                return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "invalid_source")}`)] });
            }

            let res;
            try {
                res = await player.search(search, client.user);
            } catch (error) {
                console.error(error);
                return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "autoplay_error")}`)] });
            }

            if (!res || !res.tracks || !res.tracks.length) {
                return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "no_results")}`)] });
            }

            const randomTrack = res.tracks.find(track => track.identifier !== currentTrack.identifier) || res.tracks[0];
            if (randomTrack) {
                player.queue.add(randomTrack);

                const onEmbed = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(language, "music", "autoplay_on")}`)
                    .setColor(client.color);

                return msg.edit({ content: " ", embeds: [onEmbed] });
            } else {
                return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "autoplay_error")}`)] });
            }
        }
    }
};
