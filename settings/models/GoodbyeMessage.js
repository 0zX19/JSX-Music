const mongoose = require('mongoose');

const GoodbyeMessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, default: null },
    title: { type: String, default: 'Goodbye!' },
    authorName: { type: String, default: '' },
    description: { type: String, default: '{user}, goodbye to {guildname}!' },
    footerText: { type: String, default: '' },
    color: { type: String, default: '#00FF00' },
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('GoodbyeMessage', GoodbyeMessageSchema);