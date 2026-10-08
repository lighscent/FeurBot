const log = require('logxpert');

log.settings({
  level: process.env.LOG_LEVEL || 'info',
  console: { enableTimestamp: true, colorize: true },
  files: { folder: 'logs' },
});

module.exports = log;
