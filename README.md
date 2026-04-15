## Estimathon

```bash
pnpm install
pnpm dev
```

- **Scoreboard:** `/display` (default `/` redirects here)
- **Player:** `/join` — create a team, choose your team, and submit interval answers (same rules as the host submission form). Team choice is saved in the browser.
- **Control (admin):** `/control` — local dev has no password; hosted mode uses `ADMIN_PASSWORD`

### Local vs hosted game state

- **Default (`VITE_USE_REMOTE_GAME` unset or `false`):** game data lives in **localStorage** (same machine/browser).
- **Hosted on Vercel (`VITE_USE_REMOTE_GAME=true`):** the API keeps one game in **server memory only** (no Vercel databases/KV). Everyone polls `GET /api/game`. State is **not durable**: it resets when the function cold-starts, on redeploy, or if traffic hits another instance. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel. Use `vercel dev` to test API + UI locally.

See `.env.example` for variable names.
