const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const os = require("os");
const { stripIndent } = require("common-tags");

module.exports = {
  config: {
    name: "stats",
    description: "Displays the bot status.",
    category: "Information",
    aliases: ["status"],
  },
  ownerOnly: true,
  run: async (client, message) => {
    let interval;
    const stopButton = new ButtonBuilder()
      .setCustomId("stop_updates")
      .setEmoji("🛑")
      .setLabel("Stop Updates")
      .setStyle(ButtonStyle.Danger);

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setEmoji("<:premiercrafty:1269791654781386844>")
        .setURL("https://premier-crafty.my.id/")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setEmoji("<:Haruka:1310909092469932102>")
        .setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setEmoji("<:paypal:1148981240695885837>")
        .setURL("https://www.paypal.com/paypalme/andrih1997")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setEmoji("<:saweria:1198559864209801216>")
        .setURL("https://saweria.co/andrih/")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setEmoji("🌐")
        .setURL("https://haruka-bot.my.id/")
        .setStyle(ButtonStyle.Link)
    );

    const row2 = new ActionRowBuilder().addComponents(stopButton);

    const generateEmbed = () => {
      const guilds = client.guilds.cache.size;
      const users = client.guilds.cache.reduce(
        (size, g) => size + g.memberCount,
        0
      );
      const platform = process.platform.replace(/win32/g, "Windows");
      const cores = os.cpus().length;
      const cpuUsage = `${(process.cpuUsage().user / 1e6).toFixed(2)}%`;
      const model = os.cpus()[0].model;
      const speed = `${os.cpus()[0].speed} MHz`;

      const botUsed = `${(
        process.memoryUsage().heapUsed /
        1024 /
        1024
      ).toFixed(2)} MB`;
      const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
      const botUsage = `${(
        (process.memoryUsage().heapUsed / os.totalmem()) *
        100
      ).toFixed(1)}%`;

      const uptime = `<t:${Math.floor(
        Date.now() / 1000 - client.uptime / 1000
      )}:R>`;
      const developer = `<@795708124442918913>`;

      return new EmbedBuilder()
        .setTitle("System Information")
        .setColor(client.color || "#5865F2") // Default to a color if `client.color` is not set
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(stripIndent`
          ❒ Owner: ${developer}
          ❒ Total guilds: ${guilds} 🌍
          ❒ Total users: ${users} 👥
          ❒ Ping: ${client.ws.ping} ms 📶
          ❒ Speed: ${speed} 🚀
        `)
        .addFields(
          {
            name: "CPU 🧠",
            value: stripIndent`
              ❯ **OS:** ${platform}
              ❯ **Cores:** ${cores} 🏋️‍♂️
              ❯ **Usage:** ${cpuUsage} 💻
            `,
            inline: true,
          },
          {
            name: "Bot's RAM 💾",
            value: stripIndent`
              ❯ **Used:** ${botUsed} 🛠️
              ❯ **Available:** ${botAvailable} 🗄️
              ❯ **Usage:** ${botUsage} 📊
            `,
            inline: true,
          },
          {
            name: "Uptime ⏳",
            value: uptime,
            inline: false,
          },
          {
            name: "System 🖥️",
            value: model,
            inline: false,
          }
        );
    };

    const msg = await message.channel.send({
      embeds: [generateEmbed()],
      components: [row1, row2],
    });

    interval = setInterval(async () => {
      await msg.edit({ embeds: [generateEmbed()] });
    }, 30000);

    const filter = (i) =>
      i.customId === "stop_updates" && i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      clearInterval(interval);
      await i.update({
        content: "Real-time updates stopped.",
        components: [],
      });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        clearInterval(interval);
        msg.edit({
          content: "Real-time updates stopped due to timeout.",
          components: [],
        });
      }
    });
  },
};
