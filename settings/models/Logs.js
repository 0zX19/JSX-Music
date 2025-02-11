const mongoose = require("mongoose");

const ChannelLogs = mongoose.Schema({
    guild: String,
    channelId: String,
});

module.exports = mongoose.model("LogsChannels", ChannelLogs);
