const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GPrefix = require('../../../settings/models/Prefix');

module.exports = {
    config: {
        name: "help",
        aliases: ["commands"],
        usage: "(command)",
        category: "Utility",
        description: "Displays all commands that the bot has.",
        accessableby: "Members",
    },
    cooldown: 10,
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;
        const categories = {};

        // Collect commands by category
        client.commands.forEach((command) => {
            const category = command.config.category || "Misc";
            if (!categories[category]) categories[category] = [];
            const commandName = Array.isArray(command.config.name)
                ? command.config.name.join(", ") // Gabungkan nama dengan koma
                : command.config.name;
            categories[category].push(commandName);
        });
        
        // Category emojis
        const emo = {
            Information: "ℹ️",
            Music: "🎵",
            Utility: "🔩",
        };

        if (!args[0]) {
            const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: `❓ ${message.guild.name} Command List!`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setDescription(
                Object.entries(emo)
                    .map(([category, emoji]) => `${emoji} **${category}**: **\`${prefix}${category.toLowerCase()}\`**`)
                    .join('\n')
            )
                
            // Button rows
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('Information')
                    .setEmoji(emo.Information)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('Music')
                    .setEmoji(emo.Music)
                    .setStyle(ButtonStyle.Success)
            );
            
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('Utility')
                    .setEmoji(emo.Utility)
                    .setStyle(ButtonStyle.Success),
            );
            

            const row5 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('home-category')
                    .setLabel('Home')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Primary)
            );

            const helpMessage = await message.channel.send({ embeds: [embed], components: [ row1, row2, row5] });

            const filter = (interaction) => interaction.isButton() && interaction.user.id === message.author.id;
            const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

            // Adjust the interaction response to include emojis and the size of each category
            collector.on('collect', async (interaction) => {
                const categoryName = interaction.customId;
            
                if (categoryName === "home-category") {
                    return interaction.update({ embeds: [embed], components: [ row1, row2, row5] });
                }
            
                const commands = categories[categoryName] || [];

                if (!Array.isArray(commands)) {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle('❌ Error')
                        .setDescription('No commands found for this category.');
                    return interaction.update({ embeds: [embed], components: [] });
                }
                
                const description = commands.length
                    ? commands.map(cmd => `\`${prefix}${cmd}\``).join(", ")
                    : "No commands available in this category.";

                const categoryEmbed = new EmbedBuilder()
                    .setTitle(`${emo[categoryName] || ''} ${categoryName} - [${commands.length}]`)
                    .setAuthor({ name: `Default Prefix: ${prefix}\nThe command for reports and bugs is: ${prefix}bugreport` })
                    .setDescription(description)
                    .setColor(client.color);
                
                
                // Mengubah warna tombol yang diklik menjadi hijau
                const updatedRow1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('Information')
                        .setEmoji(emo.Information)
                        .setStyle(categoryName === 'Information' ? ButtonStyle.Primary : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('Music')
                        .setEmoji(emo.Music)
                        .setStyle(categoryName === 'Music' ? ButtonStyle.Primary : ButtonStyle.Success)
                );
            
                const updatedRow2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('Playlist')
                        .setEmoji(emo.Playlist)
                        .setStyle(categoryName === 'Playlist' ? ButtonStyle.Primary : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('Utility')
                        .setEmoji(emo.Utility)
                        .setStyle(categoryName === 'Utility' ? ButtonStyle.Primary : ButtonStyle.Success),
                );

                const updatedRow5 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('home-category')
                        .setLabel('Home')
                        .setEmoji('🏠')
                        .setStyle(ButtonStyle.Primary)
                );

            
                await interaction.update({
                    embeds: [categoryEmbed],
                    components: [ updatedRow1, updatedRow2, updatedRow5],
                });
            });
            
            
            collector.on('end', async () => {
                const timedOutEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `❓ ${message.guild.name} Command List!`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(
                    `\`\`\`js\nThe command for reports and bugs is: ${prefix}bugreport\`\`\`\nHi~ I am Haruka! Nice to meet you. I have many fun commands which can bring a new twist to your server. Hope you have a great day\n\n<:kanan:1154667974733611068> **Command Categories:**\n\n` +
                    Object.entries(emo)
                        .map(([category, emoji]) => `${emoji} **${category}**: **\`${prefix}${category.toLowerCase()}\`**`)
                        .join('\n')
                )
            
                const disabledRow1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('Information').setEmoji(emo.Information).setStyle(ButtonStyle.Success).setDisabled(true),
                    new ButtonBuilder().setCustomId('Music').setEmoji(emo.Music).setStyle(ButtonStyle.Success).setDisabled(true)
                );
            
                const disabledRow2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('Utility').setEmoji(emo.Utility).setStyle(ButtonStyle.Success).setDisabled(true),
                );
            

                const disabledRow5 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('home-category').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary).setDisabled(true),
                );
            
                await helpMessage.edit({
                    embeds: [timedOutEmbed],
                    components: [disabledRow1, disabledRow2, disabledRow5] // Only rowLinks remains enabled
                });
            });
            
        } else {
            let command = client.commands.get(client.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());

            if (!command) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`No information found for the command \`${args[0].toLowerCase()}\``)
                    ],
                });
            }

            const commandEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `${message.guild.name} Help Command`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTitle(`Command: \`${command.config.name}\``)
                .addFields(
                    { name: "Description", value: `${command.config.description || "No description provided."}` },
                    { name: "Usage", value: `\`${prefix}${command.config.usage}\`` },
                    { name: "Category", value: `${command.config.category || "No category provided."}` },
                    { name: "Aliases", value: command.config.aliases ? `\`${command.config.aliases.join(`, `)}\`` : "None" }
                )
                .setFooter({ text: `Syntax: <> = required, [] = optional` })
                .setTimestamp();

            message.channel.send({
                embeds: [commandEmbed]
            });
        }
    }
};