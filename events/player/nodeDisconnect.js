const { yellow, white, red, green } = require("chalk");

module.exports = async (client, node, error) => {
    console.log(
        white("[") +
        yellow("WARN") +
        white("] ") +
        yellow("Node ") +
        white(node.options.identifier) +
        yellow(" disconnected. Attempting to reconnect...")
    );
};
