const { Events } = require('discord.js');
const { containsQuoi } = require('../utils/quoi');
const Counter = require('../utils/counter');
const log = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot) return;
    if (!containsQuoi(message.content)) return;
    try {
      Counter.incr(message.guildId, message.author.id);
    } catch (err) {
      log.warn(`Counter failed: ${err.message}`);
    }
    try {
      await message.reply('feur');
      log.debug(`Replied feur to ${message.author.tag} in ${message.guild?.name || 'DM'}`);
    } catch (err) {
      log.error('Reply failed:', err.message);
    }
  },
};
