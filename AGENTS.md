# AGENTS.md

Compact guidance for OpenCode sessions in this repo. Skip anything obvious.

## Layout

Monorepo with two independent apps plus root-level helper scripts:

- `BACKEND/` — Laravel 11 API (PHP 8.1, Composer). Entrypoints: `routes/api.php` (API), `routes/channels.php` (channels), `routes/web.php` (SPA fallback to `public/index.html`).
- `FRONTEND/` — React 18 SPA (Vite 5, pnpm). `@` alias → `./src` (both `vite.config.js` and `vitest.config.js`).
- Root `e2e_*.py` — standalone Python+Playwright manual checks (not CI). `e2e-screenshots/` is their output.

No CI, no task runner. `.hermes/` and `docs/` are not source. `docker-composer.yml` is empty — ignore.

## Backend (Composer / PHP)

Setup:
```
cd BACKEND
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=localhost      # :8000
```

Verify:
- Tests: `./vendor/bin/pest` (`php artisan test` also works).
- Format: `./vendor/bin/pint`.
- Routes: `php artisan route:list` (also `migrate`).

Gotchas:
- **Tests need real MySQL.** `phpunit.xml` has `sqlite`/`memory` commented out, so Pest uses `DB_*` from `.env` (`project_x`). Always `migrate:fresh --seed` before testing — no in-memory fallback.
- **`BACKEND/package.json` is stray** (only `@radix-ui/react-switch`). Ignore npm there; backend is Composer only.
- **All PKs are UUIDs** (`HasUuids`, `uuid` PK). Routes use `{param:uuid}`/`whereUuid()`, validation uses `uuid` not `integer`, `where('id', $uuid)` is string compare. Don't cast to `(int)`.
- **SoftDeletes on `posts`/`messages`/`images`.** Queries exclude `deleted_at` automatically; missing column → `no such column: deleted_at` (especially with sqlite). `PostResource` must use `relationLoaded` not `whenLoaded` truthy check (MissingValue is truthy).
- Auth is **Sanctum SPA stateful** + token. `FRONTEND_URL` (`:3000`) must match `SANCTUM_STATEFUL_DOMAINS`. Token login at `POST /api/token-login`. After `migrate:fresh --seed` tokens are wiped → any `401` from `/api/*` with stored token must force logout.
- Realtime is **Reverb** (`laravel-echo`/`pusher-js`). `BROADCAST_DRIVER=log` by default (no broadcast). For live: `php artisan reverb:start` (`:8080`) alongside API.

## Frontend (pnpm / Vite / React)

Use **pnpm**, not npm (`pnpm-lock.yaml` + `pnpm-workspace.yaml`).

```
cd FRONTEND
pnpm install
pnpm dev          # :3000
pnpm build        # writes to ../BACKEND/public (assets/ + index.html), not FRONTEND/dist
```

Verify:
- `pnpm test` (watch) / `pnpm test:run` / `pnpm test:coverage` (vitest/jsdom).
- `pnpm lint` — **fails on any warning** (`--max-warnings 0` + `--report-unused-disable-directives`); `no-unused-vars` is `warn`.

Gotchas:
- `vite.config.js` keeps all `node_modules` in one `vendor` chunk. Splitting caused TDZ (`Cannot access 'i' before initialization`) on lazy routes like `ProfilePage`. Don't re-split.
- `e2e_*.py` hardcode `FRONTEND_URL=http://localhost:5174`, `BACKEND_URL=http://localhost:8000` and embed tokens. Need both servers + Playwright.
- State: Redux Toolkit + React Query (`@tanstack/react-query`), `RouterProvider` in `src/App.jsx` (so `useLocation` must be inside it), forms: `react-hook-form` + `zod`.
- `VITE_API_URL` empty in `.env.example` → same-origin in prod (`""`); dev uses Vite proxy or explicit URL.

## Cross-cutting

- Ports: API `:8000`, SPA `:3000` dev / `:5174` e2e. Mismatch breaks CORS/Reverb.
- `.editorconfig`: 2-space indent, LF, utf-8, final newline.
