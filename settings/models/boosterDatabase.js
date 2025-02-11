const mongoose = require('mongoose');

const boosterSchema = new mongoose.Schema({
    guildId: { type: String, required: true },     // ID of the guild (server)
    channelId: { type: String },                   // ID of the channel where notifications will be sent
    userId: { type: String },                      // ID of the user who boosted the server
    message: { type: String, default: 'Thank you {user} for boosting the server! We now have {totalboosters} boosts!' },  // Default message template
    isEnabled: { type: Boolean, default: false },  // Whether booster notifications are enabled
    totalBoosters: { type: Number, default: 0 }    // Total number of boosts in the server
}, { timestamps: true });

let BoosterNotification;

try {
    BoosterNotification = mongoose.model('BoosterNotification');
} catch (error) {
    BoosterNotification = mongoose.model('BoosterNotification', boosterSchema);
}

module.exports = BoosterNotification;
