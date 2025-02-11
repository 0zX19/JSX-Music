// Blacklist.js
const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    guildId: { type: String, unique: true },
    reason: { type: String, default: 'No reason provided' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);