const { WebhookClient, ChannelType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const moment = require("moment");

module.exports = async (client, guild) => {
    // Create a webhook client
    const webhook = new WebhookClient({ url: client.config.guildLogsleave });
    if (!webhook) {
        console.error("Guild log webhook not found. Please check the configuration.");
        return; // Exit early if the webhook isn't found
    }

    // Fetch the owner of the guild safely
    let own;
    try {
        own = await guild?.fetchOwner();
    } catch (error) {
        console.error(`Failed to fetch guild owner: ${error.message}`);
    }

    // Check for a text channel to create an invite
    let inviteLink;
    try {
        const inviteChannel = guild.channels.cache.find(
            (c) =>
                c.type === ChannelType.GuildText &&
                c.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite) &&
                c.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
        );

        if (inviteChannel) {
            inviteLink = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0 });
        }
    } catch (error) {
        console.error(`Failed to create invite link: ${error.message}`);
    }

    // Create the embed for the guild leave
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Left a Server!`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields([
            { name: "Name", value: `\`\`\`${guild.name}\`\`\``, inline: true },
            { name: "ID", value: `\`\`\`${guild.id}\`\`\``, inline: true },
            { name: "Member Count", value: `\`\`\`${guild.memberCount} Members\`\`\``, inline: true },
            {
                name: "Owner",
                value: `\`\`\`${own ? own.user.tag : "Unknown user"} | ${own ? own.id : "Unknown ID"}\`\`\``,
            },
            { name: "Creation Date", value: `\`\`\`${moment.utc(guild.createdAt).format("DD/MMM/YYYY")}\`\`\`` },
            { name: `${client.user.username}'s Server Count`, value: `\`\`\`${client.guilds.cache.size} Servers\`\`\`` },
        ])
        .setColor(client.color)
        .setTimestamp();

    // Set the thumbnail to either the guild icon or the bot's avatar
    if (guild.iconURL()) {
        embed.setThumbnail(guild.iconURL({ size: 2048 }));
    } else {
        embed.setThumbnail(client.user.displayAvatarURL({ size: 2048 }));
    }

    // Set the banner if available
    if (guild.bannerURL()) {
        embed.setImage(guild.bannerURL());
    }

    // Send the embed to the webhook with an invite link if available
    if (inviteLink) {
        await webhook.send({
            embeds: [embed],
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            label: `${guild.name} Invite Link`,
                            style: 5, // Link button
                            url: inviteLink.url,
                        },
                    ],
                },
            ],
        });
    } else {
        await webhook.send({ embeds: [embed] });
    }
};
