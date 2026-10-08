const { Events } = require('discord.js');
const log = require('../utils/logger');
const { ACTIVITIES, INTERVAL_MS } = require('../utils/activities');
const { deployToGuilds, clearGlobalCommands } = require('../utils/deployCommands');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    log.info(`Logged in as ${client.user.tag}`);

    deployToGuilds(client).then((results) => {
      if (results.length === 0) log.warn('Bot is not in any guild, no commands deployed');
      for (const r of results) {
        if (!r.ok) log.warn(`Deploy failed for ${r.guild}: ${r.error}`);
        else if (r.skipped) log.info(`Commands up to date on ${r.guild}`);
        else log.info(`Deployed ${r.count} command(s) to ${r.guild}`);
      }
      return clearGlobalCommands(client);
    }).then(({ cleared }) => {
      if (cleared > 0) log.info(`Cleared ${cleared} global command(s)`);
    }).catch((err) => log.warn(`Global clear failed: ${err.message}`));

    let i = 0;
    const rotate = () => {
      // Skip while the gateway is down: setPresence would pile listeners on a dead shard.
      if (!client.isReady()) return;
      const activity = ACTIVITIES[i % ACTIVITIES.length];
      i += 1;
      try {
        client.user.setPresence({ activities: [{ name: activity.name, type: activity.type }], status: 'online' });
      } catch (err) {
        log.error('Presence update failed:', err.message);
      }
    };

    rotate();
    setInterval(rotate, INTERVAL_MS);
  },
};
