const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true },
  userId: { type: String, required: true } // User ID of the participant
});

module.exports = mongoose.model('Participant', participantSchema);
