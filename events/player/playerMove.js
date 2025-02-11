const Client = require("../../index.js");
const { Player } = require("erela.js");

/**
 * 
 * @param {Client} client 
 * @param {Player} player 
 * @param {String} oldChannel
 * @param {String} newChannel
 */

module.exports = async (client, player, oldChannel, newChannel) => {
  const guild = client.guilds.cache.get(player.guild);
  if (!guild) return;

  const channel = guild.channels.cache.get(player.textChannel);
  if (!channel) return;

  /////////// Update Music Setup ///////////

  await client.UpdateMusic(player);
  await client.clearInterval(client.interval);

  ////////// End Update Music Setup //////////

  // If the old and new channels are the same, no need to proceed
  if (oldChannel === newChannel) return;

  // If newChannel is null, destroy the player (indicates bot should leave the voice channel)
  if (newChannel === null) {
    return player.destroy();
  }

  // If newChannel is valid, update the player's voice channel without destroying it
  player.voiceChannel = newChannel;
};
