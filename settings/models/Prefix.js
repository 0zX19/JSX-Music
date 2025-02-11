const mongoose = require('mongoose');

const prefixSchema = new mongoose.Schema({
    guild: { type: String, required: true },
    prefix: { type: String, required: true },
    oldPrefix: { type: String, default: null },
    moderatorId: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prefix', prefixSchema);