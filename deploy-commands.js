require('dotenv').config();
const log = require('./utils/logger');
const { deployCommands } = require('./utils/deployCommands');

deployCommands()
  .then(({ count, scope, skipped }) => {
    log.info(skipped ? `Commands up to date [${scope}]` : `Deployed ${count} command(s) [${scope}]`);
    log.close();
    process.exitCode = 0;
  })
  .catch((err) => {
    log.error('Deploy failed:', err.message);
    log.close();
    process.exitCode = 1;
  });
