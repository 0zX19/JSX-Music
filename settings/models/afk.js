const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reason: { type: String, default: 'AFK' },
  timestamp: { type: Date, default: Date.now },
  username: { type: String, required: true }, // Original nickname before AFK
});

module.exports = mongoose.model('AFK', afkSchema);