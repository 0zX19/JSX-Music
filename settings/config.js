require("dotenv").config();
const { resolve } = require("path");

module.exports = {
    TOKEN: process.env.TOKEN || "YOUR_TOKEN",  // your bot token
    PREFIX: process.env.PREFIX || "#", //<= default is #  // bot prefix
    EMBED_COLOR: process.env.EMBED_COLOR || "#000001", //<= default is "#000001"
    guildLogs: process.env.GUILD_LOGS || " ", // your server join left logs Channel ID
    guildLogsjoin: process.env.GUILD_LOGS_JOIN || " ", // your server join logs Channel ID
    guildLogsleave: process.env.GUILD_LOGS_LEAVE || " ", // your server leave logs Channel ID

    ownerIDs: process.env.ownerIDs || "YOUR_CLIENT_ID", //your owner discord id example: "515490955801919488"

    NP_REALTIME: process.env.NP_REALTIME || "true", // "true" = realtime, "false" = not realtime :3 // WARNING: on set to "true" = laggy and bot will ratelimit if you have a lot of servers
    LEAVE_TIMEOUT: parseInt(process.env.LEAVE_TIMEOUT || "120000"), // leave timeout default "120000" = 2 minutes // 1000 = 1 seconds

    LANGUAGE: {
      defaultLocale: process.env.LANGUAGE || "en", // "en" = default language
      directory: resolve("languages"), // <= location of language
    },

    DEV_ID: [], // if you want to use command bot only, you can put your id here example: ["123456789", "123456789"]

    MONGO_URI: process.env.MONGO_URI || "YOUR_MONGO_URI", // your mongo uri
    LIMIT_TRACK: parseInt(process.env.LIMIT_TRACK || "50"),  //<= dafault is "50" // limit track in playlist
    LIMIT_PLAYLIST: parseInt(process.env.LIMIT_PLAYLIST || "10"), //<= default is "10" // limit can create playlist

    NODES: [
      {
        host: process.env.NODE_HOST || "localhost",
        port: parseInt(process.env.NODE_PORT || "5555"),
        password: process.env.NODE_PASSWORD || "123456",
        secure: process.env.NODE_SECURE === "true",  // Convert to boolean
        retryDelay: 300000,
        retryAmount: 25,
      } 
    ],
}