const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const VOLATILE_KEYS = new Set(['id', 'application_id', 'version']);

function isDefaultIntegrationTypes(v) {
  return Array.isArray(v) && v.length === 1 && v[0] === 0;
}

function canonOption(option) {
  const out = { type: option.type, name: option.name, description: option.description };
  out.required = option.required ?? false;
  out.options = (option.options ?? []).map(canonOption);
  for (const key of Object.keys(option).sort()) {
    if (['type', 'name', 'description', 'required', 'options', ...VOLATILE_KEYS].includes(key)) continue;
    out[key] = canonValue(option[key]);
  }
  return out;
}

function canonCommand(command) {
  const out = {
    name: command.name,
    description: command.description,
    type: command.type,
    options: (command.options ?? []).map(canonOption),
  };
  if (command.dm_permission !== undefined && command.dm_permission !== true) {
    out.dm_permission = command.dm_permission;
  }
  if (command.default_member_permissions !== undefined && command.default_member_permissions !== null) {
    out.default_member_permissions = command.default_member_permissions;
  }
  if (command.nsfw) out.nsfw = true;
  if (command.contexts !== undefined && command.contexts !== null) {
    out.contexts = canonValue(command.contexts);
  }
  if (command.integration_types !== undefined && !isDefaultIntegrationTypes(command.integration_types)) {
    out.integration_types = canonValue(command.integration_types);
  }
  return out;
}

function canonValue(value) {
  if (Array.isArray(value)) return value.map(canonValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (VOLATILE_KEYS.has(key)) continue;
      out[key] = canonValue(value[key]);
    }
    return out;
  }
  return value;
}

function sameCommands(a, b) {
  const norm = (list) => (Array.isArray(list) ? list : []).map(canonCommand);
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

function loadCommandData() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  return fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith('.js'))
    .map((f) => require(path.join(commandsPath, f)).data.toJSON());
}

async function syncCommands(rest, route, scope) {
  const body = loadCommandData();
  const remote = await rest.get(route);
  if (sameCommands(remote, body)) return { count: body.length, scope, skipped: true };
  await rest.put(route, { body: [] });
  await rest.put(route, { body });
  return { count: body.length, scope, skipped: false };
}

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;
  if (!token || !clientId) throw new Error('Missing DISCORD_TOKEN or CLIENT_ID in .env');

  const rest = new REST().setToken(token);
  if (guildId) {
    return syncCommands(rest, Routes.applicationGuildCommands(clientId, guildId), `guild ${guildId}`);
  }
  return syncCommands(rest, Routes.applicationCommands(clientId), 'global');
}

async function deployToGuild(client, guildId) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('Missing DISCORD_TOKEN in .env');
  const rest = new REST().setToken(token);
  const result = await syncCommands(rest, Routes.applicationGuildCommands(client.user.id, guildId), guildId);
  return { count: result.count, skipped: result.skipped };
}

async function clearGlobalCommands(client) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('Missing DISCORD_TOKEN in .env');
  const rest = new REST().setToken(token);
  const route = Routes.applicationCommands(client.user.id);
  const remote = await rest.get(route);
  if (!Array.isArray(remote) || remote.length === 0) return { cleared: 0 };
  await rest.put(route, { body: [] });
  return { cleared: remote.length };
}

async function deployToGuilds(client) {
  const results = [];
  for (const [id, guild] of client.guilds.cache) {
    try {
      const { count, skipped } = await deployToGuild(client, id);
      results.push({ guild: guild.name || id, ok: true, count, skipped });
    } catch (err) {
      results.push({ guild: guild.name || id, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = { deployCommands, deployToGuild, deployToGuilds, clearGlobalCommands, loadCommandData, sameCommands };
