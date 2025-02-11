const { yellow, white, blue } = require("chalk");

module.exports = async (client, node, error) => {
    node.on("nodeDebug", (message) => {
        console.log(
            white('[') +
            blue('DEBUG') +
            white('] ') +
            blue('Node ') +
            white(node.options.identifier) +
            blue(` debug: ${message}`)
        );
    });
};
