const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require("discord.js");
const Setup = require("../../settings/models/Setup.js");
const Control = require("../../settings/models/Control.js");
const Prefix = require("../../settings/models/Prefix.js");
const Language = require("../../settings/models/Language.js");
const Premium = require('../../settings/models/Premium.js');

module.exports = async (client) => {

    const enable = client.button.song_request_on;

    client.enSwitch0 = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setLabel("Premier Crafty")
                .setURL("https://premier-crafty.my.id/")
                .setStyle(ButtonStyle.Link)
                .setEmoji(enable.Crafty.emoji),
            new ButtonBuilder()
                .setLabel("Support Me 🤍")
                .setURL("https://www.paypal.com/paypalme/andrih1997")
                .setStyle(ButtonStyle.Link)
                .setEmoji(enable.Paypal.emoji),
        ]);

    client.enSwitch = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.pause.style])
                .setCustomId("spause")
                .setEmoji(enable.pause.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.previous.style])
                .setCustomId("sprevious")
                .setEmoji(enable.previous.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.stop.style])
                .setCustomId("sstop")
                .setEmoji(enable.stop.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.skip.style])
                .setCustomId("sskip")
                .setEmoji(enable.skip.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.loop.style])
                .setCustomId("sloop")
                .setEmoji(enable.loop.emoji),
        ]);

        client.enSwitch2 = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.Shuffle.style])
                .setCustomId("sshuffle")
                .setEmoji(enable.Shuffle.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.Voldown.style])
                .setCustomId("svoldown")
                .setEmoji(enable.Voldown.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.Volup.style])
                .setCustomId("svolup")
                .setEmoji(enable.Volup.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.autoplay.style])
                .setCustomId("sautoplay")
                .setEmoji(enable.autoplay.emoji),
            new ButtonBuilder()
                .setStyle(ButtonStyle[enable.Queue.style])
                .setCustomId("sQueue")
                .setEmoji(enable.Queue.emoji),
        ]);

    const disable = client.button.song_request_off;

    client.diSwitch0 = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setURL("https://premier-crafty.my.id/")
                .setLabel("Premier Crafty")
                .setStyle(ButtonStyle.Link)
                .setEmoji(enable.Crafty.emoji),
            new ButtonBuilder()
                .setURL("https://www.paypal.com/paypalme/andrih1997")
                .setLabel("Support Me 🤍")
                .setStyle(ButtonStyle.Link)
                .setEmoji(enable.Paypal.emoji),
        ]);

    client.diSwitch = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.pause.style])
                .setCustomId("spause")
                .setEmoji(disable.pause.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.previous.style])
                .setCustomId("sprevious")
                .setEmoji(disable.previous.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.stop.style])
                .setCustomId("sstop")
                .setEmoji(disable.stop.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.skip.style])
                .setCustomId("sskip")
                .setEmoji(disable.skip.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.loop.style])
                .setCustomId("sloop")
                .setEmoji(disable.loop.emoji)
                .setDisabled(true)
        ]);

        client.diSwitch2 = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.Shuffle.style])
                .setCustomId("sshuffle")
                .setEmoji(disable.Shuffle.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.Voldown.style])
                .setCustomId("svoldown")
                .setEmoji(disable.Voldown.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.Volup.style])
                .setCustomId("svolup")
                .setEmoji(disable.Volup.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.autoplay.style])
                .setCustomId("sautoplay")
                .setEmoji(disable.autoplay.emoji)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle[disable.Queue.style])
                .setCustomId("sQueue")
                .setEmoji(disable.Queue.emoji)
                .setDisabled(true),
        ]);

        client.on("interactionCreate", async (ctx) => {
            if (ctx.isStringSelectMenu()) {
                const player = client.manager.create({
                    guild: ctx.guild.id,
                    voiceChannel: ctx.member.voice.channel.id,
                    textChannel: ctx.channel.id,
                    selfDeafen: true
                });
                const value = ctx.values[0];
                const url = value;

                const state = player.state;
                if (state != "CONNECTED") await player.connect();

                const res = await client.manager.search(url, ctx.user);
                player.queue.add(res.tracks[0]);

                player.play();
            }
    })

    client.createSetup = async function (guildId) {
        const database = await Setup.findOne({ guild: guildId });
        if (!database) {
            const newSetup = await new Setup({
                guild: guildId,
                enable: false,
                channel: "",
                playmsg: "",
            });
            await newSetup.save();
        }
    }

    client.playerControl = async function (guildId) {
        const database = await Control.findOne({ guild: guildId });
        if (!database) {
            const newControl = await new Control({
                guild: guildId,
                enable: false,
            });
            await newControl.save();
        }
    }

    client.createLang = async function (guildId) {
        const database = await Language.findOne({ guild: guildId });
        if (!database) {
            const newLang = await Language.create({
                guild: guildId,
                language: "en",
            });
            await newLang.save();
        }
    };

    client.createPrefix = async function (guildId, gprefix) {
        const database = await Prefix.findOne({ guild: guildId });
        if (!database) {
            const newPrefix = await Prefix.create({
                guild: guildId,
                prefix: gprefix,
            });
            await newPrefix.save();
        }
    };

    client.createPremium = async function (message, user) {
        const findUser = await Premium.findOne({ Id: message.author.id });
        if (!findUser) {
            const newUser = await Premium.create({ 
                Id: message.author.id 
            });
            await newUser.save();

            message.client.premiums.set(message.author.id, newUser);
        }
    }

    client.interval = null;

    client.clearInterval = async function (interval) {
        clearInterval(interval);
    };

};