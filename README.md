# FeurBot

A Discord bot that replies `feur` whenever someone says `quoi`. Plus per-server score tracking.

Created in 2021, currently at v5.

## How it works

Any message containing `quoi` (or variants like `koi`, `kwa`, `qu oi`, `pourquoi`) gets a `feur` reply. Each reply bumps the author's score in that server.

## Setup

Requires Node.js 18+.

```bash
npm install
```

Create a `.env` file:

```
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-test-server-id   # optional, for instant command updates
```

## Run

```bash
node index.js
```

Slash commands deploy automatically on startup (instant in `GUILD_ID`, otherwise globally within ~1h).

## Commands

| Command | Description |
|---|---|
| `/feur score [utilisateur]` | Show a user's score (defaults to you) |
| `/feur top` | Server leaderboard |
| `/feur global` | Total count across all servers |

## Notes

- Scores are stored per server in SQLite (`data/feur.db`).
- Logs go to `logs/` (level via `LOG_LEVEL` in `.env`).
