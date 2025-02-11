const mongoose = require('mongoose');

// Define the schema for the autoresponder
const autoresponderSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    trigger: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
});

// Create the Autoresponder model based on the schema
const Autoresponder = mongoose.model('Autoresponder', autoresponderSchema);

module.exports = { Autoresponder };
