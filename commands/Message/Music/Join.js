const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = { 
    config: {
        name: "join",
        aliases: ["summon"],
        description: "Makes the bot join the voice channel.",
        accessibleBy: "Member",
        category: "Music",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const loadingMessage = await message.channel.send({ 
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "join_loading")}`)] 
        });

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return loadingMessage.edit({ 
                content: " ", 
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)] 
            });
        }

        // Check bot permissions for Connect and Speak in the voice channel
        const permissions = voiceChannel.permissionsFor(message.guild.members.me || message.guild.me);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return loadingMessage.edit({ 
                content: " ", 
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_join")}`)] 
            });
        }

        // If the bot is already in another voice channel, handle it
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
        

        if (!client.manager.nodes.some(node => node.connected)) {
            return loadingMessage.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }
        

        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
        });

        try {
            await player.connect();
        } catch (error) {
            console.error("Error connecting to voice channel:", error);
            return loadingMessage.edit({ 
                content: " ", 
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ Failed to connect to the voice channel. Please try again.")] 
            });
        }

        const joinMessage = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "join_msg", { channel: voiceChannel.toString() })}`)
            .setColor(client.color);

        loadingMessage.edit({ content: " ", embeds: [joinMessage] });
    }
};
