const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Redeem = require('../../../settings/models/Redeem.js');
const moment = require('moment');
var voucher_codes = require('voucher-code-generator');
const GPrefix = require('../../../settings/models/Prefix');


module.exports = { 
    ownerOnly: true,
    config: {
        name: "generate",
        aliases: ["gencode", "genpremiumcode", "genpremium"],
        usage: "<amount>",
        description: "Generate a premium code",
        accessableby: "Owner",
        category: "Owner",
    },
    run: async (client, message, args, user, language) => {
      const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
      const prefix = GuildPrefix ? GuildPrefix.prefix : "!"; // default prefix if not set
    let codes = [];

    let amount = args[0];
    if (!amount) amount = 1;

    const plans = ['daily', 'weekly', 'monthly', 'yearly'];

    // Menambahkan lebih banyak pilihan durasi
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('daily')
          .setLabel('Daily')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('weekly')
          .setLabel('Weekly')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('biweekly')
          .setLabel('2 Weeks')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('threeweeks')
          .setLabel('3 Weeks')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
      );
    
    // Tambahkan baris kedua untuk opsi tambahan
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('monthly')
          .setLabel('Monthly')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('twomonths')
          .setLabel('2 Months')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('threemonths')
          .setLabel('3 Months')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('twoyears')
          .setLabel('2 Years')
          .setStyle(ButtonStyle.Secondary)
      );

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle('Generate Premium Code')
      .setDescription('Please select a plan for the premium code or cancel the operation.')
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row, row2] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'cancel') {
        const cancelEmbed = new EmbedBuilder()
          .setColor('Red')
          .setDescription('Operation cancelled.');
        return interaction.update({ embeds: [cancelEmbed], components: [] });
      }

      let time;
      const plan = interaction.customId;

      if (plan === 'daily') time = Date.now() + 86400000;
      if (plan === 'weekly') time = Date.now() + 86400000 * 7;
      if (plan === 'biweekly') time = Date.now() + 86400000 * 14;  // 2 minggu
      if (plan === 'threeweeks') time = Date.now() + 86400000 * 21;  // 3 minggu
      if (plan === 'monthly') time = Date.now() + 86400000 * 30;
      if (plan === 'twomonths') time = Date.now() + 86400000 * 60;  // 2 bulan
      if (plan === 'threemonths') time = Date.now() + 86400000 * 90;  // 3 bulan
      if (plan === 'yearly') time = Date.now() + 86400000 * 365;
      if (plan === 'twoyears') time = Date.now() + 86400000 * 730;  // 2 tahun

      for (let i = 0; i < amount; i++) {
        const codePremium = voucher_codes.generate({
          pattern: '####-####-####'
        });

        const code = codePremium.toString().toUpperCase();
        const find = await Redeem.findOne({ code: code });

        if (!find) {
          Redeem.create({
            code: code,
            plan: plan,
            expiresAt: time
          });
          codes.push(`${i + 1} - ${code}`);
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({ name: `${client.i18n.get(language, "premium", "gen_author")}`, iconURL: client.user.avatarURL() })
        .setDescription(`${client.i18n.get(language, "premium", "gen_desc", {
          codes_length: codes.length,
          codes: codes.join('\n'),
          plan: plan,
          expires: moment(time).format('dddd, MMMM Do YYYY')
        })}`)
        .setTimestamp()
        .setFooter({ text: `${client.i18n.get(language, "premium", "gen_footer", {
          prefix: prefix
        })}`, iconURL: message.author.displayAvatarURL() });

      await interaction.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        sentMessage.edit({ components: [] });
      }
    });
  }
};
