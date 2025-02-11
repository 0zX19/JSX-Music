const mongoose = require('mongoose');

const KeyInventorySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userID: { type: String, required: true },
    keys: { type: Number, default: 0 },
});

module.exports = mongoose.model('KeyInventory', KeyInventorySchema);
