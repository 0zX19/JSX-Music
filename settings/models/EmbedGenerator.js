const mongoose = require('mongoose');

const generator = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    embedChannel: {
        type: String,
        default: null
    },
    embedMessageId: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('embed-generator', generator);
