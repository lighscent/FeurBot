require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('node:util');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const log = require('./utils/logger');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  log.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  const dispatch = (...args) => {
    Promise.resolve()
      .then(() => event.execute(...args, client))
      .catch((err) => log.error(`Event ${event.name} failed:`, err?.message ?? inspect(err)));
  };
  if (event.once) {
    client.once(event.name, dispatch);
  } else {
    client.on(event.name, dispatch);
  }
}

// Gateway observability: shows reconnect storms / invalid sessions instead of failing silently.
client.on('shardDisconnect', (event, id) => log.warn(`Shard ${id} disconnected (code ${event.code})`));
client.on('shardReconnecting', (id) => log.warn(`Shard ${id} reconnecting`));
client.on('shardResume', (id, replayed) => log.info(`Shard ${id} resumed (${replayed} event(s) replayed)`));
client.on('invalidated', () => log.error('Session invalidated: the token is probably used by another instance'));
client.on('error', (err) => log.error('Client error:', err?.message ?? inspect(err)));
client.on('warn', (msg) => log.warn(msg));

// Never let a floating promise (login, gateway hiccup) kill the process silently.
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason instanceof Error ? reason.stack : inspect(reason));
});
process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err?.stack ?? inspect(err));
  process.exitCode = 1;
});

client.login(token).catch((err) => {
  log.error('Login failed:', err?.message ?? inspect(err));
  process.exitCode = 1;
});
