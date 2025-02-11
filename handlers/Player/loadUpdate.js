const { EmbedBuilder } = require("discord.js");
const formatDuration = require("../../structures/FormatDuration.js");
const GLang = require("../../settings/models/Language.js");
const GSetup = require("../../settings/models/Setup.js");

module.exports = async (client) => {
    client.UpdateQueueMsg = async function (player) {
        const data = await GSetup.findOne({ guild: player.guild });
        if (data.enable === false) return;

        const channel = await client.channels.cache.get(data.channel);
        if (!channel) return;

        const playMsg = await channel.messages.fetch(data.playmsg, { cache: false, force: true });
        if (!playMsg) return;
    
        const guildModel = await GLang.findOne({ guild: player.guild });
        const { language } = guildModel;

        const songStrings = [];
        const cSong2 = player.queue.current;
        const queuedSongs = player.queue.map((song, i) => `${client.i18n.get(language, "setup", "setup_content_queue", {
            index: i + 1,
            title: song.title,
            url: song.uri,
            duration: formatDuration(song.duration),
            request: cSong2.requester,
        })}`);

        songStrings.push(...queuedSongs);

        const Str = songStrings.slice(0, 5).join('\n');

        const cSong = player.queue.current;
        const qDuration = `${formatDuration(player.queue.duration)}`;    

        const played = player.playing ? `${client.i18n.get(language, "setup", "setup_nowplay")}` : `${client.i18n.get(language, "setup", "setup_songpause")}`;       
        
        const embedQueue = new EmbedBuilder()
        .setColor(client.color)
        .addFields(
        {
            name: `${client.i18n.get(language, "setup", "setup_content")}`,
            value: `${Str == '' ? `${client.i18n.get(language, "setup", "setup_content_empty")}` : '\n' + Str}`,
            inline: false,
        }
        )
        .addFields(
        {
            name: `**Song's in Queue:**`,
            value: `**${player.queue.length}**`,
            inline: true,
        },
        {
            name: "Requester By:",
            value: `${cSong.requester}`,
            inline: true
        },
        )

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${played}`})
            .setDescription(`**[${cSong.title}](${cSong.uri})**`)
            .setThumbnail(`https://img.youtube.com/vi/${cSong.identifier}/sddefault.jpg`)
            .addFields(
                {
                    name: "Duration",
                    value: `\`[${formatDuration(cSong.duration)}]\``,
                    inline: true
                },
                {
                    name: "Total Duration",
                    value: `\`[${qDuration}]\``,
                    inline: true,
                }
            )
            .setColor(client.color)
            .setImage(`${client.i18n.get(language, "setup", "setup_playembed_image")}`)
            .setFooter({ text: `${client.i18n.get(language, "setup", "setup_footer", {
                songs: player.queue.length,
                volume: player.volume,
                duration: qDuration,
            })}` })

        return playMsg.edit({
            embeds: [embedQueue, embed],
            components: [client.enSwitch, client.enSwitch2, client.enSwitch0] 
        });
    };

    client.UpdateMusic = async function (player) {
        const data = await GSetup.findOne({ guild: player.guild });
        if (data.enable === false) return;

        const channel = await client.channels.cache.get(data.channel);
        if (!channel) return;
        
        const playMsg = await channel.messages.fetch(data.playmsg, { cache: true, force: true });
        if (!playMsg) return;
    
        const guildModel = await GLang.findOne({ guild: player.guild });
        const { language } = guildModel;

        const queueMsg = `${client.i18n.get(language, "setup", "setup_queuemsg")}`;

        const embedQueue = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${queueMsg}`)
        .addFields(
            {
                name: `**Song's in Queue:**`,
                value: "**\`[0]\`**",
                inline: true,
            },
            {
                name: "**Requester By:**",
                value: "**\`[Empty]\`**",
                inline: true,
            }
            )

        const playEmbed = new EmbedBuilder()
            .setColor(client.color)
            .setImage(`${client.i18n.get(language, "setup", "setup_playembed_image")}`)
            .setDescription(`${client.i18n.get(language, "setup", "setup_playembed_desc", {
                    clientId: client.user.id,
            })}`)
            .setFooter({ text: `${client.i18n.get(language, "setup", "setup_playembed_footer", {
                    prefix: client.prefix,
            })}` });

        return playMsg.edit({
            embeds: [embedQueue, playEmbed], 
            components: [client.diSwitch, client.diSwitch2, client.diSwitch0] 
        });
    };

};