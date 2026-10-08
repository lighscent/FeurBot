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
    Counter.incr(message.guildId, message.author.id);
    try {
      await message.reply('feur');
    } catch (err) {
      log.error('Reply failed:', err.message);
    }
  },
};
