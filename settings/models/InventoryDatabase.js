const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    guild: { type: String, required: true },
    userID: { type: String, required: true },
    items: [
        {
            name: { type: String, required: true },
            rarity: { type: String, required: true },
            xp: { type: Number, required: true },
            huntedAt: { type: Date, default: Date.now }, // Timestamp of when the animal was hunted
        },
    ],
    stamina: { type: Number, default: 0 },
});

module.exports = mongoose.model('Inventory', inventorySchema);
