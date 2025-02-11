const { readdirSync } = require("fs");
const { white, green, red } = require("chalk"); // Added red for error logging

module.exports = async (client) => {
    // Function to load commands from each category
    const load = (dirs) => {
        const commands = readdirSync(`./commands/Message/${dirs}/`).filter((d) => d.endsWith('.js'));
        for (const file of commands) {
            try {
                const pull = require(`../commands/Message/${dirs}/${file}`);
                // Check if config and name exist
                if (!pull.config || !pull.config.name) {
                    console.log(red(`Error loading command from file ${file}: Missing config or config.name`));
                    continue; // Skip this file
                }
                client.commands.set(pull.config.name, pull);
                if (pull.config.aliases) {
                    pull.config.aliases.forEach((alias) => client.aliases.set(alias, pull.config.name));
                }
            } catch (error) {
                console.log(red(`Error loading command from file ${file}: ${error.message}`));
            }
        }
    };

    // Reading all folders in the `commands` directory and loading commands from each folder
    const directories = readdirSync('./commands/Message').filter((dir) => {
        // Ensure only folders are loaded, not files
        return readdirSync(`./commands/Message/${dir}`).some(file => file.endsWith('.js'));
    });

    directories.forEach(load);

    console.log(
        white('[') + green('INFO') + white('] ') + green('LoadCommands ') +
        white('Events') + green(' Loaded!')
    );
};
