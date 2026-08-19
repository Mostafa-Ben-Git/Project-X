# Project-X UI/UX Best-Practice Upgrade Plan (Section by Section)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Upgrade the Project-X social app UI/UX section by section using proven, best-in-class React/shadcn patterns — modern data layer, accessible components, polished micro-interactions — and for every section spell out the best option and the exact tools/packages to use.

**Architecture:** Keep Laravel API + Vite SPA. Introduce TanStack Query as the single server-state layer, `react-hook-form` + `zod` for all forms, and rebuild each surface with current shadcn/ui primitives on semantic theme tokens. Progressive enhancement: polish section by section, verify each with Vitest + real-browser E2E.

**Tech Stack:** React 18, Vite, Tailwind, shadcn/ui + Radix, TanStack Query v5, Redux Toolkit (auth identity only), react-hook-form + zod, sonner (toasts), embla (carousel), framer-motion (micro-interactions), Axios, Patchright E2E.

**Principle:** Every interactive surface must (a) use semantic tokens, (b) have loading/empty/error states, (c) be keyboard + screen-reader accessible, (d) persist state and avoid remount flicker, (e) be verified by tests.

---

## Section 0: Design System & Theme Foundation (cross-cutting)

**Current state:** Theme tokens exist (`:root`/`.dark`) with success/warning added; `App.jsx` wraps in a `ThemeProvider` with light/dark/system toggle; some pages still hardcode `bg-gray-800`, `text-gray-400`, `bg-indigo-600`.

**Best option:** Implement a strict shadcn design-token contract and enforce it.
- Standardize on the full shadcn token set (background/foreground/card/popover/primary/secondary/muted/accent/destructive + add `success`, `warning`, `info`, `ring`, `border`, `input`, `radius`, plus `chart`/`sidebar` tokens for future components).
- Add a `--font-sans` stack and a small spacing/typography scale; set a radius scale.
- Provide app-level `loading`, `empty`, and `error` primitives once, reused everywhere.
- Add a command palette / keyboard shortcuts layer only after core sections are solid (YAGNI now).

**Tools/packages:**
- `shadcn/ui` CLI (current `tailwindcss`-compatible recipe) to generate `button`, `input`, `form`, `card`, `badge`, `skeleton`, `alert`, `dropdown-menu`, `dialog`, `tabs`, `sheet`, `tooltip`, `sonner`, `separator`.
- `tailwind-merge`, `clsx`, `class-variance-authority` (already present), `@radix-ui/react-*` (present).
- `src/components/ui/*` already exist — regenerate any that lag the latest shadcn source.

**Files:**
- Modify: `FRONTEND/src/index.css`, `FRONTEND/tailwind.config.js`, `FRONTEND/src/components/ui/*`.
- Create: `FRONTEND/src/components/ui/badge.jsx`, `alert.jsx`, `skeleton` (verify), `sonner`.
- Test: `FRONTEND/src/lib/theme.test.js`, `FRONTEND/src/components/skeletons.test.jsx`.

**Verification:** Both light & dark render all surfaces legibly; `pnpm lint`, `pnpm test:run`, `vite build` pass.

---

## Section 1: App Shell & Navigation (sidebar + layout)

**Current state:** `UserLayout` renders `Sidebar` (desktop/mobile variants) + `RightBar`; nav items use shadcn button styles; theme toggle present. Some shared nav code is duplicated between `LeftBar` and `sidebar-*` variants, and mobile uses a Sheet.

**Best option:**
- Use a single shadcn `sidebar`-style component set (collapsible desktop rail + slide-over on mobile) rather than two near-duplicate implementations.
- Active-state via `NavLink` `isActive` with `bg-accent text-accent-foreground`; add a top/bottom nav badge for unread notifications & messages (pulled from TanStack Query).
- Add Skip-to-content link, `role="navigation"`, aria-current, and focus-visible rings.
- Ensure the shell never resets scroll/state on navigation (preserve via layout not remount).

**Tools/packages:**
- shadcn `sidebar`, `sheet`, `tooltip`, `separator`. `lucide-react` icons. Optionally `@uidotdev/usehooks` `useMediaQuery` (present).

**Files:**
- Modify: `FRONTEND/src/layouts/UserLayout.jsx`, `FRONTEND/src/features/sidebar/sidebar*.jsx`, `LeftBar.jsx`, `RightBar.jsx`, `components/ui/skeleton.jsx`.
- Create: `FRONTEND/src/components/skip-link.jsx`, `FRONTEND/src/components/unread-badge.jsx`.
- Test: sidebar active-state, mobile open/close, unread badge, keyboard nav.

**Verification:** Nav renders on 320/768/1280 widths; focus order correct; active route highlighted; unread badges reflect API counts.

---

## Section 2: Authentication (Login / Register)

**Current state:** `Login.jsx` hardcodes `bg-gray-900/text-white/bg-gray-800`, pre-fills `test@example.com` / `12345678`, uses raw `<input>` + `react-spinners` `MoonLoader`, and `InputPassWord` custom component; error text is `text-red-600`. `useAuth.login/register` use Redux + Axios; registration relies on the Breeze `/register` route then token-login.

**Best option:**
- Rebuild auth pages on semantic tokens + shadcn `Card`, `Input`, `Label`, `Button`, `Form` (react-hook-form + zod).
- No hard-coded credentials in the form. `autocomplete` values correct; loading state disables submit and shows spinner; field errors from server mapped to form fields; general error via `sonner` toast.
- Use `react-hook-form` `Controller`/`Field` bound to zod schema (`z.string().email()`, `z.string().min(8)`).
- Centralize auth API in `src/api/auth.js` returning data for TanStack Query mutations; keep Redux only for the resolved user/token session.

**Tools/packages:**
- `react-hook-form`, `zod`, `@hookform/resolvers` (zodResolver), `sonner`.
- shadcn `Form`, `Input`, `Label`, `Card`, `Button`.
- Keep `lucide-react` `Eye/EyeOff` for password visibility.

**Files:**
- Modify: `FRONTEND/src/pages/authentication/Login.jsx`, `Register.jsx`, `src/components/InputPassWord.jsx`, `src/hooks/useAuth.js`, `src/api/apiService.js`.
- Create: `FRONTEND/src/api/auth.js`, `FRONTEND/src/lib/validation/auth.js`.
- Test: form validation (empty/email/min-length), invalid credentials, loading state, success redirect, logout.

**Verification:** E2E wrong-password shows inline field error + toast; valid login redirects; both themes legible; no pre-filled secrets.

---

## Section 3: Home Feed & Post Composer

**Current state:** `HomePage` renders `PostBox` + list of `Post` cards via `PostsContext` (`usePosts`). Post keys are now stable (flicker fixed). `PostBox` submits FormData; likes managed locally in `PostInfo`; infinite scroll via `useIntersectionObserver`.

**Best option:**
- Replace `PostsContext` fetch logic with **TanStack Query `useInfiniteQuery`** for the feed with stable `queryKey`, `getNextPageParam`, `initialPageParam`, and `refetchOnWindowFocus: false`.
- Post create/edit/delete/like as `useMutation` with `onSuccess` cache invalidation (`invalidateQueries({ queryKey: ['posts'] })`) and optimistic updates for likes (rollback on error).
- Composer: image dropzone/preview with client-side validation (type/size/count) + clean reset; disable submit while pending; Enter-to-submit with `Shift+Enter` newline.
- Post card: structured shadcn `Card` with `Avatar`, `DropdownMenu` (owner edit/delete), `Badge` for counts, safe text rendering (no `dangerouslySetInnerHTML` without sanitization), `Tooltip` on actions, `image` lazy-load with reserved aspect ratio.
- Distinct skeleton shimmer while loading pages; "pull to refresh" optional (YAGNI now).

**Tools/packages:**
- `@tanstack/react-query` + `useInfiniteQuery`/`useMutation`.
- `sonner` for toasts; `react-textarea-autosize` or shadcn `Textarea` for composer; `embla-carousel-react` for image carousel; `framer-motion` for like pulse/pose (optional).
- Remove `react-spinners`/`react-loader-spinner` in favor of shadcn `Skeleton` + inline spinners.

**Files:**
- Modify: `FRONTEND/src/pages/home/HomePage.jsx`, `src/context/PostsContext.jsx` (or migrate to `src/hooks/useFeed.js`), `src/features/post/PostBox.jsx`, `Post.jsx`, `PostInfo.jsx`, `PostEditForm.jsx`, `ImagesCarousel.jsx`, `src/hooks/usePosts.js`.
- Create: `FRONTEND/src/api/posts.js`, `FRONTEND/src/features/post/post-card.jsx` (optional split), `FRONTEND/src/components/post-card-skeleton.jsx`.
- Test: feed loading/error/empty, infinite scroll, composer validation/reset, optimistic like rollback, owner-only actions.

**Verification:** E2E creates, likes, edits, deletes post; feed paginates; no errors; optimistic like correct on success/failure.

---

## Section 4: Post Detail & Comments (PostPage + ReplayBox + Comment)

**Current state:** `PostPage` mixes local state and context with many commented-out blocks; `ReplayBox` submits comments; `Comment` renders nested replies; carousel for images.

**Best option:**
- Load single post via **query** (`['post', post_id]`) with `enabled` guard; comments via `useInfiniteQuery` keyed `['post', id, 'comments']`.
- Comment composer with `react-hook-form`; optimistic add with rollback; disable duplicate submit.
- Nested replies as dedicated thread subcomponent reusing the same mutation target (`parent_id`).
- Post meta (like/comments counts) drives the header; clicking a comment scrolls/opens replies.
- Use `framer-motion` for reply/card enter animation (subtle, `reduced-motion` respected).

**Tools/packages:** `@tanstack/react-query`, `sonner`, `framer-motion` (respect `prefers-reduced-motion`), shadcn `Card`/`Avatar`/`Skeleton`/`Separator`.

**Files:**
- Modify: `FRONTEND/src/pages/dynamic/PostPage.jsx`, `src/features/post/ReplayBox.jsx`, `Comment.jsx`, `PostSection.jsx`, `Carousel.jsx`.
- Create: `FRONTEND/src/api/posts.js` (comment endpoints), `FRONTEND/src/features/post/comment-thread.jsx`.
- Test: load post, comment add, reply add, pagination, error/empty.

**Verification:** E2E opens post detail, adds comment & reply, sees optimistic update + persisted; unauthorized (non-owner) cannot delete.

---

## Section 5: Friends Tabs

**Current state:** `FriendsPage` uses shadcn `Tabs` (Suggestions/Followers/Following) with per-tab `useEffect` fetches into local state; `UserMiniProfile`/`UserHoverCart` handle follow with local toggling.

**Best option:**
- Query keyed data per tab with `initialData` and cache-time retention; a `follow` `useMutation` invalidates `['users']`, `['friends']`, `['user', 'suggestions']` and the current user counts.
- Derive `isFollowing` from the query cache; no stale local mirrors.
- Add empty/error/skeleton per tab; exclude the current user; tabs keep scroll position (Radix keeps mounted by default — set `forceMount` or preserve).
- Hover card shows robust bio (guarded `user.bio ?? ''`), counts, and follow button; add link to profile.

**Tools/packages:** `@tanstack/react-query`, shadcn `Tabs`/`Card`/`Avatar`/`Skeleton`, `sonner`.

**Files:**
- Modify: `FRONTEND/src/pages/home/FriendsPage.jsx`, `src/components/UserMiniProfile.jsx`, `UserHoverCart.jsx`, `src/hooks/useFollow.js`.
- Create: `FRONTEND/src/api/users.js`, `FRONTEND/src/features/friends/friends-tabs.jsx`, `user-card.jsx`.
- Test: tab switching, follow/unfollow optimistic + rollback, empty states, self-exclusion.

**Verification:** E2E switches all tabs, follows/unfollows, repeated actions keep server counts correct.

---

## Section 6: Notifications

**Current state:** `NotifPage` uses a local `useNotifications` hook with manual pagination and unread-count incrementing; read/unread styling present.

**Best option:**
- Query with `useInfiniteQuery` keyed `['notifications']`; `notifications/unread-count` as a lightweight query polled modestly (or invalidated after read actions).
- Mark-one-read / mark-all-read as mutations that invalidate the list + unread count (no hand-incremented counters).
- Notification item: type icon in tinted circle, actor avatar (fallback), time `ago`, unread dot/bg, navigation to post.
- Add empty/loading/error states; `aria-live="polite"` only for unread-count changes (avoid noisy announcements).

**Tools/packages:** `@tanstack/react-query`, `sonner`, `lucide-react` icons, shadcn `Avatar`/`Skeleton`/`Separator`/`Button`.

**Files:**
- Modify: `FRONTEND/src/pages/home/NotifPage.jsx`, `src/hooks/useNotifications.js`.
- Create: `FRONTEND/src/api/notifications.js`, `src/features/notifications/notification-item.jsx`, `notification-icon.jsx`.
- Test: mark-one/all, unread count sync, navigation, empty state, pagination.

**Verification:** E2E marks read, unread count decrements exactly once, both themes readable.

---

## Section 7: Messages

**Current state:** `MessagesPage` uses local `useMessages` hook with conversations list + chat panel; message bubbles theme-aware; send via mutation.

**Best option:**
- Conversations list via query keyed `['conversations']`; chat history via `['messages', partnerId]`.
- Send message `useMutation` updates the active chat cache optimistically and invalidates conversation list; guard against double-submit (disable button while pending; prevent Enter+click race).
- Auto-scroll to latest (`scrollRef`) without jank; loading skeleton that reserves height; empty/unread states.
- Poll or refetch read state on focus; show unread badge in nav.
- Use `time` formatting lib (`date-fns`) consistent across app.

**Tools/packages:** `@tanstack/react-query`, shadcn `Sheet`/`Card`/`Input`/`Avatar`/`Skeleton`, `date-fns` or built-in `Intl.RelativeTimeFormat`.

**Files:**
- Modify: `FRONTEND/src/pages/home/MessagesPage.jsx`, `src/hooks/useMessages.js`.
- Create: `FRONTEND/src/api/messages.js`, `src/features/messages/conversation-list.jsx`, `chat-panel.jsx`, `message-bubble.jsx`, `message-composer.jsx`.
- Test: conversation select, message order, send validation/pending, back nav, read-state refresh.

**Verification:** E2E opens a seed conversation, sends a message, list preview updates; no duplicate messages on double-click.

---

## Section 8: Profile

**Current state:** `ProfilePage.jsx` has a very large inline edit form (`SheetContent`) with many text inputs and hardcoded field mapping; counts are placeholders (`2k`, `10k`, `15`); `UpdateProfile.jsx` is a stub.

**Best option:**
- Split into `ProfileHeader` (avatar + cover + stats from API, not placeholders) and `ProfileForm` (shadcn `Form` + zod validating all editable fields).
- Profile query `['user', id]` + update mutation; file uploads via FormData with preview + validation; on-error rollback.
- Avatar/cover with `object-cover`, `loading="lazy"`, alt text, and graceful fallback on dead external URLs.
- Move `UpdateProfile.jsx` into the form components; remove placeholders; collapse to a single schema-driven field definition (DRY).

**Tools/packages:** `@tanstack/react-query`, `react-hook-form` + zod, shadcn `Form`/`Input`/`Textarea`/`Card`/`Avatar`/`Sheet`, `sonner`.

**Files:**
- Modify: `FRONTEND/src/pages/home/ProfilePage.jsx`, `UpdateProfile.jsx`, `src/components/UserAvatar.jsx`.
- Create: `FRONTEND/src/api/users.js`, `src/features/profile/profile-header.jsx`, `profile-form.jsx`, `profile-stat.jsx`.
- Test: initial values, validation errors, file preview, submit pending, failed-upload rollback.

**Verification:** E2E edits bio + avatar/cover via seeded auth; stats show real counts; server rejects protected-field injection.

---

## Section 9: Cross-Cutting Improvements

**Current state:** `apiService` is Axios with Bearer interceptor + 401 redirect; toasts use `react-hot-toast`; spinners used from `react-spinners`.

**Best option:**
- **Data layer:** single `QueryClient` (default staleTime 30s, retry 1, no retry on 401/403/422); endpoints in `src/api/*` modules; keep Redux for auth only.
- **Error handling:** shared error/empty components + `sonner` toasts; global error boundary on routes.
- **Forms:** all public forms via `react-hook-form` + zod; server maps validation to fields.
- **Accessibility:** skip link, focus rings, `aria-*`, `role` on dynamic regions, WCAG AA contrast, keyboard all flows.
- **Performance:** keep lazy routes, vendor-split chunks, lazy emoji, stable keys, `loading="lazy"` images with reserved space; memoize heavy cards.
- **Icons/toasts/spinners:** consolidate to `lucide-react` + `sonner` + shadcn `Skeleton`; remove `react-spinners`/`react-loader-spinner` duplication.

**Tools/packages:** `@tanstack/react-query` (+ devtools dev), `sonner`, `date-fns`, `framer-motion` (optional), shadcn `Alert`/`Skeleton`, remove `react-spinners`, `react-loader-spinner`, `react-hot-toast`.

**Files:**
- Modify: `FRONTEND/src/main.jsx`, `src/api/apiService.js`, add `src/lib/query-client.js`.
- Create: `FRONTEND/src/components/error-boundary.jsx`, `empty-state.jsx`, `error-state.jsx`.
- Test: query client config, error boundary, toast triggers.

**Verification:** App loads with unified toasts/skeletons; 401 redirects once; network errors surface an inline error + toast, not a blank screen.

---

## Implementation Order (TDD, bite-sized)

1. **Section 0+9 foundation:** QueryClient, shadcn primitives, theme audit. Commit.
2. **Section 2** auth forms (react-hook-form+zod, token layer). Commit.
3. **Section 3** feed + composer on TanStack Query. Commit.
4. **Section 4** post detail + comments. Commit.
5. **Section 5** friends tabs. Commit.
6. **Section 6** notifications. Commit.
7. **Section 7** messages. Commit.
8. **Section 8** profile. Commit.
9. **Cross-cut polish + full vitest + E2E + Lighthouse-style browser pass.** Commit.

Each task: write failing test → run RED → minimal impl → run GREEN → lint/build → commit.

## Tests / Validation

- `pnpm test:run` — Vitest component/hook/validation tests per section.
- `BACKEND` Pest/PHPUnit feature tests for authorization/validation (complement the frontend work).
- `PLAYWRIGHT_BROWSERS_PATH=... python e2e_frontend.py` — real-browser flow covering every section.
- `vite build`, `pnpm lint`.
- Browser performance pass (FCP/LCP/CLS, request count, bundle size, TTFB) after each major section.

## Risks / Tradeoffs / Open Questions

1. **TanStack Query adoption size:** adds a dependency and a migration away from `PostsContext`; worth it for cache coherence. Risk of churn — mitigate by keeping `PostsContext` thin or removing it after feed/notif/messages migrated.
2. **Framer-motion:** nice micro-interactions but can inflate bundle; keep optional and always respect `prefers-reduced-motion`.
3. **multilang/i18n:** currently English-only; if internationalizing later, wrap user-facing strings in i18n keys now (low cost) — defer full setup (YAGNI).
4. **Image/upload storage:** external avatar URLs are non-owned; decide whether to proxy/localize (ties to Task 23 of the original remaster plan).
5. **Schema-driven profile form** depends on a shared field-definition module; keep it minimal to avoid over-abstraction.

## Final Verification Checklist

- [ ] No hard-coded `bg-gray-*`/`text-gray-*`/`bg-indigo-*`/`text-red-600` outside documented assets.
- [ ] All interactive surfaces have loading, empty, and error states.
- [ ] All public forms use `react-hook-form` + zod.
- [ ] Server-state (feed, friends, notifications, messages, profile) uses TanStack Query.
- [ ] Toasts unified on `sonner`; spinners/skeletons unified on shadcn.
- [ ] Skip link, focus-visible rings, aria roles, WCAG AA contrast.
- [ ] Stable keys everywhere; no `Math.random()` keys; no remount flicker.
- [ ] `pnpm lint`, `pnpm test:run`, `vite build`, backend feature tests, and E2E all green.
