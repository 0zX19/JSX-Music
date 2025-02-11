const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = { 
    config: {
        name: "skip",
        aliases: ["next", "s"],
        description: "Skips the song currently playing.",
        accessableby: "Member",
        category: "Music"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "skip_loading")}`)] 
        });

        const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ 
            content: ' ', 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)] 
        });

        const { channel } = message.member.voice;
        if (!channel) return msg.edit({ 
            content: " ", 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)] 
        });

        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }
        
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) return msg.edit({ 
            content: " ", 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_join")}`)] 
        });
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) return msg.edit({ 
            content: " ", 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_speak")}`)] 
        });
        if (!channel) { 
            return msg.edit({ 
                content: " ", 
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] 
            });
        } else if (message.guild.members.me.voice.channel && !message.guild.members.me.voice.channel.equals(channel)) {
            return msg.edit({ 
                content: " ", 
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice", {
                    channel: channel.name
                })}`)] 
            });
        }

        // Get the current track information
        const currentTrack = player.queue.current;

        // Stop the current track
        await player.stop();
        await client.clearInterval(client.interval);

        const skipped = new EmbedBuilder() 
            .setDescription(`${client.i18n.get(language, "music", "skip_msg", {
                song: currentTrack.title.length > 50 ? currentTrack.title.slice(0, 47) + '.....' : currentTrack.title,
                requester: currentTrack.requester
            })}`)        
            .setColor(client.color);

        msg.edit({ content: " ", embeds: [skipped] }).then((msg) => setTimeout(() => msg.delete(), 5000));
    }
};
