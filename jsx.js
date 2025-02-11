const { Client, 
Collection, 
GatewayIntentBits, 
Partials,
InteractionType, 
ModalBuilder, 
TextInputBuilder, 
TextInputStyle, 
EmbedBuilder,
WebhookClient,
ButtonBuilder, 
ButtonStyle, 
ActionRowBuilder,
MessageFlags,
PermissionsBitField  } = require("discord.js");
const { Manager } = require("erela.js");
const Spotify = require("better-erela.js-spotify").default;
const { I18n } = require("locale-parser");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");
const Utils = require('./handlers/Utils');
const GPrefix = require('./settings/models/Prefix');
const Order = require('./settings/models/OrderDatabase.js');



class MainClient extends Client {
	constructor() {
        super({
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            lastShard: getInfo().LAST_SHARD_ID,
            shardId: getInfo().SHARD_ID,
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: false
            },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User,
                Partials.GuildScheduledEvent
            ],
        });

    this.config = require("./settings/config.js");
    this.button = require("./settings/button.js");
    this.prefix = this.config.PREFIX;
    this.owner = this.config.OWNER_ID;
    this.aliases = new Collection();
    this.Cooldown = new Collection();
    this.util = new Utils(this);
    this.dev = this.config.DEV_ID;
    this.color = this.config.EMBED_COLOR;
    this.i18n = new I18n(this.config.LANGUAGE);
    if(!this.token) this.token = this.config.TOKEN;

    const WEBHOOK_URL = process.env.ERROR_LOGS_WEBHOOK; // Ganti dengan URL webhook Anda
    
// Membuat client webhook
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

function sendErrorMessage(client, error, type) {
    if (!client || !client.user) {
        console.error('Client or client.user is not ready.');
        return;
    }

    const errorEmbed = new EmbedBuilder()
        .setTitle(`🚨 ${type} Detected`)
        .setDescription(`\`\`\`${error.stack || error.message || 'No stack trace available'}\`\`\``)
        .setColor('Red')
        .setTimestamp();

    try {
        // Kirim juga ke webhook
        webhookClient.send({
            username: client.user.username,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [errorEmbed],
            content: `🚨 ${type} Detected in the bot!`
        });
    } catch (sendError) {
        console.error('Failed to send webhook message:', sendError);
    }
}

// Handling unhandledRejection
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    sendErrorMessage(client, error, 'Unhandled Rejection');
    if (error instanceof Error) {
        console.error(`Stack Trace: ${error.stack}`);
    } else {
        console.error('Unhandled Rejection is not an Error instance:', error);
    }
});

// Handling uncaughtException
let uncaughtExceptionCount = 0; // Menggabungkan uncaughtException handler

process.on('uncaughtException', (error) => {
    uncaughtExceptionCount++;
    console.error('Uncaught Exception:', error);
    sendErrorMessage(client, error, 'Uncaught Exception');

    if (uncaughtExceptionCount >= 3) {
        console.error('Too many uncaught exceptions. Exiting...');
        process.exit(1); // Keluar jika terlalu banyak uncaught exceptions
    } else {
        // Graceful shutdown setelah uncaught exception
        setTimeout(() => {
            process.exit(1); // Keluar dari proses dengan kode error 1
        }, 1000);
    }
});

// Handling warning
process.on('warning', (warning) => {
    console.warn('Warning detected:', warning);
    sendErrorMessage(client, warning, 'Warning');
});

// Handling rejection handled
process.on('rejectionHandled', (promise) => {
    console.warn('Rejection handled for promise:', promise);
    sendErrorMessage(client, { message: 'A previously rejected promise was handled later.' }, 'Handled Rejection');
});
    

	const client = this;

    this.manager = new Manager({
        nodes: this.config.NODES,
        autoPlay: true,
        plugins: [
            new Spotify({
                clientID: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
        ],
        send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
        },
    });

    const { Autoresponder } = require('./settings/models/autoresponder');
    const GuildConfig = require('./settings/models/GuildConfigs');
    const UserTicketCount = require('./settings/models/UserTicketCounts');
    // Bug Repoert
    client.on('interactionCreate', async (interaction) => {
        try {
            // Button Interaction to Open Modal
            if (interaction.isButton() && interaction.customId === 'open_bug') {
                const modal = new ModalBuilder()
                    .setCustomId('report_modal')
                    .setTitle('Bug Report');

                const feedbackInput = new TextInputBuilder()
                    .setCustomId('bugreport_input')
                    .setLabel('Please provide your bug report')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const feedbackRow = new ActionRowBuilder().addComponents(feedbackInput);
                modal.addComponents(feedbackRow);

                await interaction.showModal(modal);
            }

            // Modal Submit Interaction
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'report_modal') {
                const feedback = interaction.fields.getTextInputValue('bugreport_input');
                const userId = interaction.user.id;
                const userName = interaction.user.username;

                if (feedback.length < 5) {
                    await interaction.reply({ content: 'Please provide more details in your bug report.', flags: MessageFlags.Ephemeral, });
                    return;
                }

                const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                const embedThanks = new EmbedBuilder()
                    .setTitle('Bug Report Submitted')
                    .setDescription(`Thank you, <@${userId}>, for your bug report.`)
                    .setFooter({ text: timestamp })
                    .setColor(client.color);

                await interaction.reply({
                    embeds: [embedThanks],
                    flags: MessageFlags.Ephemeral,
                });

                // Fetch and Notify Bot Owners
                const ownerIDs = process.env.OwnerIDs.split(',').map(id => id.trim()); // Ensure IDs are trimmed and split properly
                for (const id of ownerIDs) {
                    try {
                        const owner = await client.users.fetch(id).catch(() => null);
                        if (!owner) {
                            console.error(`Owner with ID ${id} not found.`);
                            continue;
                        }

                        const ownerEmbed = new EmbedBuilder()
                            .setTitle('New Bug Report')
                            .setThumbnail(interaction.user.displayAvatarURL({ format: 'png', size: 128 }))
                            .addFields(
                                { name: 'Name', value: userName, inline: true },
                                { name: 'Discord ID', value: userId, inline: true },
                                { name: 'Date', value: `**\`${timestamp}\`**`, inline: true },
                                { name: 'Bug Report', value: feedback, inline: false },
                            )
                            .setColor(client.color);

                        const replyButton = new ButtonBuilder()
                            .setCustomId(`reply_${userId}`)
                            .setLabel('Reply')
                            .setStyle(ButtonStyle.Primary);

                        const buttonRow = new ActionRowBuilder().addComponents(replyButton);

                        await owner.send({
                            embeds: [ownerEmbed],
                            components: [buttonRow],
                        }).catch(err => {
                            console.error(`Failed to send DM to owner with ID ${id}:`, err);
                        });
                    } catch (err) {
                        console.error(`Unexpected error while processing owner ID ${id}:`, err);
                    }
                }
            }

            // Button Reply Interaction
            if (interaction.isButton() && interaction.customId.startsWith('reply_')) {
                const userId = interaction.customId.split('_')[1];
                const user = await client.users.fetch(userId).catch(() => null);
                if (!user) {
                    await interaction.reply({ content: 'User not found.',                flags: MessageFlags.Ephemeral, });
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId(`reply_modal_${userId}`)
                    .setTitle(`Reply to ${user.username}`);

                const replyInput = new TextInputBuilder()
                    .setCustomId('reply_input')
                    .setLabel('Your reply')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const replyRow = new ActionRowBuilder().addComponents(replyInput);
                modal.addComponents(replyRow);

                await interaction.showModal(modal);
            }

            // Modal Submit for Reply
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('reply_modal_')) {
                const userId = interaction.customId.split('_')[2];
                const user = await client.users.fetch(userId).catch(() => null);
                if (!user) {
                    await interaction.reply({ content: 'User not found.',                flags: MessageFlags.Ephemeral, });
                    return;
                }

                const replyMessage = interaction.fields.getTextInputValue('reply_input');

                const replyEmbed = new EmbedBuilder()
                    .setTitle('Reply from Bot Owner')
                    .setDescription(replyMessage)
                    .setColor(client.color)
                    .setTimestamp();

                await user.send({ embeds: [replyEmbed] }).catch(err => {
                    console.error(`Failed to send reply to user ${userId}.`);
                });

                await interaction.reply({ content: 'Reply sent successfully!',                flags: MessageFlags.Ephemeral, });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'An error occurred.',                flags: MessageFlags.Ephemeral, });
            } else {
                await interaction.reply({ content: 'An error occurred.',                flags: MessageFlags.Ephemeral, });
            }
        }
    });
        
    // Feedback
    client.on('interactionCreate', async (interaction) => {
        try {
            // Open Feedback Form
            if (interaction.isButton() && interaction.customId === 'open_form') {
                const modal = new ModalBuilder()
                    .setCustomId('form_modal')
                    .setTitle('Feedback');

                const feedbackInput = new TextInputBuilder()
                    .setCustomId('feedback_input')
                    .setLabel('Please provide your feedback')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const feedbackRow = new ActionRowBuilder().addComponents(feedbackInput);
                modal.addComponents(feedbackRow);

                await interaction.showModal(modal);
            }

            // Handle Feedback Submission
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'form_modal') {
                const feedback = interaction.fields.getTextInputValue('feedback_input');
                const userId = interaction.user.id;
                const userName = interaction.user.username;

                const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                const embedThanks = new EmbedBuilder()
                    .setTitle('Feedback Submitted')
                    .setDescription(`Thank you, <@${userId}>, for your feedback.`)
                    .setFooter({ text: timestamp })
                    .setColor(client.color);

                await interaction.reply({
                    embeds: [embedThanks],
                    flags: MessageFlags.Ephemeral,
                });

                const ownerIDs = process.env.OwnerIDs.split(',').map(id => id.trim());
                for (const id of ownerIDs) {
                    try {
                        const owner = await client.users.fetch(id);
                        if (!owner) {
                            console.error(`Owner with ID ${id} not found.`);
                            continue;
                        }

                        const ownerEmbed = new EmbedBuilder()
                            .setTitle('New Feedback Submission')
                            .setThumbnail(interaction.user.displayAvatarURL({ format: 'png', size: 128 }))
                            .addFields(
                                { name: 'Name', value: userName, inline: true },
                                { name: 'Discord ID', value: userId, inline: true },
                                { name: 'Date', value: `**\`${timestamp}\`**`, inline: true },
                                { name: 'Feedback', value: feedback, inline: false },
                            )
                            .setColor(client.color);

                        // Button for Replying to Feedback
                        const replyButton = new ButtonBuilder()
                            .setCustomId(`reply_feedback_${userId}`)
                            .setLabel('Reply')
                            .setStyle(ButtonStyle.Primary);

                        const buttonRow = new ActionRowBuilder().addComponents(replyButton);

                        await owner.send({
                            embeds: [ownerEmbed],
                            components: [buttonRow],
                        });
                    } catch (err) {
                        console.error(`Failed to send feedback to owner with ID ${id}:`, err);
                    }
                }
            }

            // Handle Reply Button
            if (interaction.isButton() && interaction.customId.startsWith('reply_feedback_')) {
                const userId = interaction.customId.split('_')[2];
                const user = await client.users.fetch(userId).catch(() => null);
                if (!user) {
                    await interaction.reply({ content: 'User not found.',                flags: MessageFlags.Ephemeral, });
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId(`reply_modal_${userId}`)
                    .setTitle(`Reply to ${user.username}`);

                const replyInput = new TextInputBuilder()
                    .setCustomId('reply_input')
                    .setLabel('Your reply')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const replyRow = new ActionRowBuilder().addComponents(replyInput);
                modal.addComponents(replyRow);

                await interaction.showModal(modal);
            }

            // Handle Reply Submission
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('reply_modal_')) {
                const userId = interaction.customId.split('_')[2];
                const user = await client.users.fetch(userId).catch(() => null);
                if (!user) {
                    await interaction.reply({ content: 'User not found.',                flags: MessageFlags.Ephemeral, });
                    return;
                }

                const replyMessage = interaction.fields.getTextInputValue('reply_input');

                const replyEmbed = new EmbedBuilder()
                    .setTitle('Reply from Bot Owner')
                    .setDescription(replyMessage)
                    .setColor(client.color)
                    .setTimestamp();

                await user.send({ embeds: [replyEmbed] }).catch(err => {
                    console.error(`Failed to send reply to user ${userId}:`, err);
                });

                await interaction.reply({ content: 'Reply sent successfully!',                flags: MessageFlags.Ephemeral, });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'An error occurred.',                flags: MessageFlags.Ephemeral, });
            } else {
                await interaction.reply({ content: 'An error occurred.',                flags: MessageFlags.Ephemeral, });
            }
        }
    });

    // Order
    client.on('interactionCreate', async (interaction) => {
        try {
            // Handle button interaction untuk membuka modal
            if (interaction.isButton() && interaction.customId === 'open_order_form') {
                const modal = new ModalBuilder()
                    .setCustomId('order_form_modal')
                    .setTitle('Order Premium Membership');
    
                const usernameInput = new TextInputBuilder()
                    .setCustomId('username_input')
                    .setLabel('Enter your username:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
    
                const emailInput = new TextInputBuilder()
                    .setCustomId('email_input')
                    .setLabel('Enter your email address:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
    
                const packageInput = new TextInputBuilder()
                    .setCustomId('package_input')
                    .setLabel('Choose your package:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
    
                const paymentInput = new TextInputBuilder()
                    .setCustomId('payment_method_input')
                    .setLabel('Payment method (PayPal, SEA BANK, etc.):')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
    
                modal.addComponents(
                    new ActionRowBuilder().addComponents(usernameInput),
                    new ActionRowBuilder().addComponents(emailInput),
                    new ActionRowBuilder().addComponents(packageInput),
                    new ActionRowBuilder().addComponents(paymentInput)
                );
    
                await interaction.showModal(modal);
            }
    
            // Handle modal submission
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'order_form_modal') {
                const username = interaction.fields.getTextInputValue('username_input');
                const email = interaction.fields.getTextInputValue('email_input');
                const packageType = interaction.fields.getTextInputValue('package_input');
                const paymentMethod = interaction.fields.getTextInputValue('payment_method_input');
                const orderDate = new Date().toLocaleString();
                const userId = interaction.user.id;
                const userLink = `<@${userId}>`;
    
                // Simpan order ke database
                const newOrder = new Order({
                    username,
                    email,
                    packageType,
                    paymentMethod,
                    orderDate,
                    userId,
                    userLink,
                });
    
                await newOrder.save();

                const ORDER = process.env.WEBHOOK_ORDER

                const WebhookOrder = new WebhookClient({ url: ORDER });
    
                // Log order ke saluran webhook dengan embed
                const logEmbed = new EmbedBuilder()
                    .setTitle('New Order Received')
                    .addFields(
                        { name: 'Username', value: username, inline: true },
                        { name: 'Email', value: email, inline: true },
                        { name: 'Package', value: packageType, inline: true },
                        { name: 'Payment Method', value: paymentMethod, inline: true },
                        { name: 'Order Date', value: orderDate, inline: true },
                        { name: 'User ID', value: userId, inline: true },
                        { name: 'User Profile', value: userLink, inline: true }
                    )
                    .setColor('#3498db')
                    .setTimestamp();
    
                await WebhookOrder.send({
                    username: client.user.username,
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [logEmbed],
                });
    
                // Kirim konfirmasi ke pengguna
                const confirmationEmbed = new EmbedBuilder()
                    .setTitle('Order Confirmation')
                    .setDescription(
                        'Thank you for your order! We have successfully received your request and it is now being processed. Please wait while we finalize the details.'
                    )
                    .addFields(
                        { name: 'Username', value: username, inline: true },
                        { name: 'Email', value: email, inline: true },
                        { name: 'Package', value: packageType, inline: true },
                        { name: 'Payment Method', value: paymentMethod, inline: true },
                        { name: 'Order Date', value: orderDate, inline: true },
                        { name: 'User ID', value: userId, inline: true },
                        { name: 'User Profile', value: userLink, inline: true }
                    )
                    .setColor('White');
    
                await interaction.reply({
                    embeds: [confirmationEmbed],
                    flags: MessageFlags.Ephemeral,
                });
    
                // Kirim order ke owner
                const ownerIDs = process.env.OwnerIDs.split(',').map((id) => id.trim());
                for (const id of ownerIDs) {
                    try {
                        const owner = await client.users.fetch(id);
                        const ownerEmbed = new EmbedBuilder()
                            .setTitle('New Order Received')
                            .addFields(
                                { name: 'Username', value: username, inline: true },
                                { name: 'Email', value: email, inline: true },
                                { name: 'Package', value: packageType, inline: true },
                                { name: 'Payment Method', value: paymentMethod, inline: true },
                                { name: 'Order Date', value: orderDate, inline: true },
                                { name: 'User ID', value: userId, inline: true },
                                { name: 'User Profile', value: userLink, inline: true }
                            )
                            .setColor('White');
    
                        await owner.send({ embeds: [ownerEmbed] });
                    } catch (error) {
                        console.error(`Failed to send order details to owner with ID: ${id}`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
            }
        }
    });
    

    const TICKETS_ADMIN_ROLE_NAME = "Tickets Admin"; // Change this to your actual role name
    // Ticket
    client.on('interactionCreate', async (interaction) => {
        const GuildPrefix = await GPrefix.findOne({ guild: interaction.guild.id });
        const prefix = GuildPrefix ? GuildPrefix.prefix : "!";
        
        if (!interaction.isButton()) return;
    
        const { customId, guild, user, channel } = interaction;
        
        // Check if interaction is in a guild
        if (!guild) return;
    
        const member = guild.members.cache.get(user.id);
        const hasAdminRole = member.roles.cache.some(role => role.name === TICKETS_ADMIN_ROLE_NAME);
        const isAdministrator = member.permissions.has(PermissionsBitField.Flags.Administrator);
    
        // Ticket Create
        if (customId === "TICKET_CREATE") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Gunakan `flags` untuk menandai balasan sebagai ephemeral
        
            const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
            if (!guildConfig) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Ticket system is not set up yet.')
                    .setFooter({ text: `${prefix}ticket-setup` });
                return interaction.editReply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral, // Gunakan `flags` untuk balasan ephemeral
                });
            }
        
            const ticketCategory = guild.channels.cache.get(guildConfig.ticketCategoryId);
            if (!ticketCategory || ticketCategory.type !== 4) { // 4 corresponds to GUILD_CATEGORY
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Ticket category is not set up correctly.')
                    .setFooter({ text: `${prefix}ticket-category <category>` });
                return interaction.editReply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral, // Gunakan `flags` untuk balasan ephemeral
                });
            }
        
            const ticketChannelName = `ticket-${user.username}`;
            const existingChannel = guild.channels.cache.find(c => c.name === ticketChannelName);
        
            if (existingChannel) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('You already have an open ticket.');
                return interaction.editReply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral, // Gunakan `flags` untuk balasan ephemeral
                });
            }
        
            // Retrieve or create user ticket count
            let userTicket = await UserTicketCount.findOne({ guildId: guild.id, userId: user.id });
            if (!userTicket) {
                userTicket = new UserTicketCount({ guildId: guild.id, userId: user.id });
            }
        
            // Increment the ticket count
            userTicket.ticketCount += 1;
            await userTicket.save();
        
            const adminRoleId = guildConfig.adminRoleId ? guild.roles.cache.get(guildConfig.adminRoleId) : null;
            const supportRoleId = guildConfig.supportRoleId ? guild.roles.cache.get(guildConfig.supportRoleId) : null;
        
            const ticketChannel = await guild.channels.create({
                name: ticketChannelName,
                type: 0, // Numeric value for GUILD_TEXT
                parent: ticketCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks],
                    },
                    adminRoleId && {
                        id: adminRoleId.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks],
                    },
                    supportRoleId && {
                        id: supportRoleId.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks],
                    },
                ].filter(Boolean),
            });
        
            await ticketChannel.send({
                content: `<@${user.id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription('Support will be with you shortly.\nUse the buttons below to close the ticket or view transcripts.')
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('TICKET_CLOSE')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('TICKET_TRANSCRIPTS')
                            .setLabel('Transcripts')
                            .setStyle(ButtonStyle.Secondary)
                    )
                ]
            });
        
            // Log ticket creation to the log channel
            const logChannel = guild.channels.cache.get(guildConfig.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Created')
                    .setDescription(`A new ticket has been created by ${user.tag}.`)
                    .addFields(
                        { name: 'User', value: `<@${user.id}>`, inline: true },
                        { name: 'Channel', value: `${ticketChannel}`, inline: true },
                        { name: 'Ticket Count', value: `${userTicket.ticketCount}`, inline: true }
                    )
                    .setTimestamp()
                    .setColor(client.color);
                logChannel.send({ embeds: [logEmbed] });
            }
        
            const embed = new EmbedBuilder()
                .setTitle('Ticket Created')
                .setDescription(`A new ticket has been created by ${user.tag}.`)
                .addFields(
                    { name: 'User', value: `<@${user.id}>`, inline: true },
                    { name: 'Channel', value: `${ticketChannel}`, inline: true }
                )
                .setTimestamp()
                .setColor(client.color);
            await interaction.editReply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral, // Gunakan `flags` untuk balasan ephemeral
            });
        }
        
        // Ticket Close
        else if (customId === "TICKET_CLOSE") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (!channel.name.startsWith('ticket-')) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('This is not a ticket channel.');
                return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            const hasSupportRole = member.roles.cache.some(role => role.name === "Tickets Support");
            if (!(hasAdminRole || isAdministrator || hasSupportRole)) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('You do not have permission to close this ticket.');
                return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
            if (!guildConfig) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Ticket system is not set up yet.')
                    .setFooter({ text: `${prefix}ticket-category <category>` });
                return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            const logChannel = guild.channels.cache.get(guildConfig.logChannelId);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setDescription(`The ticket channel ${channel.name} has been closed by ${user.tag}.`)
                    .addFields(
                        { name: 'User', value: `<@${user.id}>`, inline: true },
                        { name: 'Channel', value: `${channel.name}`, inline: true }
                    )
                    .setTimestamp()
                    .setColor(client.color);
                logChannel.send({ embeds: [logEmbed] });
            }

            await channel.delete();
        }
        
        // Ticket Transcripts
        else if (customId === "TICKET_TRANSCRIPTS") {
            const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        
            if (!guildConfig) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Ticket system is not set up yet.')
                    .setFooter({ text: `${prefix}ticket-category <category>` });
        
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        
            const hasSupportRole = member.roles.cache.some(role => role.name === "Tickets Support");
            if (!(hasAdminRole || isAdministrator || hasSupportRole)) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('You do not have permission to view transcripts.');
        
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        
            const transcriptChannel = guild.channels.cache.get(guildConfig.transcriptChannelId);
        
            if (!transcriptChannel) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Transcript channel is not set up.')
                    .setFooter({ text: `${prefix}setup-transcripts <channel>` });
        
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        
            const messages = await channel.messages.fetch({ limit: 100 });
            const transcript = messages
                .map(m => {
                    const timestamp = m.createdAt.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
                    const content = m.content || "*[No Text]*";
                    const attachments = m.attachments.size > 0
                        ? m.attachments.map(a => `📎 [Attachment](${a.url})`).join('\n')
                        : "";
        
                    return `[${timestamp}] ${m.author.tag}: ${content}\n${attachments}`;
                })
                .reverse()
                .join('\n');
        
            const fileName = `transcript-${channel.id}.txt`;
            const transcriptBuffer = Buffer.from(transcript, 'utf-8');
        
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("Transcript generated successfully.")],
                flags: MessageFlags.Ephemeral,
            });
        
            await transcriptChannel.send({
                content: `Transcript for ticket **${channel.name}** has been generated.`,
                files: [{ attachment: transcriptBuffer, name: fileName }]
            });
        }
    });

    const cooldown = new Set();
    
    // Auto Responder
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;
    
        const guildId = message.guild.id;
        const content = message.content.toLowerCase();
        const userId = message.author.id;
    
        // Cek apakah pengguna sedang dalam cooldown
        if (cooldown.has(userId)) {
            // Jika dalam cooldown, kirim pesan embed menggunakan EmbedBuilder
            const cooldownEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Cooldown Active')
                .setDescription(`You need to wait 5 seconds before using the autoresponder again, <@${userId}>.`)
                .setFooter({ text: 'Please be patient!' });
    
            return message.channel.send({ embeds: [cooldownEmbed] }).then((msg) => msg.delete({ timeout: 10000 }));
        }
    
        // Autoresponder functionality
        const responder = await Autoresponder.findOne({ guildId, trigger: content });
        if (responder) {
            const response = responder.response
                .replace(/{user}/g, `<@${userId}>`)
                .replace(/{server}/g, message.guild.name);
    
            message.channel.send(response);
    
            // Tambahkan pengguna ke cooldown
            cooldown.add(userId);
    
            // Hapus pengguna dari cooldown setelah 5 detik
            setTimeout(() => {
                cooldown.delete(userId);
            }, 5000);
        }
    });

    const WelcomeMessageModel = require('./settings/models/WelcomeMessage');
    const GoodbyeMessageModel = require('./settings/models/GoodbyeMessage');

    // Welcome Message
    client.on('guildMemberAdd', async (member) => {
        try {
            const welcomeMessage = await WelcomeMessageModel.findOne({ guildId: member.guild.id });
            if (!welcomeMessage || !welcomeMessage.channelId) return;

            const channel = member.guild.channels.cache.get(welcomeMessage.channelId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(welcomeMessage.title || 'Welcome!')  // Set a default title
                .setDescription(
                    (welcomeMessage.description || '{user}, welcome to {guildname}!')
                    .replace('{user}', member.user.tag)
                    .replace('{guildname}', member.guild.name)
                )
                .setColor(welcomeMessage.color || '#00FF00');  // Set a default color

            if (welcomeMessage.authorName && welcomeMessage.authorName.length > 0) {
                embed.setAuthor({ name: welcomeMessage.authorName });
            }
            if (welcomeMessage.footerText && welcomeMessage.footerText.length > 0) {
                embed.setFooter({ text: welcomeMessage.footerText });
            }
            if (welcomeMessage.imageUrl && welcomeMessage.imageUrl.length > 0) {
                embed.setImage(welcomeMessage.imageUrl);
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    });

    // Goodbye Message
    client.on('guildMemberRemove', async (member) => {
    try {
        const goodbyeMessage = await GoodbyeMessageModel.findOne({ guildId: member.guild.id });
        if (!goodbyeMessage || !goodbyeMessage.channelId) return;

        const channel = member.guild.channels.cache.get(goodbyeMessage.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(goodbyeMessage.title || 'Goodbye!')  // Set a default title
            .setDescription(
                (goodbyeMessage.description || '{user}, goodbye to {guildname}!')
                .replace('{user}', member.user.tag)
                .replace('{guildname}', member.guild.name)
            )
            .setColor(goodbyeMessage.color || '#00FF00');  // Set a default color

        if (goodbyeMessage.authorName && goodbyeMessage.authorName.length > 0) {
            embed.setAuthor({ name: goodbyeMessage.authorName });
        }
        if (goodbyeMessage.footerText && goodbyeMessage.footerText.length > 0) {
            embed.setFooter({ text: goodbyeMessage.footerText });
        }
        if (goodbyeMessage.imageUrl && goodbyeMessage.imageUrl.length > 0) {
            embed.setImage(goodbyeMessage.imageUrl);
        }

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error in guildMemberAdd event:', error);
    }
    });

        const giveawayModel = require("./settings/models/Giveaways.js");
        const { GiveawaysManager } = require("discord-giveaways");
        const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
        async getAllGiveaways() {
            return await giveawayModel.find().lean().exec();
        }

        async saveGiveaway(messageId, giveawayData) {
            await giveawayModel.create(giveawayData);
            return true;
        }

        async editGiveaway(messageId, giveawayData) {
            await giveawayModel
            .updateOne({ messageId }, giveawayData, { omitUndefined: true })
            .exec();
            return true;
        }

        async deleteGiveaway(messageId) {
            await giveawayModel.deleteOne({ messageId }).exec();
            return true;
        }
        };

        const manager = new GiveawayManagerWithOwnDatabase(client, {
            default: {
                botsCanWin: false,
                embedColor: "White",
                embedColorEnd: "White",
                reaction: "<:haruka:1154521466843430912>",
                lastChance: {
                    enabled: true,
                    content: `🛑 **Last chance to enter** 🛑`,
                    threshold: 5000,
                    embedColor: 'White'
                },
                pauseOptions: {
                    isPaused: true,
                    content: '⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️',
                    unpauseAfter: null,
                    embedColor: 'White',
                    infiniteDurationText: '`NEVER`'
                }
            }
        });
        
    client.giveawaysManager = manager;
    client.giveawaysManager.on(
    "giveawayReactionAdded",
    async (giveaway, reactor, messageReaction) => {
        let approved =  new EmbedBuilder()
        .setTimestamp()
        .setColor("White")
        .setTitle("Entry Approved! | You have a chance to win!!")
        .setDescription(
        `Your entry to [This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) has been approved!`
        )
        .setFooter({ text: "Haruka" })
        .setTimestamp()
    let denied =  new EmbedBuilder()
        .setTimestamp()
        .setColor("White")
        .setTitle(":x: Entry Denied | Databse Entry Not Found & Returned!")
        .setDescription(
        `Your entry to [This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) has been denied, please review the requirements to the giveaway properly.`
        )
        .setFooter({ text: "Haruka" })

        let client = messageReaction.message.client
        if (reactor.user.bot) return;
        if(giveaway.extraData) {
        if (giveaway.extraData.server !== "null") {
            try { 
            await client.guilds.cache.get(giveaway.extraData.server).members.fetch(reactor.id)
            return reactor.send({
            embeds: [approved]
            });
            } catch(e) {
            messageReaction.users.remove(reactor.user);
            return reactor.send({
                embeds: [denied]
            }).catch(e => {})
            }
        }
        if (giveaway.extraData.role !== "null" && !reactor.roles.cache.get(giveaway.extraData.role)){ 
            messageReaction.users.remove(reactor.user);
            return reactor.send({
            embeds: [denied]
            }).catch(e => {})
        }

        return reactor.send({
            embeds: [approved]
        }).catch(e => {})
        } else {
            return reactor.send({
            embeds: [approved]
            }).catch(e => {})
        }
    }
    );

    client.giveawaysManager.on(
    "giveawayReactionRemoved",
    (giveaway, member, reaction) => {
        return member.send({
            embeds: [new EmbedBuilder()
            .setTimestamp()
            .setTitle('❓ Hold Up Did You Just Remove a Reaction From A Giveaway?')
            .setColor("White")
            .setDescription(
                `Your entery to [This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) was recorded but you un-reacted, since you don't need **${giveaway.prize}** I would have to choose someone else 😭`
            )
            .setFooter({ text: "Think It was a mistake? Go react again!" })
            ]
        }).catch(e => {})
    }
    );

    client.giveawaysManager.on("giveawayEnded", async (giveaway, winners) => {
        winners.forEach((member) => {
            member.send({
            embeds: [new EmbedBuilder()
                .setTitle(`🎁 Let's goo!`)
                .setColor("White")
                .setDescription(`Hello there ${member.user}\n I heard that you have won **[[This Giveaway]](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})**\n Good Job On Winning **${giveaway.prize}!**\nDirect Message the host to claim your prize!!`)
                .setTimestamp()
                .setFooter({
                text: `${member.user.username}`, 
                iconURL: member.user.displayAvatarURL()
                })
            ]
            }).catch(e => {})
        });
    });
    client.giveawaysManager.on("giveawayRerolled", async (giveaway, winners) => {
    winners.forEach((member) => {
        member.send({
        embeds: [new EmbedBuilder()
            .setTitle(`🎁 Let's goo! We Have A New Winner`)
            .setColor("White")
            .setDescription(`Hello there ${member.user}\n I heard that the host rerolled and you have won **[[This Giveaway]](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})**\n Good Job On Winning **${giveaway.prize}!**\nDirect Message the host to claim your prize!!`)
            .setTimestamp()
            .setFooter({
            text: `${member.user.username}`, 
            iconURL: member.user.displayAvatarURL()
            })
        ]
        }).catch(e => {})
    });
    });

    ["aliases", "commands", "premiums"].forEach(x => client[x] = new Collection());
    ["loadCommand", "loadEvent", "loadPlayer", "loadDatabase"].forEach(x => require(`./handlers/${x}`)(client));

    this.cluster = new ClusterClient(this);
	}
		connect() {
        return super.login(this.token);
    };
};
module.exports = MainClient;
