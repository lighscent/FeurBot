const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'feur.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS counts (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  )
`);

module.exports = db;
