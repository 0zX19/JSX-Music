const mongoose = require('mongoose');

const GiveawayLogsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
});

module.exports = mongoose.model('GiveawayLogs', GiveawayLogsSchema);
