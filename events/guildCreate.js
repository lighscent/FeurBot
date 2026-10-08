const { Events } = require('discord.js');
const log = require('../utils/logger');
const { deployToGuild } = require('../utils/deployCommands');

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild) {
    try {
      const { count, skipped } = await deployToGuild(guild.client, guild.id);
      if (skipped) log.info(`Commands up to date on ${guild.name}`);
      else log.info(`Deployed ${count} command(s) to ${guild.name}`);
    } catch (err) {
      log.warn(`Deploy failed for ${guild.name}: ${err.message}`);
    }
  },
};
