const { white, green, red } = require("chalk");
const mongoose = require("mongoose");
const { MONGO_URI } = require("../settings/config.js");

module.exports = async (client) => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the configuration.");
        }

        await mongoose.connect(MONGO_URI, {
        });

        require("./Database/loadPremium.js")(client);

        console.log(
            white("[") + green("INFO") + white("] ") +
            green("Successfully connected to the database and loaded ") +
            white("Premium Events.")
        );
    } catch (error) {
        console.log(
            white("[") + red("ERROR") + white("] ") +
            red("Failed to connect to the database: ")
        );
        console.error(error.message || error);
    }
};
