# AGENTS.md

Compact guidance for OpenCode sessions in this repo. Skip anything obvious.

## Layout

Monorepo with two independent apps plus root-level helper scripts:

- `BACKEND/` — Laravel 11 API (PHP 8.1, Composer). Entrypoints: `routes/api.php` (API), `routes/channels.php` (websocket channels), `routes/web.php`.
- `FRONTEND/` — React 18 SPA (Vite 5, pnpm). `@` alias → `./src` (configured in both `vite.config.js` and `vitest.config.js`).
- Root `e2e_*.py` — standalone Python + Playwright verification scripts (manual, not CI). `e2e-screenshots/` is their output dir.

No CI workflows or task runner exist. `.hermes/` and `docs/` are not source. `docker-composer.yml` is an empty placeholder — ignore it.

## Backend (Composer / PHP)

Setup:
```
cd BACKEND
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=localhost      # API on :8000
```

Verify:
- Tests: `./vendor/bin/pest` (or `php artisan test`).
- Format: `./vendor/bin/pint`.

Gotchas:
- **Tests need a real MySQL DB.** `phpunit.xml` has the sqlite `:memory:` config commented out, so Pest runs against `DB_CONNECTION`/DB from `.env` (`project_x`). Always `migrate:fresh --seed` before testing — there is no in-memory fallback.
- **`BACKEND/package.json` is stray** (only `@radix-ui/react-switch`). Backend tooling is Composer/PHP only — ignore the npm lock/node_modules there.
- Auth is Laravel **Sanctum** (SPA stateful). `FRONTEND_URL` (`:3000`) must match `SANCTUM_STATEFUL_DOMAINS` for CORS. There is also a token-login endpoint `/api/token-login`.
- Real-time uses **Laravel Reverb** (websockets) + `laravel-echo`/`pusher-js` on the frontend. `BROADCAST_DRIVER=log` by default (no live broadcast). For live realtime run `php artisan reverb:start` (`:8080`) alongside the API.

## Frontend (pnpm / Vite / React)

Use **pnpm**, not npm — repo has `pnpm-lock.yaml` + `pnpm-workspace.yaml`. (`package.json` scripts read `npm run …` but the lockfile is pnpm.)

```
cd FRONTEND
pnpm install
pnpm dev          # vite --port 3000 (SPA on :3000)
```

Verify:
- `pnpm test` (vitest watch) · `pnpm test:run` · `pnpm test:coverage`
- `pnpm lint` — ESLint, **fails on any warning** (`--max-warnings 0` + `--report-unused-disable-directives`).

Gotchas:
- Lint must stay warning-free; `no-unused-vars` is a `warn`, so dead vars break CI-style lint.
- `vite.config.js` keeps all `node_modules` in one `vendor` chunk on purpose. Splitting React/Redux/axios/lucide into separate chunks caused a cross-chunk cycle and a runtime TDZ ("Cannot access 'i' before initialization") when lazy route chunks (e.g. `ProfilePage`) loaded. Don't re-split vendor chunks.
- Root `e2e_*.py` hardcode `FRONTEND_URL=http://localhost:5174` and `BACKEND_URL=http://localhost:8000`, and embed personal-access tokens. They require both servers + Playwright running; treat as manual checks, not a suite.
- State: Redux Toolkit + React Query (`@tanstack/react-query`). Forms: react-hook-form + zod.

## Cross-cutting

- API serves on `:8000`, SPA on `:3000` (dev) / `:5174` (what e2e expects). Keep these aligned or CORS/realtime break.
- `.editorconfig`: 2-space indent, LF, utf-8, final newline.
