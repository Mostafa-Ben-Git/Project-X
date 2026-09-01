# AGENTS.md — Project-X

> Realtime X/Twitter-inspired social platform: Laravel 11 API + React 18 SPA. Generated via `/init` scan on 2026-09-01. Keep compact; skip obvious.

## Overview

- **One-liner:** Connect. Share. Discover. Posts, follows/likes/reposts/bookmarks, threaded comments, encrypted DM rooms, notifications, presence.
- **Monorepo:** two independent apps + root Playwright helpers. No CI / task runner yet. `.hermes/` + `docker-composer.yml` documented but absent — ignore.
- **Ports:** API `:8000` (`APP_URL`), SPA dev `:3000` (`FRONTEND_URL` / `SANCTUM_STATEFUL_DOMAINS`), e2e `:5174`, Reverb `:8080`. Mismatch breaks CORS/Auth/Reverb.
- **Auth:** Sanctum SPA stateful (`EnsureFrontendRequestsAreStateful` in `BACKEND/app/Http/Kernel.php:1`) + Bearer `POST /api/token-login` (`BACKEND/routes/api.php:1`). 401 on `*/api/*` with stored token → `forceLogout()` (`FRONTEND/src/api/apiService.js:1`).
- **Build:** `FRONTEND` Vite `build.outDir → ../BACKEND/public` (`assets/` + `index.html`, `emptyOutDir:false`). Prod served by `BACKEND/routes/web.php:1` fallback `GET /{any}` → `public/index.html`.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Laravel 11, PHP `^8.1`, Sanctum 4, Reverb 1, Socialite 5, Pest 2, Pint 1 |
| Frontend | React 18, Vite 5, pnpm, Tailwind 3, Radix UI, Redux Toolkit + TanStack Query, React Router `RouterProvider`, `react-hook-form`+`zod`, `laravel-echo`/`pusher-js` |
| DB/Infra | MySQL `project_x` (prod/test) or local `sqlite` (`BACKEND/database/database.sqlite`), `BROADCAST_DRIVER=log` default / `pusher` (Reverb) live, `QUEUE=sync`, file cache/session |
| Tooling | `pnpm-lock.yaml` + `pnpm-workspace.yaml`, `vitest`+`jsdom`, `eslint --max-warnings 0`, `.editorconfig` 2-space LF |

## Layout

```
Project-X/
├── BACKEND/                   # Laravel 11 (Composer)
│   ├── app/Http/Controllers/Api/ (12 controllers) + Auth/
│   ├── app/Http/Resources/    # PostResource @ app/Http/Resources/PostResource.php:82 (relationLoaded guard)
│   ├── app/Models/            # 11 models — all HasUuids, Post|Message|Image also SoftDeletes
│   ├── routes/api.php:1       # ~59 API routes (whereUuid)
│   ├── routes/channels.php:1  # user.{id} + online-users presence
│   ├── routes/web.php:1       # SPA fallback
│   ├── config/cors.php:1 / sanctum.php / broadcasting.php / reverb.php
│   ├── database/migrations/ (22) + seeders/DatabaseSeeder.php:26 (test@example.com)
│   ├── public/                # built SPA (gitignored assets/ + index.html lives here)
│   └── tests/ (Pest 23 tests)
├── FRONTEND/                  # React SPA (pnpm)
│   ├── src/api/ (apiService.js, posts.js, messages.js …)
│   ├── src/app/store.js + router.jsx + src/App.jsx (RouterProvider)
│   ├── src/components/logo.jsx:14 (Logo/LogoIcon) + ui/ (shadcn)
│   ├── src/features/post/ + sidebar/ + src/pages/ + src/hooks/ (13) + src/lib/echo.js
│   ├── vite.config.js:1 (alias @→./src, single vendor chunk, outDir ../BACKEND/public)
│   ├── vitest.config.js:1 (jsdom, globals)
│   └── public/logo.svg, logo-full.svg, favicon.svg
├── docs/screenshots/          # committed README shots (9 @2x); e2e-screenshots/ is local & gitignored
└── e2e_*.py (5)               # Python+Playwright manual checks — not CI
```

## Setup

### Backend (Composer)

```bash
cd BACKEND
composer install
cp .env.example .env
php artisan key:generate
# .env: DB_*=project_x, FRONTEND_URL=http://localhost:3000,
# SANCTUM_STATEFUL_DOMAINS=localhost:3000  (add 5174 if running e2e),
# BROADCAST_DRIVER=log (or pusher for Reverb), SESSION_DOMAIN=localhost
php artisan migrate:fresh --seed
php artisan serve:all              # API :8000 + Reverb :8080 + schedule:work (app/Console/Commands/ServeAll.php:1)
# or individually:
php artisan serve --host=localhost        # :8000
php artisan reverb:start --port=8080     # :8080
php artisan schedule:work                # views:flush-buffers + users:mark-offline every minute
```

`php artisan route:list --path=api` to verify routes.

### Frontend (pnpm only — not npm)

```bash
cd FRONTEND
pnpm install
pnpm dev          # :3000 (set VITE_API_URL=http://localhost:8000 for dev; "" = same-origin prod)
pnpm build        # → ../BACKEND/public (assets/ + index.html)
```

`.env.example` has `VITE_API_URL=` (empty = same-origin). For `pnpm dev`, set `VITE_API_URL=http://localhost:8000` or add Vite `server.proxy` for `/api` + `/broadcasting`.

## Commands — Verify Before Push

| Task | Backend | Frontend |
|------|---------|----------|
| Tests | `php artisan test` / `./vendor/bin/pest` (needs `migrate:fresh --seed` + real MySQL; `phpunit.xml:1` sqlite lines commented) | `pnpm test:run` / `pnpm test` (watch) / `pnpm test:coverage` (vitest/jsdom) |
| Lint/Format | `./vendor/bin/pint` (no `pint.json` — default) | `pnpm lint` (`eslint --report-unused-disable-directives --max-warnings 0` — fails on any warn; `no-unused-vars` is `warn`) |
| Build | `php artisan route:list`, `migrate` | `pnpm build` |
| Both | `pint` + `pnpm lint` + `pest` + `pnpm test:run` (CONTRIBUTING rule in README) | — |
| E2E | `pip install playwright && playwright install` then `python e2e_*.py` (needs both servers, `E2E_TOKEN` via `POST /api/token-login`, hardcodes `FRONTEND_URL=http://localhost:5174` `BACKEND_URL=http://localhost:8000`) | same |

## Conventions & Architecture

- **UUID PKs everywhere:** `HasUuids` on all 11 models (`app/Models/*.php`). Routes use `{param:uuid}` / `whereUuid()`, validation `uuid`, `where('id',$uuid)` is string compare. Never `(int)` cast.
- **SoftDeletes:** `posts`/`messages`/`images` only. Queries auto-exclude `deleted_at`; missing column → `no such column: deleted_at` (especially sqlite). `PostResource` must use `relationLoaded()` not `whenLoaded()` truthiness (`MissingValue` is truthy) — `app/Http/Resources/PostResource.php:82`.
- **Sanctum:** `config/sanctum.php` stateful = `SANCTUM_STATEFUL_DOMAINS` + parsed `APP_URL`/`FRONTEND_URL`. `config/cors.php` `paths=['*']`, `supports_credentials=true`, `allowed_origins` includes `FRONTEND_URL` + hardcoded `3000/4000/5173`. `api` middleware group = `EnsureFrontendRequestsAreStateful`.
- **Broadcast/Reverb:** `config/broadcasting.php` default `BROADCAST_DRIVER` (`log` in `.env.example`, `pusher` locally). `config/reverb.php` `0.0.0.0:8080`, `apps.provider=config` via `REVERB_APP_*`. Frontend `src/lib/echo.js:1` `broadcaster: reverb`, `wsHost=VITE_REVERB_HOST||localhost`, `wsPort=8080`, `authEndpoint=/broadcasting/auth` + `Bearer token`. Events: `MessageSent`, `NotificationCreated`, `UserStatusBroadcast`.
- **Schedule:** `app/Console/Kernel.php` `users:mark-offline --minutes=5` every minute; `routes/console.php` `views:flush-buffers` every minute `withoutOverlapping` (`app/Console/Commands/FlushPostViewBuffers.php:1`).
- **Frontend state:** Redux Toolkit single `auth` slice (`src/slices/authSlice.js`) + TanStack Query (`src/lib/query-client.js` `staleTime 30s`, `refetchOnWindowFocus false`). `RouterProvider` in `src/App.jsx:1` (`src/app/router.jsx`) — `useLocation` must be inside it. `src/api/apiService.js:1` axios `baseURL=VITE_API_URL||""`, `withCredentials:false`, request interceptor adds `Bearer`, `FormData` deletes `Content-Type`, response interceptor dedupes `401` with `__skipAuthRetry` (1.5s retry `GET /api/user`) then `forceLogout`.
- **Vite:** `vite.config.js:1` alias `@→./src`, single `vendor` chunk (`manualChunks id.includes(node_modules)?"vendor":undefined`) — **do not re-split**; splitting caused TDZ `Cannot access 'i' before initialization` on lazy `ProfilePage`. `chunkSizeWarningLimit 1200`, `emptyOutDir:false`.
- **Imports:** `@` alias in both `vite.config.js` and `vitest.config.js`. `jsconfig.json` `@/*→./src/*` (no TS — `tsconfig.json` absent).
- **Stray:** `BACKEND/package.json` (only `@radix-ui/react-switch`) + `BACKEND/pnpm-lock.yaml` are stray — ignore, backend is Composer only.

## API Quick Ref (`routes/api.php:1`, 59 routes)

- Public: `POST /api/token-login`, `GET /api/auth/{provider}/redirect|callback` (throttle `60,1`)
- `auth:sanctum` group: `GET /api/user`, `POST /api/logout`, `POST /api/heartbeat` + `/status` (`status in: online,away,offline,dnd,hidden`), `GET /api/users/search` + `apiResource /users` `whereUuid`, `apiResource /posts` `whereUuid` + `GET /posts/{post}/comments`, `GET /{username}/post/{post_id}`, `POST /posts/{post}/changeLikeStatus|repost|pin|bookmark|view` (`/view` throttle `60,1` buffered), `GET /api/bookmarks` + `DELETE /bookmarks/{post}`, notifications `/unread-count` `/read-all`, messages `GET /api/conversations`, `/messages/unread-count`, `/messages/room/{room}` (+`/pinned,/resolve,/reply/{message}`, `DELETE`, `/pin,/restore`), `/users/{user}/room` (room token `Crypt::encryptString(partnerId)`).
- Web fallback: `GET /{any} where not api|sanctum` → `public/index.html`.

## Gotchas (agent must not regress)

1. Tests need real MySQL (`project_x`) — `BACKEND/phpunit.xml:1` has `sqlite`/`:memory:` commented. Always `migrate:fresh --seed` before `pest`.
2. `BACKEND/package.json` stray — do not `npm install` there.
3. UUID validation/routing — `uuid` not `integer`, `whereUuid`, no int cast.
4. SoftDeletes — ensure `deleted_at` exists; use `relationLoaded`.
5. After `migrate:fresh --seed` tokens wiped → stale `Authorization: Bearer` on `*/api/*` must trigger `forceLogout` redirect to `/login` (not `token-login`/`auth/`).
6. Single `vendor` chunk — re-splitting breaks lazy imports.
7. `VITE_API_URL` empty = same-origin prod; dev needs explicit `http://localhost:8000` or Vite proxy (currently none configured).
8. `SANCTUM_STATEFUL_DOMAINS` must include dev port (`3000` and `5174` for e2e). Local `.env` drift to `8000` breaks SPA cookie auth (Bearer still works).
9. `BROADCAST_DRIVER=log` = no realtime; need `pusher` + `REVERB_*` + `php artisan reverb:start :8080` (`VITE_REVERB_*` in frontend).
10. `RouterProvider` owns location — `useLocation` outside `App.jsx` tree fails.

## Anti-patterns

- `where('id', (int)$id)` or `findOrFail((int)$uuid)` — PK is string UUID.
- `whenLoaded('relation')` truthy check in resources — use `$this->relationLoaded('relation')`.
- Splitting `manualChunks` by package in `vite.config.js`.
- `withCredentials:true` in `apiService.js` (breaks Bearer flow) or omitting `forceLogout` on `401`.
- Hardcoding `FRONTEND_URL` only as `3000` when e2e uses `5174`.

## E2E Helpers

- `e2e_test.py` (14k), `e2e_frontend.py`, `e2e_realtime.py`, `e2e_load_posts.py`, `e2e_profile_other.py` — hardcode `FRONTEND_URL=http://localhost:5174`, `BACKEND_URL=http://localhost:8000`, embed `Bearer 1|REPLACE…`, output `e2e-screenshots/`. Not CI. Need both servers + `playwright`.

## Pre-push Checklist

`./vendor/bin/pint` + `pnpm lint` (`--max-warnings 0`) + `php artisan test` (after `migrate:fresh --seed`) + `pnpm test:run` + `php artisan route:list` smoke.

## Known Gaps / Next Improvements

See `Suggestions` output from `/init` (also tracked in chat): add CI (`.github/workflows/ci.yml` for `pint --test`, `pest`, `pnpm lint/test:run/build`), `docker-compose.yml`, `vite server.proxy`, `.nvmrc`+`engines`, sqlite `:memory:` phpunit profile, `pint.json`+`phpstan`, OpenAPI docs, broader test coverage (only `src/lib/utils.test.js:1` today), restrict `cors.paths=['*']`, define `throttle:messages`, remove stray `BACKEND/package.json`, wire `vite-plugin-eslint`, consolidate `VITE_REVERB_*` vs `VITE_PUSHER_*`, add root task runner (`Makefile`/`justfile`/`opencode.json`).
