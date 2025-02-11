const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const { NormalPage } = require('../../../structures/PageQueue.js');
const formatDuration = require('../../../structures/FormatDuration.js');

module.exports = { 
    config: {
        name: "queue",
        aliases: ["q"],
        description: "Displays what the current queue is.",
        accessableby: "Member",
        category: "Music",
    },
	cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {

		const msg = await message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_loading")}`)]
        });

		const player = client.manager.get(message.guild.id);
		if (!player) return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]});

		const { channel } = message.member.voice;
        if (!channel) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
        .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)]
    });

	if (!client.manager.nodes.some(node => node.connected)) {
		return msg.edit({
			content: " ",
			embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
		});
	}
	
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

		const song = player.queue.current;
		const qduration = `${formatDuration(player.queue.duration)}`;
        const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;

		let pagesNum = Math.ceil(player.queue.length / 10);
		if(pagesNum === 0) pagesNum = 1;

		const songStrings = [];
		for (let i = 0; i < player.queue.length; i++) {
			const song = player.queue[i];
			songStrings.push(
				`**${i + 1}.** ${song.title} \`[${formatDuration(song.duration)}]\` • ${song.requester}
				`);
		}

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');

			const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.i18n.get(language, "music", "queue_author", {
					guild: message.guild.name,
				})}`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setThumbnail(thumbnail)
				.setColor(client.color) //**Currently Playing:**\n**[${song.title}](${song.uri})** \`[${formatDuration(song.duration)}]\` • ${song.requester}\n\n**Rest of queue**:${str == '' ? '  Nothing' : '\n' + str}
				.setDescription(`${client.i18n.get(language, "music", "queue_description", {
					title: song.title,
					url: song.uri,
					duration: formatDuration(song.duration),
					request: song.requester,
					rest: str == '' ? '  Nothing' : '\n' + str,
				})}`) //Page • ${i + 1}/${pagesNum} | ${player.queue.length} • Song | ${qduration} • Total duration
				.setFooter({ text: `${client.i18n.get(language, "music", "queue_footer", {
					page: i + 1,
					pages: pagesNum,
					queue_lang: player.queue.length,
					duration: qduration,
				})}` });

			pages.push(embed);
		}

		if (!args[0]) {
			if (pages.length == pagesNum && player.queue.length > 10) NormalPage(client, message, pages, 60000, player.queue.length, qduration, language);
			else return msg.edit({ embeds: [pages[0]] });
		}
		else {
			if (isNaN(args[0])) return msg.edit(`${client.i18n.get(language, "music", "queue_notnumber")}`);
			if (args[0] > pagesNum) return msg.edit(`${client.i18n.get(language, "music", "queue_page_notfound", {
				page: pagesNum,
			})}`);
			const pageNum = args[0] == 0 ? 1 : args[0] - 1;
			return msg.edit({ embeds: [pages[pageNum]] });
		}
	}
};