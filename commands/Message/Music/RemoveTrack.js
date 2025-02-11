const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { convertTime } = require("../../../structures/ConvertTime.js");
const GPrefix = require('../../../settings/models/Prefix');

module.exports = { 
    config: {
        name: "removetrack",
        description: "Remove song from queue!",
        usage: "<number>",
        category: "Music",
        accessableby: "Member",
        aliases: ["rt", "rs"],
    },
    cooldown: 10,
    run: async (client, message, args, user, language) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;

        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "removetrack_loading")}`)] })
        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }
        if (!args[0]) return msg.edit({ embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setTitle("Remove Track")
            .setDescription("Please furnish the demanded arguments.")
            .addFields(
            {
                name: "**Usage**",
                value: `\`\`${prefix}removetrack <number queue>\`\``
            },
            {
                name: "**Example(s)**",
                value: `\`\`${prefix}removetrack 2\`\``
            }
        )
        ] 
        });

		const player = client.manager.get(message.guild.id);
		if (!player) return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)] });
        const { channel } = message.member.voice;
        if (!channel) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
        .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)]
    });
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.i18n.get(language, "music", "play_join")}`)]
        });
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
            .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_speak")}`)]
        });
        if (!channel) { 
            return msg.edit({ content: " ", embeds: [new EmbedBuilder()
                .setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)]
            });
        } else if (message.guild.members.me.voice.channel && !message.guild.members.me.voice.channel.equals(channel)) {
            return msg.edit({ content: " ", embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.i18n.get(language, "noplayer", "no_voice", {
                    channel: channel.name
                })}`)]
            });
        }

        const tracks = args[0];

        if (isNaN(tracks)) return msg.edit(`${client.i18n.get(language, "music", "removetrack_arg")}`);

        if (tracks == 0) return msg.edit(`${client.i18n.get(language, "music", "removetrack_already")}`);
        if (tracks > player.queue.length) return msg.edit(`${client.i18n.get(language, "music", "removetrack_notfound")}`);

        const song = player.queue[tracks - 1];

        player.queue.splice(tracks - 1, 1);

        const embed = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "removetrack_desc", {
                name: song.title,
                url: song.uri,
                duration: convertTime(song.duration, true),
                request: song.requester
            })
            .setColor(client.color)
        }`)

        return msg.edit({ content: " ", embeds: [embed] });
    }
}