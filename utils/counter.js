const db = require('./db');

const incrStmt = db.prepare(`
  INSERT INTO counts (guild_id, user_id, count) VALUES (?, ?, 1)
  ON CONFLICT (guild_id, user_id) DO UPDATE SET count = counts.count + 1
`);
const getUserStmt = db.prepare('SELECT count FROM counts WHERE guild_id = ? AND user_id = ?');
const getTopStmt = db.prepare('SELECT user_id AS userId, count FROM counts WHERE guild_id = ? ORDER BY count DESC LIMIT ?');
const getGuildTotalStmt = db.prepare('SELECT COALESCE(SUM(count), 0) AS total FROM counts WHERE guild_id = ?');
const getTotalStmt = db.prepare('SELECT COALESCE(SUM(count), 0) AS total FROM counts');

function incr(guildId, userId) {
  const gid = guildId || 'DM';
  incrStmt.run(gid, userId);
  return { user: getUser(gid, userId), guild: getGuildTotal(gid) };
}

function getUser(guildId, userId) {
  const row = getUserStmt.get(guildId || 'DM', userId);
  return (row && row.count) || 0;
}

function getTop(guildId, limit = 5) {
  return getTopStmt.all(guildId || 'DM', limit);
}

function getGuildTotal(guildId) {
  return getGuildTotalStmt.get(guildId || 'DM').total;
}

function getTotal() {
  return getTotalStmt.get().total;
}

module.exports = { incr, getUser, getTop, getGuildTotal, getTotal };
