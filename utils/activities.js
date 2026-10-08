const { ActivityType } = require('discord.js');

const INTERVAL_MS = 30_000;

const ACTIVITIES = [
  { type: ActivityType.Playing, name: 'quoi ? feur.' },
  { type: ActivityType.Playing, name: 'chasseur de quoi' },
  { type: ActivityType.Playing, name: 'feur inc.' },
  { type: ActivityType.Playing, name: 'pro du feur' },
  { type: ActivityType.Playing, name: '100% feur' },
];

module.exports = { ACTIVITIES, INTERVAL_MS };
