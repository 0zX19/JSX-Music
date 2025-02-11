// models/EconomyDatabase.js
const mongoose = require('mongoose');

// Define the schema for storing user economy data
const economySchema = new mongoose.Schema({
    guild: { type: String, required: true },
    userID: { type: String, required: true },
    username: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    registered: { type: Boolean, default: false },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    oldLevel: { type: Number },
    lastDaily: { type: Date, default: null },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    cookies: { type: Number, default: 0 },
    luck: {
        type: Number,
        default: 0, // Jumlah poin keberuntungan default
    },
    dailyCooldown: {
        type: Number,
        default: 0 // Initialize dailyCooldown to 0 for new users
    },
    dailyCooldown_: {
        type: Number,
        default: 0 // Initialize dailyCooldown to 0 for new users
    },
    monthlyCooldown: {
        type: Number,
        default: 0 // Initialize monthlyCooldown to 0 for new users
    },
    cookieCooldown: {
        type: Number,
        default: 0 // Initialize cookieCooldown to 0 for new users
    },
    robCooldown: {
        type: Number,
        default: 0 // Initialize robCooldown to 0 for new users
    },
    gambleCooldown: {
        type: Number,
        default: 0 // Initialize robCooldown to 0 for new users
    },
    depositCooldown: {
        type: Number,
        default: 0 // Initialize robCooldown to 0 for new users
    },
    huntCooldown: {
        type: Number,
        default: 0 // Initialize robCooldown to 0 for new users
    },
    prayCooldown: {
        type: Number,
        default: 0 // Initialize robCooldown to 0 for new users
    },
});

module.exports = mongoose.model('Economy', economySchema);
