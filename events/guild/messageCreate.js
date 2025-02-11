const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, WebhookClient, MessageFlags } = require("discord.js");
const GPrefix = require('../../settings/models/Prefix.js');
const GLang = require('../../settings/models/Language.js');
const GSetup = require("../../settings/models/Setup.js");
const Blacklist = require('../../settings/models/Blacklist.js'); // Import the blacklist model
const chalk = require('chalk');
const delay = require('delay');
const { ownerIDs } = require('../../settings/config.js');
const moment = require('moment'); 


const webhookClient = new WebhookClient({ url: process.env.AUDITLOGS });

moment.locale('id');


module.exports = async (client, message) => {
    //Ignoring bot, system, dm and webhook messages
    if (message.author.bot || !message.guild || message.system || message.webhookId) return;

    /// Create database when not have!
    await client.createSetup(message.guild.id);
    await client.playerControl(message.guild.id);
    await client.createLang(message.guild.id);
    await client.createPrefix(message.guild.id, client.prefix);

    /// Create new member!
    const user = message.client.premiums.get(message.author.id);
    await client.createPremium(message, user);

    const database = await GSetup.findOne({ guild: message.guild.id });
    /// REQUEST MODE!
      if (database.enable) {
        if (!message.guild || !message.guild.available) return;

        const channel = await message.guild.channels.cache.get(database.channel);
        if (!channel) return;

        if (database.channel != message.channel.id) return;

        const guildModel = await GLang.findOne({ guild: message.guild.id });
        const { language } = guildModel;

        if (message.author.id === client.user.id) {
            await delay(1000);
            message.delete()
        }

        if (message.author.bot) return;

            const song = message.cleanContent;
            await message.delete();

            const voiceChannel = await message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(`${client.i18n.get(language, "noplayer", "no_voice")}`).then((msg) => { 
                setTimeout(() => {
                    msg.delete()
                }, 1000);
            });

            const player = await client.manager.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: true,
            });

            const state = player.state;
            if (state != "CONNECTED") await player.connect();
            const res = await client.manager.search(song, message.author);
            if(res.loadType != "NO_MATCHES") {
                if(res.loadType == "TRACK_LOADED") {
                    player.queue.add(res.tracks[0]);
                    if(!player.playing) player.play();
                } else if(res.loadType == "PLAYLIST_LOADED") {
                    player.queue.add(res.tracks)
                    if(!player.playing) player.play();
                } else if(res.loadType == "SEARCH_RESULT") {
                    player.queue.add(res.tracks[0]);
                    if(!player.playing) player.play();
                } else if(res.loadType == "LOAD_FAILED") {
                    message.channel.send(`${client.i18n.get(language, "music", "play_fail")}`).then((msg) => { 
                        setTimeout(() => {
                            msg.delete()
                        }, 1000);
                    }).catch((e) => {});
                        player.destroy();
                }
            } else {
                message.channel.send(`${client.i18n.get(language, "music", "play_match")}`).then((msg) => { 
                    setTimeout(() => {
                        msg.delete()
                    }, 1000);
                }).catch((e) => {});
                    player.destroy();
                }

                if (player) {
                    client.UpdateQueueMsg(player);
                }
        /// NORMAL MODE!
        } else {
            const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
            const prefix = GuildPrefix.prefix;

            const guildModel = await GLang.findOne({ guild: message.guild.id });
            const language = guildModel.language;

            const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

            const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setEmoji("<:premiercrafty:1269791654781386844> ").setURL("https://premier-crafty.my.id/").setStyle(ButtonStyle.Link))
            .addComponents(new ButtonBuilder().setEmoji("<:Haruka:1310909092469932102>  ").setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456").setStyle(ButtonStyle.Link))
            .addComponents(new ButtonBuilder().setEmoji("<:paypal:1148981240695885837>").setURL("https://www.paypal.com/paypalme/andrih1997").setStyle(ButtonStyle.Link))
            .addComponents(new ButtonBuilder().setEmoji("<:saweria:1198559864209801216>").setURL("https://saweria.co/andrihermawan/").setStyle(ButtonStyle.Link))
            .addComponents(new ButtonBuilder().setEmoji("🌐").setURL("https://haruka-bot.my.id/").setStyle(ButtonStyle.Link));
            

            if(message.content.match(mention)) {
                const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `${client.user.username}`, iconURL: message.guild.iconURL({ dynamic: true })})
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setDescription(`${client.user.username}'s prefix on the **${message.guild.name}** server is \`\`${prefix}\`\`. Use the \`\`${prefix}help\`\` command to see the entire list of available commands.`)
                .setFooter({ text: `Powered By: Premier Crafty`, iconURL: "https://cdn.discordapp.com/attachments/1102585584117088318/1267371549372190770/premier_crafty.png?ex=66a88b3b&is=66a739bb&hm=4991339ad3c0f18e95cfa6dc279610724fcb2211dc3c6e4089aece30666aaf85&" })
                message.reply({ embeds: [embed], components: [row] });
            };
            
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
            if (!prefixRegex.test(message.content)) return;
            const [ matchedPrefix ] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            if(!command) return;
            
            if (!client.dev.includes(message.author.id) && client.dev.length > 0) { 

            message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "message", "dev_only")}`)] });
            console.log(chalk.bgRedBright(`[INFOMATION] ${message.author.tag} trying request the command from ${message.guild.name}`)); 
            return;
            }

            const botPermissions = ["ViewChannel", "SendMessages", "EmbedLinks"];
            const botMissingPermissions = [];

            for (const perm of botPermissions) {
                if (!message.channel.permissionsFor(message.guild.members.me).has(perm)) {
                    botMissingPermissions.push(perm);
                }
            }

            if (botMissingPermissions.length > 0)
                return message.reply({
                    embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`\`❌\` | I don't have one of these permissions \`ViewChannel\`, \`SendMessages\`, \`EmbedLinks\`.\nPlease double check them in your server role & channel settings.`)],
                    components: [row],
                });
                
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) return await message.author.dmChannel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel)) return;
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            
            if (command) {
                    // Pastikan client.Cooldown sudah diinisialisasi
                    if (!client.Cooldown) {
                        client.Cooldown = new Collection();
                    }

                    if (!client.Cooldown.has(command.name)) {
                        client.Cooldown.set(command.name, new Collection());
                    }

                    const cooldown = client.Cooldown.get(command.name);
                    const cooldownAmount = (command.cooldown && command.cooldown > 0) ? command.cooldown * 1000 : 3000;

                    if (cooldown.has(message.author.id)) {
                        const expireTime = cooldown.get(message.author.id);
                        const timeLeft = cooldownAmount - (Date.now() - expireTime);

                        if (timeLeft > 0) {
                            const embed = new EmbedBuilder()
                                .setColor(client.color || '#FF0000')  // Pastikan client.color didefinisikan, jika tidak gunakan warna default
                                .setDescription(`❌ Please wait for \`[ ${msToTime(timeLeft)} ]\` before reusing the \`${cmd}\` command!`);

                            const msg = await message.reply({ embeds: [embed] });

                            // Update embed secara real-time
                            const interval = setInterval(() => {
                                const newTimeLeft = cooldownAmount - (Date.now() - expireTime);
                                if (newTimeLeft <= 0) {
                                    clearInterval(interval);
                                    msg.edit({ embeds: [embed.setDescription(`✅ You can now use the \`${cmd}\` command again!`)] }).then(() => {
                                        setTimeout(() => {
                                            msg.delete();
                                        }, 10000);
                                    });;
                                } else {
                                    msg.edit({ embeds: [embed.setDescription(`❌ Please wait for \`[ ${msToTime(newTimeLeft)} ]\` before reusing the \`${cmd}\` command!`)] });
                                }
                            }, 1000); // Update setiap detik
                            return;
                        }
                    } else {
                        cooldown.set(message.author.id, Date.now());
                    }

                    setTimeout(() => {
                        cooldown.delete(message.author.id);
                    }, cooldownAmount);

                    // Function to format milliseconds to readable time
                    function msToTime(ms) {
                        const seconds = Math.floor((ms / 1000) % 60);
                        const minutes = Math.floor((ms / (1000 * 60)) % 60);
                        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
                        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

                        return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds}s`;
                    }


                try {

                // Check if the user or guild is blacklisted
                const isUserBlacklisted = await Blacklist.findOne({ userId: message.author.id });
                const isGuildBlacklisted = await Blacklist.findOne({ guildId: message.guild.id });

                const row = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setEmoji("<:premiercrafty:1269791654781386844> ").setURL("https://premier-crafty.my.id/").setStyle(ButtonStyle.Link))
                .addComponents(new ButtonBuilder().setEmoji("<:Haruka:1310909092469932102>  ").setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456").setStyle(ButtonStyle.Link))
                .addComponents(new ButtonBuilder().setEmoji("<:paypal:1148981240695885837>").setURL("https://www.paypal.com/paypalme/andrih1997").setStyle(ButtonStyle.Link))
                .addComponents(new ButtonBuilder().setEmoji("<:saweria:1198559864209801216>").setURL("https://saweria.co/andrihermawan/").setStyle(ButtonStyle.Link))
                .addComponents(new ButtonBuilder().setEmoji("🌐").setURL("https://haruka-bot.my.id/").setStyle(ButtonStyle.Link));
    
                if (isUserBlacklisted) {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`❌ You are blacklisted from using this bot. Reason: **\`\`${isUserBlacklisted.reason}\`\`**`)
                        .setFooter({ 
                            text: `Powered By: Premier Crafty`, 
                            iconURL: "https://cdn.discordapp.com/attachments/1102585584117088318/1267371549372190770/premier_crafty.png?ex=66a88b3b&is=66a739bb&hm=4991339ad3c0f18e95cfa6dc279610724fcb2211dc3c6e4089aece30666aaf85&" 
                        });
                
                    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
                    setTimeout(() => {
                        sentMessage.delete().catch(err => console.error("Failed to delete message:", err));
                    }, 30000); // 60 seconds
                    return;
                }
                
                if (isGuildBlacklisted) {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`❌ This server is blacklisted from using this bot. Reason: **\`\`${isGuildBlacklisted.reason}\`\`**`)
                        .setFooter({ 
                            text: `Powered By: Premier Crafty`, 
                            iconURL: "https://cdn.discordapp.com/attachments/1102585584117088318/1267371549372190770/premier_crafty.png?ex=66a88b3b&is=66a739bb&hm=4991339ad3c0f18e95cfa6dc279610724fcb2211dc3c6e4089aece30666aaf85&" 
                        });
                
                    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
                    setTimeout(() => {
                        sentMessage.delete().catch(err => console.error("Failed to delete message:", err));
                    }, 30000); // 60 seconds
                    return;
                }
                
                const currentTime = moment().format('dddd, DD MMMM YYYY, HH:mm:ss');
                
                const logEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`Logs Commands Server ${message.guild.name}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: "👤 User", value: `\`\`${message.author.tag}\`\``, inline: true },
                    { name: "🆔 ID", value: `\`\`${message.author.id}\`\``, inline: true },
                    { name: "📅 Date", value: `\`\`${currentTime}\`\``, inline: true },
                    { name: "⚙️ Command", value: `\`\`${cmd}\`\``, inline: true },
                    { name: "🏠 Guild", value: `\`\`${message.guild.id}\`\``, inline: true },
                    { name: "🏢 Guild Name", value: `\`\`${message.guild.name}\`\``, inline: true },
                    { name: "💬 Channel", value: `\`\`${message.channel.name}\`\``, inline: true }
                );
                
            
            webhookClient.send({
                username: client.user.username,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [logEmbed]
            });
            
            

            if (command.ownerOnly) {
                if (message.author.id !== client.owner && !ownerIDs.includes(message.author.id)) {
                    return message.channel.send({ 
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.i18n.get(language, "message", "owner_only")}`)
                        ]
                    });
                }
            }
            
            
                command.run(client, message, args, user, language, prefix);
            } catch (error) {
                await message.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`❌ An unexpected error occured, the developers have been notified!`)]  }).catch(() => { });
                console.error(error);
            }
        }
    }
}