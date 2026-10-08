const { Events } = require('discord.js');
const log = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      log.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }
    try {
      log.info(`/${interaction.commandName} used by ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`);
      await command.execute(interaction);
    } catch (err) {
      log.error(`Command ${interaction.commandName} failed:`, err.message);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Erreur interne.', ephemeral: true }).catch(() => {});
      }
    }
  },
};
