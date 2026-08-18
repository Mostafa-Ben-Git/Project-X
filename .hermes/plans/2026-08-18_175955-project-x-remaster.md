# Project-X Modern Social App Remaster Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Remaster Project-X into a robust, accessible, theme-aware social media app with current shadcn/ui patterns, Tailwind, hardened Laravel APIs, reliable auth, and verified end-to-end flows.

**Architecture:** Keep Laravel 11 as the API/backend and React/Vite as the SPA. Use Laravel Sanctum personal-access-token authentication consistently for the SPA tunnel deployment, Redux only for durable auth/session state, and TanStack Query for server state, caching, mutations, invalidation, pagination, and loading/error states. Replace the current mixed context/imperative-fetch approach with feature-oriented hooks and reusable shadcn primitives.

**Tech Stack:** Laravel 11, Sanctum, SQLite/MySQL-compatible migrations, Pest/PHPUnit, React 18, Vite, Tailwind CSS, current shadcn/ui CLI components, Radix primitives, TanStack Query, Redux Toolkit, Axios, Lucide, Patchright E2E.

---

## Current Context and Assumptions

- Repository: `D:\Me\Dev\Project-X`.
- Backend: `BACKEND/`, Laravel 11, Sanctum, users/posts/likes/followers plus newly added messages/notifications.
- Frontend: `FRONTEND/`, React/Vite JavaScript SPA with Radix-based components under `FRONTEND/src/components/ui/`.
- Tailwind is currently v3 with semantic CSS variables, but `App.jsx` forcibly adds the `dark` class; there is no user-controlled theme system.
- The current app has duplicated server-state approaches: `PostsContext`, `useAuth`, and direct Axios calls in components.
- The current token-login flow exists in `BACKEND/routes/api.php`; it must be moved into a controller and hardened with validation, rate limiting, token expiration/revocation behavior, and consistent logout.
- The repository currently contains uncommitted runtime/deployment changes such as `BACKEND/public/index.html`, generated assets, auth changes, CORS changes, and avatar seeder changes. Preserve or clean these deliberately; do not accidentally commit local secrets or SQLite data.
- The current `e2e_test.py` uses API data plus browser route mocks. The remaster should add real browser/API coverage against a deterministic seeded environment and keep mocks only for isolated component tests.
- The tunnel exposes one origin in practice. The preferred deployment shape is same-origin SPA + API through Laravel on port 8000; CORS remains configured for local development ports and the tunnel origin supplied through environment configuration.

## Acceptance Criteria

1. The app has a single coherent light/dark/system theme with semantic tokens; no forced dark mode.
2. Navigation, tabs, menus, cards, dialogs, inputs, disabled states, and hover states remain readable in both themes.
3. Authentication works through the tunnel without CSRF/CORS failure and has clear loading, invalid-credential, expired-token, and logout behavior.
4. Home feed supports paginated loading, create/edit/delete, image upload validation, likes, comments, and optimistic or safely invalidated updates.
5. Friends supports suggestions, followers, following, follow/unfollow, self-follow prevention, duplicate prevention, and correct counts.
6. Notifications supports list pagination, unread count, mark-one-read, mark-all-read, and notifications from follow/like/comment/message events.
7. Messages supports conversations, message history, sending, read state, unread count, empty/error/loading states, and authorization isolation.
8. Profile editing validates fields, supports avatar/cover uploads, preserves existing values, and never mass-assigns protected fields.
9. Backend feature tests and real browser E2E tests pass from a fresh seeded database.
10. The final build is deployable from the Laravel public directory or from a separate frontend server with documented `VITE_API_URL`/CORS settings.

---

## Phase 0: Baseline, Branch Safety, and Tooling

### Task 1: Capture the baseline and isolate local artifacts

**Objective:** Establish a clean starting point before the remaster.

**Files:**
- Inspect: `.gitignore`, `BACKEND/.gitignore`, `FRONTEND/package.json`, `BACKEND/composer.json`.
- Modify: `.gitignore` only if generated assets, SQLite, screenshots, or local reports are not already ignored.
- Create: `.hermes/plans/` plan only in this phase.

**Steps:**
1. Run `git status --short --branch`, `git diff --check`, and record existing modifications.
2. Confirm `.env`, `BACKEND/database/database.sqlite`, `BACKEND/vendor/`, `FRONTEND/node_modules/`, `FRONTEND/dist/`, and E2E screenshots are ignored.
3. Do not reset or discard existing work without explicit approval.
4. Create a feature branch such as `remaster/project-x-ui-and-hardening`.

**Verification:** `git diff --check` is clean for the branch changes; no secret or database file is staged.

**Commit:** `chore: prepare remaster baseline`

### Task 2: Add frontend test and formatting infrastructure

**Objective:** Make UI behavior and formatting repeatable before changing components.

**Files:**
- Modify: `FRONTEND/package.json`, `FRONTEND/vite.config.js`.
- Create: `FRONTEND/vitest.config.js`, `FRONTEND/src/test/setup.js`, `FRONTEND/src/test/test-utils.jsx`.
- Create: `FRONTEND/src/**/*.test.jsx` incrementally with each feature.

**Steps:**
1. Add Vitest, Testing Library, `@testing-library/jest-dom`, and `jsdom` only if compatible with the current React/Vite versions.
2. Add scripts: `test`, `test:run`, `test:coverage`, and `format:check`.
3. Configure the `@` alias consistently in Vite and Vitest.
4. Add a smoke test for the theme provider or root render; run it and observe the expected initial failure before implementation.

**Verification:** `pnpm test:run` runs one test; `pnpm run build` remains green.

**Commit:** `test: add frontend test harness`

---

## Phase 1: Theme System and Current shadcn/ui Foundation

### Task 3: Upgrade the design token layer

**Objective:** Replace duplicated/inconsistent CSS variables with a complete semantic theme contract.

**Files:**
- Modify: `FRONTEND/src/index.css`, `FRONTEND/tailwind.config.js` or the Tailwind v4 entrypoint if migrated.
- Create: `FRONTEND/src/lib/theme.js`.
- Test: `FRONTEND/src/lib/theme.test.js`.

**Steps:**
1. Define tokens for background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, border, input, ring, chart/data accents, and radius.
2. Define `:root`, `.dark`, and any system-theme strategy without duplicating `--ring` or `--radius` declarations.
3. Remove `.active` literal `blue/white` styles and convert interactive states to semantic tokens.
4. Keep warning semantics amber where an element communicates urgency; do not flatten warnings into generic muted surfaces.
5. Decide whether to migrate to Tailwind v4. If so, use the current shadcn Vite/Tailwind setup and CSS-first theme variables; otherwise keep Tailwind v3 temporarily and document the upgrade boundary.

**Verification:** Token test verifies both theme maps expose required semantic roles; `pnpm run build` passes.

**Commit:** `feat: establish semantic theme tokens`

### Task 4: Add a real theme provider and toggle

**Objective:** Let users select light, dark, or system mode and persist the choice.

**Files:**
- Create: `FRONTEND/src/components/theme-provider.jsx`, `FRONTEND/src/components/theme-toggle.jsx`.
- Modify: `FRONTEND/src/App.jsx`, `FRONTEND/src/main.jsx`, `FRONTEND/src/features/sidebar/LeftBar.jsx` or the current sidebar entrypoint.
- Test: `FRONTEND/src/components/theme-provider.test.jsx`.

**Steps:**
1. Implement a small provider that reads `localStorage`, supports `light | dark | system`, listens to `prefers-color-scheme`, and toggles the root class before the first meaningful paint where practical.
2. Remove `document.body.classList.add("dark")` from `App.jsx`.
3. Add a shadcn-style dropdown/toggle with accessible labels and icon state.
4. Ensure the provider does not flash or persist invalid values.

**Verification:** Test persisted theme, system fallback, and toggle behavior. Verify both themes through browser screenshots.

**Commit:** `feat: add persisted light-dark-system theme`

### Task 5: Normalize shadcn/ui primitives

**Objective:** Bring shared UI primitives to one current, accessible style and remove ad-hoc styling from feature pages.

**Files:**
- Modify: `FRONTEND/src/components/ui/button.jsx`, `avatar.jsx`, `card.jsx`, `dialog.jsx`, `dropdown-menu.jsx`, `input.jsx`, `tabs.jsx`, `textarea.jsx`, `toast.jsx`, `tooltip.jsx`, `skeleton.jsx`, `sheet.jsx`, `scroll-area.jsx`.
- Create as needed: `badge.jsx`, `alert.jsx`, `command.jsx`, `separator.jsx`, `form.jsx`, `pagination.jsx`, `alert-dialog.jsx` using the current shadcn generator/pattern.
- Test: primitive accessibility/render tests under `FRONTEND/src/components/ui/*.test.jsx`.

**Steps:**
1. Generate/update components from the current shadcn/ui source rather than manually copying unrelated variants.
2. Preserve JavaScript support unless a TypeScript migration is explicitly chosen.
3. Ensure every interactive variant uses semantic foreground/background pairs, especially `outline`, `ghost`, active tabs, dropdown rows, and destructive actions.
4. Add `aria-label`, focus-visible rings, disabled states, and keyboard-safe dialog/menu behavior.

**Verification:** Render representative primitives in both themes; run Vitest and build.

**Commit:** `refactor: normalize shadcn ui primitives`

---

## Phase 2: Backend Authentication and API Hardening

### Task 6: Move token login into a controller with validation and rate limiting

**Objective:** Replace the closure-based login route with a testable, bounded authentication endpoint.

**Files:**
- Create: `BACKEND/app/Http/Controllers/Api/TokenAuthController.php`.
- Create: `BACKEND/app/Http/Requests/Api/TokenLoginRequest.php`.
- Modify: `BACKEND/routes/api.php`, `BACKEND/config/sanctum.php`, `BACKEND/config/auth.php`.
- Test first: `BACKEND/tests/Feature/Auth/TokenAuthenticationTest.php`.

**TDD steps:**
1. Add failing tests for valid login, invalid credentials, validation errors, token replacement/revocation, and rate limiting.
2. Run `php artisan test --filter=TokenAuthenticationTest` and confirm the expected failures.
3. Implement the controller and request class with `Hash::check`, bounded credentials, a named token ability, and a configurable expiration policy.
4. Add `throttle:auth` or a documented equivalent to the public route.
5. Return a safe `UserResource`; never return password, token hashes, or private profile fields.

**Verification:** `php artisan test --filter=TokenAuthenticationTest` passes; API returns JSON for all failures.

**Commit:** `feat: harden token authentication`

### Task 7: Implement token-aware logout and current-user endpoints

**Objective:** Make logout revoke only the current token and keep frontend auth state consistent.

**Files:**
- Modify: `BACKEND/app/Http/Controllers/Api/TokenAuthController.php`, `BACKEND/routes/api.php`.
- Modify: `FRONTEND/src/hooks/useAuth.js`, `FRONTEND/src/api/apiService.js`, `FRONTEND/src/slices/authSlice.js`.
- Test: extend `BACKEND/tests/Feature/Auth/TokenAuthenticationTest.php`; create `FRONTEND/src/hooks/useAuth.test.jsx`.

**Steps:**
1. Add protected `POST /api/logout` that deletes the current access token only.
2. Add `/api/me` or standardize on `/api/user`; use one canonical endpoint.
3. Add Axios 401 handling that clears token and navigates once, avoiding redirect loops.
4. Remove unnecessary CSRF calls from token-authenticated mutations; keep CSRF only if session auth remains for a separate legacy route.
5. Ensure registration either returns a token directly or follows one documented token flow.

**Verification:** Login, reload, API request, logout, and post-logout API denial are covered.

**Commit:** `fix: make token session lifecycle consistent`

### Task 8: Harden CORS, same-origin serving, and configuration

**Objective:** Make local development and TCP tunnel access deterministic without wildcard credential exposure.

**Files:**
- Modify: `BACKEND/config/cors.php`, `BACKEND/.env.example`, `FRONTEND/.env.example`, `BACKEND/routes/web.php`.
- Create: `BACKEND/config/projectx.php` if needed for allowed frontend origins.
- Test: `BACKEND/tests/Feature/Infrastructure/CorsTest.php`.

**Steps:**
1. Read allowed origins from `FRONTEND_URLS`/`CORS_ALLOWED_ORIGINS`, trim empty values, and document tunnel origin configuration.
2. Keep `supports_credentials` false for pure bearer-token API calls unless a session route explicitly requires it.
3. Ensure `OPTIONS` preflight returns the expected headers for allowed origins and no `Access-Control-Allow-Origin` for disallowed origins.
4. Make the Laravel SPA fallback serve `public/index.html` only for non-API paths and preserve API 404 JSON responses.
5. Add a deployment note: same-origin tunnel uses `http://localhost:8000`; separate frontend uses an explicit origin and `VITE_API_URL`.

**Verification:** Test preflight from port 4000/5173 and same-origin `/home`, `/dashboard`, and API 404 behavior.

**Commit:** `fix: make tunnel and cors configuration deterministic`

### Task 9: Add authorization policies and request validation

**Objective:** Prevent users from mutating other users' posts, profiles, messages, and notifications.

**Files:**
- Create: `BACKEND/app/Policies/PostPolicy.php`, `UserPolicy.php`, `MessagePolicy.php`, `NotificationPolicy.php`.
- Modify: `BACKEND/app/Providers/AuthServiceProvider.php` or Laravel 11 policy registration, controllers, and routes.
- Create: `BACKEND/app/Http/Requests/Api/StorePostRequest.php`, `UpdatePostRequest.php`, `UpdateProfileRequest.php`, `SendMessageRequest.php`.
- Test first: `BACKEND/tests/Feature/Authorization/ResourceAuthorizationTest.php`.

**Steps:**
1. Write failing tests for cross-user post delete/update, profile update, message access, and notification read attempts.
2. Add policies and authorize every mutation/read with route model binding.
3. Validate text lengths, image count/size/MIME, profile enum/date fields, message length, and pagination bounds.
4. Replace `$request->all()` with validated payloads and explicit upload handling.
5. Prevent self-follow, self-message, duplicate likes/follows, and repeated notification side effects.

**Verification:** Authorization test suite passes, including direct API calls bypassing the UI.

**Commit:** `feat: enforce API authorization and validation`

---

## Phase 3: Data Model and Feature Logic

### Task 10: Normalize model relationships and resource serialization

**Objective:** Make resources safe, efficient, and consistent for frontend consumption.

**Files:**
- Modify: `BACKEND/app/Models/User.php`, `Post.php`, `Like.php`, `Follower.php`, `Message.php`, `Notification.php`.
- Modify: `BACKEND/app/Http/Resources/UserResource.php`, `PostResource.php`, `MessageResource.php`, `NotificationResource.php`.
- Create: `BACKEND/app/Http/Resources/PaginationMetaResource.php` if useful.
- Test: `BACKEND/tests/Feature/Api/ResourceShapeTest.php`.

**Steps:**
1. Fix relationship naming (`Like::post()` instead of the current incorrectly named/missing relation).
2. Use `withCount`/`withExists` instead of loading entire follower/like collections for counts and booleans.
3. Make nullable date fields safe; do not call `Carbon::parse(null)`.
4. Exclude email and private profile data from public user cards unless the caller is the owner.
5. Ensure every resource has stable IDs, ISO timestamps, pagination metadata, and nullable-safe nested users.
6. Add eager loading to feed, conversation, notification, and profile queries to prevent N+1 queries.

**Verification:** Resource shape tests pass and Laravel query log/feature test confirms bounded query counts for representative endpoints.

**Commit:** `refactor: normalize API resources and relationships`

### Task 11: Harden posts, likes, comments, and image uploads

**Objective:** Make the core feed safe and reliable.

**Files:**
- Modify: `BACKEND/app/Http/Controllers/Api/PostController.php`, `LikeController.php`.
- Modify: `BACKEND/app/Models/Post.php`, `Image.php`.
- Create: `BACKEND/app/Services/PostService.php` only if it reduces controller complexity.
- Test first: `BACKEND/tests/Feature/Api/PostFeatureTest.php`.

**Steps:**
1. Add failing tests for create, empty-content rejection, paginated feed, owner-only edit/delete, valid image upload, invalid MIME/size rejection, like toggle idempotency, and comment creation.
2. Store user content as plain text and render safely; remove `nl2br` plus `dangerouslySetInnerHTML` as the default path unless sanitized HTML is intentionally supported.
3. Use Laravel Storage with generated paths rather than direct `move()` into public directories.
4. Create comment notifications only when the actor is not the post owner.
5. Wrap post plus image writes in a transaction and clean up partial files on failure.
6. Add unique database constraint on `(post_id, user_id)` for likes and handle duplicate race errors safely.

**Verification:** `php artisan test --filter=PostFeatureTest` passes with fresh database.

**Commit:** `feat: harden feed posts likes comments and uploads`

### Task 12: Harden follow/friend logic

**Objective:** Make all Friends tabs correct, idempotent, and authorization-safe.

**Files:**
- Modify: `BACKEND/app/Http/Controllers/Api/FollowerController.php`, `UserController.php`, `User.php`.
- Modify: `BACKEND/database/migrations/2024_05_21_205901_create_followers_table.php` if a check constraint/index is required.
- Test first: `BACKEND/tests/Feature/Api/FriendsFeatureTest.php`.

**Steps:**
1. Add failing tests for follow, unfollow, self-follow rejection, duplicate-follow idempotency, suggestions excluding self/followed users, and followers/following counts.
2. Use a transaction or unique constraint-safe insert/delete path.
3. Add pagination for followers/following/suggestions instead of loading all users.
4. Create one notification per newly-created follow, never on unfollow or duplicate requests.
5. Return a consistent status payload containing `is_following`, follower count, and following count.

**Verification:** Friends API tests pass; counts remain correct after repeated requests.

**Commit:** `feat: harden follow and friends logic`

### Task 13: Harden notifications

**Objective:** Provide a consistent notification stream and read-state contract.

**Files:**
- Modify: `BACKEND/app/Http/Controllers/Api/NotificationController.php`, `Notification.php`, `NotificationResource.php`.
- Create: `BACKEND/app/Services/NotificationService.php`.
- Test first: `BACKEND/tests/Feature/Api/NotificationFeatureTest.php`.

**Steps:**
1. Add failing tests for pagination, unread count, mark-one authorization, mark-all scoping, and event creation for follow/like/comment/message.
2. Centralize creation in `NotificationService` with type-specific payloads.
3. Add indexes for `(user_id, read_at, created_at)` and avoid notification queries for other users.
4. Return a stable `is_read` boolean plus nullable `from_user` and target IDs.
5. Add a cleanup/retention decision to documentation; do not add background jobs unless required now.

**Verification:** Notification feature tests pass and unread count changes exactly once per read action.

**Commit:** `feat: standardize notification lifecycle`

### Task 14: Harden messages and conversations

**Objective:** Make messaging isolated, ordered, and predictable.

**Files:**
- Modify: `BACKEND/app/Http/Controllers/Api/MessageController.php`, `Message.php`, `MessageResource.php`.
- Modify: message migration indexes if needed.
- Test first: `BACKEND/tests/Feature/Api/MessageFeatureTest.php`.

**Steps:**
1. Add failing tests for conversation grouping, participant-only access, send validation, self-message rejection, read marking, unread count, and chronological order.
2. Use a reusable participant scope so every message query includes both participants and cannot leak data.
3. Fix route ordering/constraints so `/messages/unread-count` cannot be interpreted as a user ID.
4. Return a dedicated conversation summary resource with partner, latest message, unread count, and timestamp.
5. Add a unique/efficient index strategy for sender/receiver/time queries.

**Verification:** Message feature tests pass; an unrelated user receives 403/404 and no message data.

**Commit:** `feat: harden messaging and conversations`

---

## Phase 4: Frontend Server-State and Layout Remaster

### Task 15: Introduce a QueryClient and shared API helpers

**Objective:** Replace scattered fetch logic with cacheable query/mutation primitives.

**Files:**
- Modify: `FRONTEND/package.json`, `FRONTEND/src/main.jsx`, `FRONTEND/src/api/apiService.js`.
- Create: `FRONTEND/src/api/endpoints.js`, `FRONTEND/src/lib/query-client.js`, `FRONTEND/src/hooks/useApiError.js`.
- Test: `FRONTEND/src/api/apiService.test.js`, `FRONTEND/src/lib/query-client.test.js`.

**Steps:**
1. Add `@tanstack/react-query` and a devtools package only if useful for local development.
2. Configure default stale time, retry policy (no retries for 401/403/422), and query error handling.
3. Define typed-by-convention endpoint functions with one URL policy and safe JSON/FormData handling.
4. Keep Redux for auth identity/token only; migrate posts/messages/notifications/friends to queries.
5. Add abort/cancellation support and avoid setting state after unmount.

**Verification:** Query provider smoke test passes; existing build remains green.

**Commit:** `refactor: centralize server state with tanstack query`

### Task 16: Remaster the authenticated shell and navigation

**Objective:** Create a responsive, accessible, theme-aware application shell.

**Files:**
- Modify: `FRONTEND/src/layouts/UserLayout.jsx`, `GuestLayout.jsx`.
- Modify: `FRONTEND/src/features/sidebar/LeftBar.jsx`, `sidebar.jsx`, `sidebar-desktop.jsx`, `sidebar-mobile.jsx`, `RightBar.jsx`, `UserBanner.jsx`.
- Create: `FRONTEND/src/components/app-shell.jsx`, `FRONTEND/src/components/page-header.jsx`, `FRONTEND/src/components/empty-state.jsx`, `FRONTEND/src/components/error-state.jsx`.
- Test: shell and navigation tests.

**Steps:**
1. Use semantic surfaces and explicit foreground tokens; remove literal gray/white classes in shared navigation.
2. Use `NavLink` active state rather than unused `location` variables or a global `.active` class.
3. Add mobile bottom/slide navigation, desktop sidebar, skip link, landmarks, and visible focus states.
4. Add theme toggle to the shell and clear active route labels.
5. Add route-level loading/error boundaries and a consistent page header.

**Verification:** Keyboard navigation, focus order, both themes, and 320px/768px/1280px layouts are tested in browser.

**Commit:** `feat: remaster responsive app shell`

---

## Phase 5: Feature-by-Feature Frontend Remaster

### Task 17: Remaster auth pages and protected routing

**Objective:** Make login/register reliable with token auth and accessible form states.

**Files:**
- Modify: `FRONTEND/src/pages/authentication/Login.jsx`, `Register.jsx`, `FRONTEND/src/layouts/GuestLayout.jsx`, `FRONTEND/src/app/router.jsx`.
- Modify: `FRONTEND/src/hooks/useAuth.js`, `FRONTEND/src/slices/authSlice.js`.
- Create: `FRONTEND/src/components/auth/auth-form-field.jsx`.
- Test first: auth component tests and E2E auth spec.

**Steps:**
1. Write failing tests for empty fields, invalid credentials, loading/disabled submit, successful navigation, token persistence, and logout.
2. Replace uncontrolled/ad-hoc error rendering with shared form field/error components.
3. Use a route guard that checks token and hydrates `/api/user` exactly once.
4. Prevent logged-in users from seeing guest routes and prevent unauthenticated users from rendering protected content.
5. Ensure the API base URL works on same-origin port 8000 and separate tunnel/frontend origins.

**Verification:** Auth tests and real browser login/logout pass with seeded users.

**Commit:** `feat: remaster auth flows and route guards`

### Task 18: Remaster home feed and post composer

**Objective:** Make the main feed fast, safe, and resilient.

**Files:**
- Modify: `FRONTEND/src/pages/home/HomePage.jsx`.
- Modify: `FRONTEND/src/features/post/Post.jsx`, `PostBox.jsx`, `PostInfo.jsx`, `PostEditForm.jsx`, `Comment.jsx`, `ImagesCarousel.jsx`.
- Create: `FRONTEND/src/features/post/post-card.jsx`, `post-composer.jsx`, `post-actions.jsx` if splitting reduces complexity.
- Test: `FRONTEND/src/features/post/*.test.jsx`, E2E feed spec.

**Steps:**
1. Add failing tests for feed loading/error/empty/pagination, post validation, composer reset, image previews/removal, like toggle, edit, delete confirmation, and comment submit.
2. Use `useInfiniteQuery` for posts and stable keys (`post_id`, never `Math.random()`).
3. Render post content as escaped text with preserved line breaks; remove unsafe `dangerouslySetInnerHTML` unless server sanitization is introduced and tested.
4. Use shadcn Card, Avatar, DropdownMenu, Dialog, AlertDialog, Skeleton, Badge, and Tooltip primitives.
5. Add optimistic like updates with rollback; invalidate posts after create/edit/delete; disable duplicate submissions.
6. Keep image loading/error fallback and accessible alt text.

**Verification:** Home E2E creates a post, likes it, opens comments, edits/deletes an owned post, and verifies non-owner controls are absent.

**Commit:** `feat: remaster feed composer and post interactions`

### Task 19: Remaster Friends tabs

**Objective:** Make Suggestions, Followers, and Following tabs robust and responsive.

**Files:**
- Modify: `FRONTEND/src/pages/home/FriendsPage.jsx`, `FRONTEND/src/components/UserMiniProfile.jsx`, `FRONTEND/src/components/UserHoverCart.jsx`, `FRONTEND/src/hooks/useFollow.js`.
- Create: `FRONTEND/src/features/friends/user-card.jsx`, `friends-tabs.jsx`.
- Test: Friends component tests and E2E tab spec.

**Steps:**
1. Add failing tests for tab selection, loading/error/empty states, follow/unfollow pending state, optimistic rollback, and exclusion of the current user.
2. Use query keys per tab and mutation invalidation for user/friend counts.
3. Replace local `User` state naming and stale follow toggles with a mutation state derived from the query cache.
4. Make tabs horizontally scrollable on narrow screens and preserve active state via Radix Tabs.
5. Add accessible card semantics, avatar fallback, `aria-label`, and theme-safe follow buttons.

**Verification:** All three tabs load seeded data; repeated follow/unfollow requests leave correct server state.

**Commit:** `feat: remaster friends tabs and follow mutations`

### Task 20: Remaster notifications

**Objective:** Make notifications readable, filterable, and correct across themes.

**Files:**
- Modify: `FRONTEND/src/pages/home/NotifPage.jsx`, `FRONTEND/src/hooks/useNotifications.js`.
- Create: `FRONTEND/src/features/notifications/notification-item.jsx`, `notification-icon.jsx`.
- Test: notification component tests and E2E notification spec.

**Steps:**
1. Add failing tests for unread styling, mark-one-read, mark-all-read, navigation to post, empty state, retry state, and pagination.
2. Use `useInfiniteQuery`/mutation invalidation instead of manually incrementing unread counts without server confirmation.
3. Use semantic tokens for read/unread surfaces, icon backgrounds, text, and hover states.
4. Add `aria-live` only for meaningful unread-count updates; avoid noisy announcements.
5. Use stable notification IDs and safe optional nested user data.

**Verification:** Read actions update the UI and server count exactly once; both themes remain legible.

**Commit:** `feat: remaster notifications experience`

### Task 21: Remaster messages

**Objective:** Deliver a modern conversation list and chat experience with correct cache updates.

**Files:**
- Modify: `FRONTEND/src/pages/home/MessagesPage.jsx`, `FRONTEND/src/hooks/useMessages.js`.
- Create: `FRONTEND/src/features/messages/conversation-list.jsx`, `chat-panel.jsx`, `message-bubble.jsx`, `message-composer.jsx`.
- Test: message component tests and E2E messaging spec.

**Steps:**
1. Add failing tests for conversation selection, message ordering, send validation, disabled pending state, empty state, back navigation, and read-state refresh.
2. Use query keys for conversations and `['messages', partnerId]` for chat history.
3. Update the active chat cache after send and invalidate conversation summaries; prevent duplicate sends on Enter/click races.
4. Add keyboard-safe composer, multiline support, scroll-to-latest behavior, and a loading skeleton that does not jump layout.
5. Keep message bubbles theme-aware and ensure timestamps are secondary readable text.

**Verification:** E2E opens a seeded conversation, sends a message, returns to the list, and verifies latest preview/unread behavior.

**Commit:** `feat: remaster messages and conversation cache`

### Task 22: Remaster profile and media editing

**Objective:** Make profile display/edit safe, compact, and fully functional.

**Files:**
- Modify: `FRONTEND/src/pages/home/ProfilePage.jsx`, `UpdateProfile.jsx`, `FRONTEND/src/components/UserAvatar.jsx`.
- Create: `FRONTEND/src/features/profile/profile-header.jsx`, `profile-form.jsx`, `profile-stat.jsx`.
- Test: profile form tests and E2E profile spec.

**Steps:**
1. Add failing tests for initial values, nullable fields, file selection/preview, validation errors, submit pending state, success refresh, and failed upload rollback.
2. Use a single schema/field definition for profile form rendering to avoid the current large duplicated form.
3. Send `FormData` only for upload fields and preserve non-file values correctly.
4. Add real image fallback and on-error fallback for external avatar URLs; use `alt` text and `object-cover` safely.
5. Display follower/following/post counts from API data rather than placeholders (`2k`, `10k`, `15`).

**Verification:** Profile E2E edits bio and avatar/cover fields with seeded auth; API rejects protected-field injection.

**Commit:** `feat: remaster profile and media editing`

---

## Phase 6: Data Seeding, Real E2E, and Deployment

### Task 23: Make seed data deterministic and external-media resilient

**Objective:** Ensure every test starts with known users and usable media without relying on unstable random loops.

**Files:**
- Modify: `BACKEND/database/seeders/DatabaseSeeder.php`, `UserFactory.php`, `PostFactory.php`, `ImageFactory.php`, `MessageFactory.php`, `NotificationFactory.php`.
- Create: `BACKEND/database/seeders/TestScenarioSeeder.php` if separating deterministic fixtures from volume data.
- Test: `BACKEND/tests/Feature/Database/SeedScenarioTest.php`.

**Steps:**
1. Keep fixed accounts `test@example.com` and `other@example.com`, password `12345678`, and fixed relationships/messages/notifications.
2. Use UI Avatars or DiceBear URLs consistently; use image fallback behavior so tests do not fail if an external image service is temporarily unavailable.
3. Prevent factory infinite loops and duplicate relationship creation.
4. Add a small deterministic seed mode for tests and an optional larger demo mode for local browsing.

**Verification:** `php artisan migrate:fresh --seed --force` succeeds repeatedly; seed shape tests verify counts and fixed IDs/relationships without assuming random IDs.

**Commit:** `test: make demo and e2e seed data deterministic`

### Task 24: Replace mocked-only E2E checks with real browser flows

**Objective:** Verify the application as a user sees it against the seeded Laravel backend.

**Files:**
- Modify: `e2e_test.py` or replace with `e2e/project_x.spec.py`.
- Create: `e2e/conftest.py`, `e2e/api_helpers.py`, `e2e/screenshots/.gitkeep` if needed.
- Modify: `.gitignore`.

**Steps:**
1. Start Laravel on port 8000, build/copy the SPA to `BACKEND/public`, and use one same-origin browser URL whenever possible.
2. Authenticate through the real token-login UI/API; do not hard-code a long-lived token in the test file.
3. Cover login/logout, home feed, post create/edit/delete, like/comment, all friends tabs, follow/unfollow, notifications read actions, messages send/read, profile update, and direct-route refresh (`/dashboard`, `/home`, `/friends`).
4. Add invalid-path tests for wrong credentials, unauthorized mutation, empty content, oversized upload, self-follow, and self-message.
5. Capture screenshots/traces only on failure; keep generated artifacts ignored.

**Verification:** `PLAYWRIGHT_BROWSERS_PATH=... python -m pytest e2e -q` or the chosen runner returns green against a fresh seeded database. Report real browser execution, not only test discovery.

**Commit:** `test: add real end to end application coverage`

### Task 25: Final quality gates and deployment documentation

**Objective:** Produce a repeatable, documented release candidate.

**Files:**
- Modify: `README.md`, `BACKEND/.env.example`, `FRONTEND/.env.example`, `FRONTEND/package.json`, `BACKEND/composer.json`.
- Create: `docs/development.md`, `docs/tunnel-testing.md`, `docs/api.md`.

**Steps:**
1. Document clean setup, PHP extensions, Composer install, frontend install, seed commands, same-origin serving, separate-port serving, and RustDesk/TCP tunnel configuration.
2. Add scripts for `backend:test`, `frontend:test`, `frontend:build`, `e2e`, and `quality` where appropriate.
3. Run `composer validate`, `composer audit` and document unresolved upstream advisories, `php artisan test`, `pnpm lint`, `pnpm test:run`, `pnpm build`, and `git diff --check`.
4. Run a full-stack review for authorization, PII exposure, route collisions, upload handling, and external-media failure behavior.
5. Review the staged diff and remove generated build artifacts unless the chosen deployment requires them.

**Verification:** A new developer can follow the documentation and reach a working seeded app on port 8000; all quality gates pass.

**Commit:** `docs: document remaster setup and verification`

---

## Final Verification Checklist

- [ ] No forced `dark` class remains in `FRONTEND/src/App.jsx`.
- [ ] No shared navigation/menu/card component relies on literal `text-white`, `bg-white`, `text-gray-*`, or hard-coded hex colors where semantic tokens apply.
- [ ] Theme toggle works for light/dark/system and persists across reloads.
- [ ] No `Math.random()` React keys remain.
- [ ] No unsafe `dangerouslySetInnerHTML` remains for user post content without sanitization tests.
- [ ] No controller uses `$request->all()` for protected/mass-assigned updates.
- [ ] All mutation endpoints have authorization and server-side validation tests.
- [ ] `Like` has a correct `post()` relationship and unique database enforcement.
- [ ] Nullable resource fields are serialized safely.
- [ ] `messages/unread-count` is registered before `/messages/{user}` and route constraints are tested.
- [ ] CORS allows only configured development/tunnel origins.
- [ ] Seeders are repeatable and external avatar/image failures have UI fallbacks.
- [ ] Frontend uses TanStack Query for posts, friends, notifications, and messages.
- [ ] Backend Pest/PHPUnit tests pass.
- [ ] Frontend Vitest tests pass.
- [ ] Real Patchright browser E2E tests pass.
- [ ] `pnpm build`, `pnpm lint`, `composer validate`, `php artisan test`, and `git diff --check` pass.

## Open Decisions to Confirm Before Execution

1. **Tailwind migration:** migrate fully to Tailwind CSS v4/current shadcn configuration now, or keep Tailwind v3 for one compatibility phase and upgrade after the UI remaster?
2. **Auth model:** use bearer tokens for both local and tunnel access, or retain a separate first-party cookie flow in addition to bearer tokens?
3. **Frontend state:** adopt TanStack Query as planned, or keep the existing context implementation and only harden it?
4. **Deployment:** commit the built SPA under `BACKEND/public` for the one-port tunnel, or run separate frontend/backend services with explicit CORS?
5. **External media:** use UI Avatars/Picsum as demo-only seed data with local fallback, or add local storage/proxying for production reliability?

