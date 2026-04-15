## Estimathon

```bash
pnpm install
pnpm dev
```

- **Scoreboard:** `/display` (default `/` redirects here)
- **Player:** `/join` — create a team, choose your team, and submit interval answers (same rules as the host submission form). Team choice is saved in the browser.
- **Control (admin):** `/control` — with live mode off, no password; with live mode on, `ADMIN_PASSWORD` + `SESSION_SECRET` for `/api/admin/*`.

### Local vs hosted game state

- **Default (`VITE_USE_REMOTE_GAME` unset or false):** game data in **localStorage** only — each browser has its own copy.
- **Live / hosted (`VITE_USE_REMOTE_GAME` true, 1, yes, or on at build time):** one game in **server function memory** (no Redis/DB). Clients poll `GET /api/game`. State resets on cold start or redeploy. On serverless, **multiple warm instances** can each hold different memory briefly; low traffic usually behaves like one copy.

Set `ADMIN_PASSWORD` and `SESSION_SECRET` on Vercel for admin login. See `.env.example`.
