## Estimathon

```bash
pnpm install
pnpm dev
```

- **Scoreboard:** `/display` (default `/` redirects here)
- **Player:** `/join` — create a team, choose your team, and submit interval answers (same rules as the host submission form). Team choice is saved in the browser.
- **Control (admin):** `/control` — with live mode off, no password; with live mode on, `ADMIN_PASSWORD` + `SESSION_SECRET` for `/api/admin/*`.

### Local manual vs live (shared) game

- **Local manual (`VITE_USE_REMOTE_GAME` unset or false at build time):** teams, questions, submissions, and the scoreboard live in **localStorage** on each browser. Use `/control` on that machine to create teams and questions — no shared leaderboard across phones unless you switch to live mode.
- **Live (`VITE_USE_REMOTE_GAME` true / 1 / yes / on):** clients poll `GET /api/game`. For a **single source of truth** on Vercel (and near–real-time metrics on the scoreboard), set **Upstash Redis** or **Vercel KV** env vars on the server (`UPSTASH_REDIS_REST_*` or `KV_REST_*`). Without them, the API falls back to **in-memory** state (not shared across serverless instances).

Admin sign-in for `/control` in live mode: `ADMIN_PASSWORD` + `SESSION_SECRET`. See `.env.example`.
