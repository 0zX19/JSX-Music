const { 
    EmbedBuilder,
    MessageFlags,    
} = require('discord.js');
const GLang = require("../../settings/models/Language.js");
const Setup = require("../../settings/models/Setup.js");
const { formatduration } = require("../../structures/FormatDuration.js");


module.exports = async (client, interaction, message) => {
    if (!interaction.guild || interaction.user.bot) return;
    if (interaction.isButton()) {
        const { customId, member } = interaction;
        let voiceMember = interaction.guild.members.cache.get(member.id);
        let channel = voiceMember.voice.channel;

        let player = await client.manager.get(interaction.guild.id);
        if (!player) return;

        const playChannel = client.channels.cache.get(player.textChannel);
        if (!playChannel) return;
    
        const guildModel = await GLang.findOne({ guild: channel.guild.id });
        const { language } = guildModel;

        const db = await Setup.findOne({ guild: playChannel.guild.id });
        if (db.enable === false) return;

        // Here delete interaction.reply!
        setTimeout(() => interaction.deleteReply(), 2500);

        switch (customId) {
            case "sprevious":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player || !player.queue.previous) {
                        return interaction.reply(`${client.i18n.get(language, "music", "previous_notfound")}`);
                    } else {
                        await player.queue.unshift(player.queue.previous);
                        await player.stop();

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "music", "previous_msg")}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }
                break;

            case "sskip":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {}
                    if (player.queue.size == 0) {
                        await player.destroy();
                        await client.UpdateMusic(player);

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    } else {
                        await player.stop();

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }
                break;

            case "sstop":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.destroy();
                        await client.UpdateMusic(player);

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "stop_msg")}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }
                break;

            case "spause":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.pause(!player.paused);
                        const uni = player.paused ? `${client.i18n.get(language, "player", "switch_pause")}` : `${client.i18n.get(language, "player", "switch_resume")}`;

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "pause_msg", {
                            pause: uni,
                            })}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }
                break;

            case "sloop":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.setQueueRepeat(!player.queueRepeat);
                        const uni = player.queueRepeat ? `${client.i18n.get(language, "player", "switch_enable")}` : `${client.i18n.get(language, "player", "switch_disable")}`;
                
                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "repeat_msg", {
                            loop: uni,
                            })}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }
            break;

            case "sshuffle":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.queue.shuffle();

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "shuffle_msg")}`)
                            .setColor(client.color);

                        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral});
                    }
                }
            break;
            case "svolup":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.setVolume(player.volume + 5);

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "volup_msg", {
                              volume: player.volume,
                            })}`)
                            .setColor(client.color);
              
                            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral});
                    }
                }
            break;

            case "svoldown":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        await player.setVolume(player.volume - 5);

                        const embed = new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "player", "voldown_msg", {
                              volume: player.volume,
                            })}`)
                            .setColor(client.color);
              
                         interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral});
                    }
                }
            break;
            case "sQueue":
                {
                    if (!channel) { 
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(channel)) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)] });
                    } else if (!player) {
                        return interaction.reply(`${client.i18n.get(language, "noplayer", "no_player")}`);
                    } else {
                        const song = player.queue.current;
                        const qduration = `${formatduration(player.queue.duration)}`;
                        const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;
                    
                        let pagesNum = Math.ceil(player.queue.length / 10);
                        if(pagesNum === 0) pagesNum = 1;
                    
                        const songStrings = [];
                        for (let i = 0; i < player.queue.length; i++) {
                          const song = player.queue[i];
                          songStrings.push(
                            `**${i + 1}.** [${song.title}](${song.uri}) \`[${formatduration(song.duration)}]\` • ${song.requester}
                            `);
                        }
              
                        const pages = [];
                        for (let i = 0; i < pagesNum; i++) {
                          const str = songStrings.slice(i * 10, i * 10 + 10).join('');
                    
                          const embed = new EmbedBuilder()
                            .setAuthor({ name: `${client.i18n.get(language, "player", "queue_author", {
                              guild: interaction.guild.name,
                            })}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                            .setThumbnail(thumbnail)
                            .setColor(client.color)
                            .setDescription(`${client.i18n.get(language, "player", "queue_description", {
                              track: song.title,
                              track_url: song.uri,
                              duration: formatduration(song.duration),
                              requester: song.requester,
                              list_song: str == '' ? '  Nothing' : '\n' + str,
                            })}`)
                            .setFooter({ text: `${client.i18n.get(language, "player", "queue_footer", {
                              page: i + 1,
                              pages: pagesNum,
                              queue_lang: player.queue.length,
                              total_duration: qduration,
                            })}` });
                    
                          pages.push(embed);
                        }
                        interaction.reply({ embeds: [pages[0]], flags: MessageFlags.Ephemeral });
                    }
                }
            break;
        default:
            break;
        }
    }
}