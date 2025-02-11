const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "jump",
        aliases: ["skip", "st"],
        description: "Skips to a certain song in the queue.",
        accessableby: "Member",
        category: "Music",
        usage: "<positions>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "skipto_loading")}`)] })

        if (!args[0]) return msg.edit({ embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setTitle("jump")
            .setDescription("Please furnish the demanded arguments.")
            .addFields(
            {
                name: "**Usage**",
                value: `\`\`${prefix}jump <positions>\`\``
            },
            {
                name: "**Example(s)**",
                value: `\`\`${prefix}jump 2\`\``
            }
        )
        ] 
        });

        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }

        if (isNaN(args[0])) return msg.edit(`${client.i18n.get(language, "music", "skipto_invalid_position")}`);
		if (args[0] === 0) return msg.edit(`${client.i18n.get(language, "music", "skipto_arg", {
            prefix: prefix
        })}`);

		const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });
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

		if ((args[0] > player.queue.length) || (args[0] && !player.queue[args[0] - 1])) return msg.edit(`${client.i18n.get(language, "music", "skipto_invalid")}`);
		if (args[0] == 1) player.stop();

		await player.queue.splice(0, args[0] - 1);
        await player.stop();
        await client.clearInterval(client.interval);
        
        const skipto = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "skipto_msg", {
                position: args[0]
            })}`)
            .setColor(client.color);

        msg.edit({ content: " ", embeds: [skipto] });
    }
}