// models/SettingsDatabase.js
const mongoose = require('mongoose');

const levelup = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    levelUpChannel: {
        type: String,
        default: null, // Stores the channel ID for level-up notifications
    },
    // Additional settings can be added here if needed
});

module.exports = mongoose.model('levelupchannel', levelup);
