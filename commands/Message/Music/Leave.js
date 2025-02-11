const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "leave",
        aliases: ["lev", "stop", "dc"],
        description: "Makes the bot leave the voice channel.",
        accessableby: "Member",
        category: "Music",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "leave_loading")}`)] });

        const player = client.manager.get(message.guild.id);
            if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });


        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)] });
        }

        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }

        const permissions = voiceChannel.permissionsFor(message.guild.members.me);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            const permissionMsg = !permissions.has(PermissionsBitField.Flags.Connect) ? "play_join" : "play_speak";
            return msg.edit({ content: " ", embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", permissionMsg)}`)] });
        }

        if (message.guild.members.me.voice.channel && message.guild.members.me.voice.channel.id !== voiceChannel.id) {
            return loadingMessage.edit({
                content: " ", 
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(` ❌ I'm already connected in <#${voiceChannel.id}> to use this **join** command.`)
                ]
            });
        }
        

        await player.destroy();
        await client.clearInterval(client.interval);

        const embed = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "leave_msg", { channel: voiceChannel.toString() })}`)
            .setColor(client.color);

        msg.edit({ content: " ", embeds: [embed] });
    }
}

