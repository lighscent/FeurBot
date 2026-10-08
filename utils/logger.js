const log = require('logxpert');

log.settings({
  level: process.env.LOG_LEVEL || 'debug',
  console: { enableTimestamp: true, colorize: true },
  files: { folder: 'logs', runNumber: true },
});

module.exports = log;
