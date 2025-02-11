const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    username: String,
    email: String,
    packageType: String,
    paymentMethod: String,
    orderDate: String,
    userId: String,
    userLink: String,
});

module.exports = mongoose.model("Order", orderSchema);
