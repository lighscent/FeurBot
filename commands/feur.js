const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Counter = require('../utils/counter');

const COLOR = 0x5865f2;

function baseEmbed() {
  return new EmbedBuilder().setColor(COLOR).setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feur')
    .setDescription('Voir les compteurs de feur')
    .addSubcommand((sub) =>
      sub
        .setName('score')
        .setDescription('Voir un compteur de feur')
        .addUserOption((option) =>
          option.setName('utilisateur').setDescription('Voir le compteur de quelquun').setRequired(false),
        ),
    )
    .addSubcommand((sub) => sub.setName('top').setDescription('Top 5 feur du serveur'))
    .addSubcommand((sub) => sub.setName('global').setDescription('Total global tous serveurs')),
  async execute(interaction) {
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();

    if (sub === 'top') {
      const top = Counter.getTop(guildId, 5);
      const embed = baseEmbed().setTitle('Top feur du serveur');
      if (top.length === 0) {
        embed.setDescription(`Personne ne quoi sur ce serveur pour le moment.`);
      } else {
        embed.setDescription(
          top.map((entry, i) => `${i + 1}. <@${entry.userId}> — **${entry.count}** feur`).join('\n'),
        );
      }
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'global') {
      const embed = baseEmbed()
        .setTitle('Feur global')
        .addFields(
          { name: 'Total global', value: `${Counter.getTotal()} feur`, inline: true },
          { name: 'Ce serveur', value: `${Counter.getGuildTotal(guildId)} feur`, inline: true },
        );
      return interaction.reply({ embeds: [embed] });
    }

    const target = interaction.options.getUser('utilisateur') || interaction.user;
    const count = Counter.getUser(guildId, target.id);
    const embed = baseEmbed().setTitle('Compteur feur');
    if (target.id === interaction.user.id) {
      embed.setDescription(
        count === 0
          ? `Tu ne t'es jamais fait feur sur ce serveur.`
          : `Tu t'es fait **feur ${count} fois** sur ce serveur.`,
      );
    } else {
      embed.setDescription(
        count === 0
          ? `<@${target.id}> ne s'est jamais fait feur ici.`
          : `<@${target.id}> s'est fait **feur ${count} fois** ici.`,
      );
    }
    return interaction.reply({ embeds: [embed] });
  },
};
