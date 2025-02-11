const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const GLang = require("../../settings/models/Language.js");
const Setup = require("../../settings/models/Setup.js");

module.exports = async (client, player) => {
	const channel = client.channels.cache.get(player.textChannel);
	if (!channel) {
		console.error("Channel not found or bot lacks access.");
		return;
	}

	if (!channel.permissionsFor(client.user).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.EmbedLinks])) {
		console.error("Bot lacks permissions in this channel.");
		return;
	}

	if (player.twentyFourSeven) return;

    const guildModel = await GLang.findOne({ guild: channel.guild.id });
    const { language } = guildModel;

	/////////// Update Music Setup ///////////

	await client.UpdateMusic(player);
	await client.clearInterval(client.interval);

	const db = await Setup.findOne({ guild: channel.guild.id });
	if (db.enable) return player.destroy();

	////////// End Update Music Setup //////////

	const row = new ActionRowBuilder()
	.addComponents(new ButtonBuilder().setEmoji("<:premiercrafty:1269791654781386844> ").setURL("https://premier-crafty.my.id/").setStyle(ButtonStyle.Link))
	.addComponents(new ButtonBuilder().setEmoji("<:Haruka:1310909092469932102>  ").setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456").setStyle(ButtonStyle.Link))
	.addComponents(new ButtonBuilder().setEmoji("<:paypal:1148981240695885837>").setURL("https://www.paypal.com/paypalme/andrih1997").setStyle(ButtonStyle.Link))
	.addComponents(new ButtonBuilder().setEmoji("<:saweria:1198559864209801216>").setURL("https://saweria.co/andrihermawan/").setStyle(ButtonStyle.Link))
	.addComponents(new ButtonBuilder().setEmoji("🌐").setURL("https://haruka-bot.my.id/").setStyle(ButtonStyle.Link));

    const embed = new EmbedBuilder()
    .setDescription("Thank you for using our service!\n\n**Loving the bot**?\nConsider becoming a [Paypal](https://www.paypal.com/paypalme/andrih1997) & [Saweria]( https://saweria.co/andrihermawan/) to support our hard work and the future development of the bot, even just a dollar if you can")
    .setColor(client.color)
    .setImage("https://cdn.discordapp.com/attachments/1102585584117088318/1284056414209179678/haruka_banner_new.png?ex=66f661b9&is=66f51039&hm=e0e4aa9491f89994ba3b92bd95b7c0c74ded645bfdb59c353eaea04ca545b873&")

	await channel.send({ embeds: [embed], components: [row] });
	return player.destroy();
}