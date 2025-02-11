const mongoose = require('mongoose');

// Schema GiveawayRole
const giveawayRoleSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true, // Guild ID wajib ada
  },
  roleId: {
    type: String,
    required: true, // Role ID yang diatur untuk giveaways
  },
});

// Export model
module.exports = mongoose.model('GiveawayRole', giveawayRoleSchema);
