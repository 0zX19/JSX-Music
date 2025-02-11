const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    ownerOnly: true,
    config: {
        name: "restart",
        description: "Shuts down the client!",
        usage: "shutdown",
        accessableby: "Owner",
        aliases: ["stopbot"],
        category: 'Owner'
    },
    run: async (client, message, args, user, language, prefix) => {

    const restart = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "utilities", "restart_msg")}`)
        .setColor(client.color);

    await message.channel.send({ embeds: [restart] });
            
    process.exit();
    }
};