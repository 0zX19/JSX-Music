const { WebhookClient, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const moment = require("moment");

module.exports = async (client, guild) => {
    // Create a webhook client
    const webhook = new WebhookClient({ url: client.config.guildLogsjoin });
    if (!webhook) return console.error('Webhook not found');

    // Fetch the owner of the guild
    let own;
    try {
        own = await guild?.fetchOwner();
    } catch (error) {
        console.error(`Failed to fetch guild owner: ${error.message}`);
        own = { id: 'Unknown', user: { tag: 'Unknown user' } }; // fallback in case fetching fails
    }

    // Find a channel where the bot can create an invite
    const inviteChannel = guild.channels.cache.find(
        (c) => 
            c.type === ChannelType.GuildText &&
            c.permissionsFor(guild.members.me).has([PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.SendMessages])
    );

    let inviteLink;
    if (inviteChannel) {
        try {
            inviteLink = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0 });
        } catch (error) {
            console.error(`Failed to create an invite: ${error.message}`);
        }
    } else {
        console.warn('No channel found with invite permissions');
    }

    // Create an embed with guild information
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Joined a Server!`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields([
            { name: "Name", value: `\`\`\`${guild.name}\`\`\``, inline: true },
            { name: "ID", value: `\`\`\`${guild.id}\`\`\``, inline: true },
            { name: "Member Count", value: `\`\`\`${guild.memberCount} Members\`\`\``, inline: true },
            {
                name: "Owner",
                value: `\`\`\`${guild.members.cache.get(own.id) ? guild.members.cache.get(own.id).user.tag : "Unknown user"} | ${own.id}\`\`\``,
            },
            { name: "Creation Date", value: `\`\`\`${moment.utc(guild.createdAt).format("DD/MMM/YYYY")}\`\`\`` },
            { name: `${client.user.username}'s Server Count`, value: `\`\`\`${client.guilds.cache.size} Servers\`\`\`` },
        ])
        .setColor(client.color)
        .setTimestamp();

    if (guild.iconURL()) {
        embed.setThumbnail(guild.iconURL({ size: 2048 }));
    } else {
        embed.setThumbnail(client.user.displayAvatarURL({ size: 2048 }));
    }

    if (guild.bannerURL()) {
        embed.setImage(guild.bannerURL());
    }

    // Send the embed to the webhook with an invite link if available
    if (inviteLink) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(`${guild.name} Invite Link`)
                .setStyle(ButtonStyle.Link)
                .setURL(inviteLink.url)
        );
        webhook.send({ embeds: [embed], components: [row] });
    } else {
        webhook.send({ embeds: [embed] });
    }

    // Sending a direct message to the guild owner with buttons
    try {
        const owner = await guild.members.fetch(guild.ownerId);
        if (owner) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setEmoji("<:premiercrafty:1269791654781386844>").setURL("https://premier-crafty.my.id/").setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setEmoji("<:Haruka:1310909092469932102> ").setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456").setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setEmoji("<:paypal:1148981240695885837>").setURL("https://www.paypal.com/paypalme/andrih1997").setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setEmoji("<:saweria:1198559864209801216>").setURL("https://saweria.co/andrihermawan/").setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setEmoji("🌐").setURL("https://haruka-bot.my.id/").setStyle(ButtonStyle.Link)
                );
            const thankYouEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Thank You for Adding Me!')
                .setDescription(`Thanks for adding me to your server, ${owner.user.username}!`)
                .addFields({ name: 'How to Use Me', value: 'You can use my prefix **\`h,\`** to start interacting with me!' });

            await owner.send({ embeds: [thankYouEmbed], components: [row] });
            console.log(`Sent thank-you message to ${owner.user.tag}`);
        }
    } catch (error) {
        console.error(`Error sending thank-you message: ${error.message}`);
    }
};
