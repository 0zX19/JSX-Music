const mongoose = require('mongoose');

const WelcomeMessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, default: null },
    title: { type: String, default: 'Welcome!' },
    authorName: { type: String, default: '' },
    description: { type: String, default: '{user}, welcome to {guildname}!' },
    footerText: { type: String, default: '' },
    color: { type: String, default: '#00FF00' },
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('WelcomeMessage', WelcomeMessageSchema);