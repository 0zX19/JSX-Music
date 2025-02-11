const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    ticketChannelId: { type: String, required: false },
    logChannelId: { type: String, required: false },
    adminRoleId: { type: String, required: false },
    supportRoleId: { type: String, required: false },
    transcriptChannelId: { type: String, required: false },
    ticketCategoryId: { type: String, required: false },
    messageId: { type: String, required: false }
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);
