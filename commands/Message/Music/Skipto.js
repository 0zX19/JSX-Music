const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "skipto",
        aliases: ["jump", "st"],
        description: "Skips to a certain song in the queue.",
        accessableby: "Member",
        category: "Music",
        usage: "<positions>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "skipto_loading")}`)] })

        try {
            if (user && user.isPremium) {
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
            } else {
const premiumEmbed = new EmbedBuilder()
.setAuthor({ name: `${client.i18n.get(language, "nopremium", "premium_author")}`, iconURL: client.user.displayAvatarURL() })
.setDescription(`${client.i18n.get(language, "nopremium", "premium_desc")}`)
.setFooter({ text: 'Prices are subject to change. Contact for the latest information.' })
.setColor(client.color)
.setTimestamp();

                msg.edit({ content: " ", embeds: [premiumEmbed] });
            }
        } catch (err) {
            console.error(err);
            msg.edit({ content: `${client.i18n.get(language, "nopremium", "premium_error")}` });
        }
    }
}