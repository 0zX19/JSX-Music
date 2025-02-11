// models/RoleShop.js
const mongoose = require('mongoose');

// Define the schema for the role shop
const roleShopSchema = new mongoose.Schema({
    guild: { type: String, required: true },  // Store the guild ID
    roleID: { type: String, required: true },
    rolePrice: { type: Number, required: true },
});

// Create the model
module.exports = mongoose.model('RoleShop', roleShopSchema);
