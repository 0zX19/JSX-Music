const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const formatDuration = require('../../../structures/FormatDuration.js');
const GPrefix = require('../../../settings/models/Prefix');

module.exports = { 
    config: {
        name: "seek",
        description: "Seek timestamp in the song!",
        accessableby: "Member",
        category: "Music",
        usage: "<seconds>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;

        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "seek_loading")}`)] });

        try {
            if (user && user.isPremium) {
                if (!args[0]) return msg.edit({ embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("Seek")
                    .setDescription("Please furnish the demanded arguments.")
                    .addFields(
                        { name: "**Usage**", value: `\`\`${prefix}seek <seconds>\`\`` },
                        { name: "**Example(s)**", value: `\`\`${prefix}seek 5000\`\`` }
                    )
                ] });

                if (isNaN(args[0])) return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "seek_invalid", { prefix: prefix })}`)] });

                const player = client.manager.get(message.guild.id);
                if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)] });

                const { channel } = message.member.voice;
                if (!channel) return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)] });

                if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_join")}`)] });

                if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_speak")}`)] });

                if (message.guild.members.me.voice.channel && !message.guild.members.me.voice.channel.equals(channel)) {
                    return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice", { channel: channel.name })}`)] });
                }

                if (args[0] * 1000 >= player.queue.current.duration || args[0] < 0) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "seek_beyond")}`)] });
                
                await player.seek(args[0] * 1000);

                const Duration = formatDuration(player.position);

                const seeked = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(language, "music", "seek_msg", { duration: Duration })}`)
                    .setColor(client.color);

                msg.edit({ content: ' ', embeds: [seeked] });
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
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.i18n.get(language, "music", "seek_error")}`)
                .setTimestamp();

            msg.edit({ content: " ", embeds: [embed] });
        }
    }
}
