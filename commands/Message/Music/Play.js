const { convertTime } = require("../../../structures/ConvertTime.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = { 
    config: {
        name: "play",
        description: "Play a song!",
        usage: "<results>",
        category: "Music",
        accessableby: "Member",
        aliases: ["p", "pplay"]
    },
    run: async (client, message, args, user, language, prefix) => {
        // Loading message
        const msg = await message.channel.send({ 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_loading")}`)] 
        });

        // Voice channel validation
        const { channel } = message.member.voice;
        if (!channel) return msg.edit(`${client.i18n.get(language, "music", "play_invoice")}`);
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
            return msg.edit(`${client.i18n.get(language, "music", "play_join")}`);
        }
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) {
            return msg.edit(`${client.i18n.get(language, "music", "play_speak")}`);
        }

        // Check if the bot is already in another voice channel
        if (message.guild.members.me.voice.channel && message.guild.members.me.voice.channel.id !== channel.id) {
            return msg.edit({
                content: " ", 
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`❌ I'm already connected in <#${message.guild.members.me.voice.channel.id}>. Join the same channel to use this command.`)
                ]
            });
        }

        // Validate arguments
        if (!args[0]) return msg.edit(`${client.i18n.get(language, "music", "play_arg")}`);

        // Create a music player
        const player = await client.manager.create({
            guild: message.guild.id,
            voiceChannel: channel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
        });

        const search = args.join(" ");
        // Validate URL and source
        if (search.startsWith("https://") || search.startsWith("http://")) {
            if (!search.match(/(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[\/:]([A-Za-z0-9]+)/) &&
                !search.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/)) {
                return msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`We no longer support YouTube links due to recent activities. Use Spotify, SoundCloud, or provide a search query.`)
                    ]
                });
            }
        }

        try {
            // Connect player if not connected
            if (player.state !== "CONNECTED") await player.connect();

            // Search for the track
            const res = await client.manager.search(search, message.author);
            if (res.loadType !== "NO_MATCHES") {
                if (res.loadType === "TRACK_LOADED") {
                    player.queue.add(res.tracks[0]);
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Added Track` })
                        .setDescription(`**[${res.tracks[0].title}](${res.tracks[0].uri})**`)
                        .setColor(client.color);
                    msg.edit({ content: " ", embeds: [embed] });
                    if (!player.playing) player.play();
                } else if (res.loadType === "PLAYLIST_LOADED") {
                    player.queue.add(res.tracks);
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Added Playlist` })
                        .addFields(
                            { name: `Playlist`, value: `**[${res.playlist.name}](${search})**`, inline: true },
                            { name: `Tracks`, value: `(${res.tracks.length} tracks)`, inline: true }
                        )
                        .setColor(client.color);
                    msg.edit({ content: " ", embeds: [embed] });
                    if (!player.playing) player.play();
                } else if (res.loadType === "SEARCH_RESULT") {
                    player.queue.add(res.tracks[0]);
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Added Track` })
                        .setDescription(`**[${res.tracks[0].title}](${res.tracks[0].uri})**`)
                        .setColor(client.color);
                    msg.edit({ content: " ", embeds: [embed] });
                    if (!player.playing) player.play();
                } else if (res.loadType === "LOAD_FAILED") {
                    msg.edit(`${client.i18n.get(language, "music", "play_fail")}`);
                    player.destroy();
                }
            } else {
                msg.edit(`${client.i18n.get(language, "music", "play_match")}`);
                player.destroy();
            }
        } catch (error) {
            console.error(error);
            msg.edit(`${client.i18n.get(language, "music", "play_error")}`);
            if (player) player.destroy();
        }
    }
};
