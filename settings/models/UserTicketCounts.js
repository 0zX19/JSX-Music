const mongoose = require('mongoose');

const userTicketCountSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    ticketCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('UserTicketCount', userTicketCountSchema);
