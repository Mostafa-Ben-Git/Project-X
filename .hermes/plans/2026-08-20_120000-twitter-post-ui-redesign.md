# Twitter/X-Style Post UI Redesign

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Redesign the post composer, post card, and feed layout to match Twitter/X's minimal, content-focused UI style.

**Architecture:** Keep existing components (PostBox, Post, PostInfo, ImagesCarousel) and restyle them to match Twitter/X. No new backend changes needed — this is purely a frontend UI/UX redesign.

**Tech Stack:** React 18, Tailwind CSS, shadcn/ui, lucide-react icons

---

## Current State Analysis

**PostBox (composer):**
- Avatar + textarea in a row, basic styling
- Upload buttons at bottom with generic icons
- No character count, no audience selector
- Emoji picker in dropdown

**Post (card):**
- h-12 avatar, border separator
- UserHoverCart for name, timestamp
- Content with dangerouslySetInnerHTML
- ImagesCarousel for media
- PostInfo with Like/Reply/Share

**Feed (HomePage):**
- `max-w-2xl` centered column
- Posts have `rounded-md border` cards
- Gap between posts

**Twitter/X Target Style:**
- Thin separators between posts (no card borders)
- Avatar top-left, name + @username + timestamp inline
- Content text with hashtags/mentions highlighted
- Media below text (single image, grid, video)
- Action row: Reply, Repost, Like, Views, Bookmark, Share
- Minimal whitespace, content-focused
- Blue accent for actions

---

## Step-by-Step Plan

### Task 1: Restyle PostBox composer

**Objective:** Make the composer match Twitter/X's "What is happening?!" style.

**Files:**
- Modify: `FRONTEND/src/features/post/PostBox.jsx`

**Changes:**
1. Change placeholder from "Say something..." to "What is happening?!"
2. Make textarea borderless, larger font, auto-grow feel
3. Move avatar to top-left of the form (not inline with textarea)
4. Add a thin `border-b` separator below the composer
5. Move action buttons (image, emoji) to bottom-left
6. Move Post button to bottom-right, make it rounded-full and blue
7. Add a character count indicator (optional, 280 char limit display)
8. Remove the `border` from the form wrapper, use `border-b` only

**Verification:**
- Visual: Composer looks like Twitter/X "What is happening?!" box
- Functional: Still submits posts with images and text
- Lint: `pnpm lint` passes

---

### Task 2: Restyle Post card layout

**Objective:** Make post cards match Twitter/X's thin-separator feed style.

**Files:**
- Modify: `FRONTEND/src/features/post/Post.jsx`

**Changes:**
1. Remove `rounded-md border` from card wrapper (no card look)
2. Keep `border-b border-border` for thin separator between posts
3. Add `hover:bg-accent/30` subtle hover on the entire post
4. Move settings menu to `absolute top-3 right-3` (already done)
5. Clean up spacing: `p-3` instead of `p-4`
6. Make content text `text-[15px]` for better readability
7. Remove the extraInfo date/time section (redundant with timestamp)

**Verification:**
- Visual: Posts flow as continuous feed items, not isolated cards
- Functional: Click to post page still works
- Lint: `pnpm lint` passes

---

### Task 3: Restyle PostInfo action row

**Objective:** Match Twitter/X's action bar (Reply, Repost, Like, Views, Bookmark, Share).

**Files:**
- Modify: `FRONTEND/src/features/post/PostInfo.jsx`

**Changes:**
1. Add Repost icon (Repeat/RefreshCw) — no handler needed yet, just visual
2. Add Bookmark icon (Bookmark) — no handler needed yet, just visual
3. Add Views count (Eye icon) — display `info.views_count` or placeholder
4. Keep existing Like (Heart) with fill animation
5. Keep existing Reply (MessageCircle) with navigate
6. Keep existing Share (Share2) with clipboard copy
7. Space icons evenly with `justify-between` instead of `justify-around`
8. Make each action a flex col with icon + count below
9. Use `text-muted-foreground` for unactive, colored for active states
10. Add `gap-0` between actions for tighter layout

**Verification:**
- Visual: 6 action icons in a row matching Twitter/X layout
- Functional: Like, Reply, Share still work
- Lint: `pnpm lint` passes

---

### Task 4: Clean up feed layout

**Objective:** Make the feed feel like Twitter/X's continuous scroll.

**Files:**
- Modify: `FRONTEND/src/pages/home/HomePage.jsx`

**Changes:**
1. Remove `gap-3` between posts (separators handle visual division)
2. Change `max-w-2xl` to `max-w-[600px]` for tighter Twitter-like width
3. Add a thin top border on the first post or a "For you / Following" tab bar
4. Add `divide-y divide-border` on the posts container for consistent separators
5. Remove `rounded-md border` from Post className (already in Task 2)

**Verification:**
- Visual: Clean continuous feed with thin separators
- Lint: `pnpm lint` passes

---

### Task 5: Style avatar and user info consistently

**Objective:** Align avatar sizing and user info across all components.

**Files:**
- Modify: `FRONTEND/src/features/post/Post.jsx` (avatar sizing)
- Modify: `FRONTEND/src/features/post/PostBox.jsx` (composer avatar)
- Modify: `FRONTEND/src/components/UserHoverCart.jsx` (hover card)

**Changes:**
1. Post avatar: `h-10 w-10` (consistent with Twitter)
2. PostBox avatar: `h-10 w-10` (match Post)
3. Ensure UserHoverCart trigger text is `text-[15px]` bold
4. Move timestamp to same line as @username: `· 2h`
5. Remove `space-x-4` from user info, use `ml-3` gap

**Verification:**
- Visual: All avatars are consistent 40px circles
- Lint: `pnpm lint` passes

---

### Task 6: Add media grid for multiple images

**Objective:** Show images in a Twitter/X-style grid (2x2 max) instead of carousel.

**Files:**
- Modify: `FRONTEND/src/features/post/ImagesCarousel.jsx`

**Changes:**
1. Single image: full width, `max-h-[512px]`, `rounded-xl`, `object-cover`
2. Two images: side by side, `grid grid-cols-2 gap-0.5`, `rounded-xl overflow-hidden`
3. Three images: 1 large left + 2 stacked right, `grid grid-cols-2 gap-0.5`
4. Four images: 2x2 grid, `grid grid-cols-2 gap-0.5`
5. Remove carousel controls for single/double images
6. Keep carousel only for 5+ images (rare)
7. Add `aspect-square` or `aspect-video` for consistent sizing

**Verification:**
- Visual: Images display in grid layout matching Twitter/X
- Functional: Single image still works, multiple images show grid
- Lint: `pnpm lint` passes

---

### Task 7: Final polish and rebuild

**Objective:** Clean up, verify, and rebuild for production.

**Files:**
- Modify: Various (minor tweaks)

**Changes:**
1. Run `pnpm lint` and fix any warnings
2. Run `pnpm build` to rebuild to `BACKEND/public/`
3. Verify at `http://localhost:8000`
4. Test: Create a post with text, with image, with multiple images
5. Test: Like, Reply, Share actions work
6. Test: Mobile responsive (bottom nav, full-width posts)

**Verification:**
- Lint: 0 errors, 0 warnings
- Build: Successful
- Visual: All components match Twitter/X style
- Functional: All features work

---

## Files Changed Summary

| File | Task | Change |
|------|------|--------|
| `FRONTEND/src/features/post/PostBox.jsx` | 1, 5 | Composer redesign |
| `FRONTEND/src/features/post/Post.jsx` | 2, 5 | Card layout |
| `FRONTEND/src/features/post/PostInfo.jsx` | 3 | Action bar |
| `FRONTEND/src/pages/home/HomePage.jsx` | 4 | Feed layout |
| `FRONTEND/src/features/post/ImagesCarousel.jsx` | 6 | Image grid |

## Risks

- **PostBox textarea auto-grow:** May need CSS for auto-expanding height
- **Image grid aspect ratios:** Different image sizes may look uneven
- **Existing functionality:** Must not break like/reply/share/post creation

## Open Questions

- Should we add a "For you / Following" tab bar at the top of the feed?
- Should we add a character count (280 limit) to the composer?
- Should we add view counts to posts (backend doesn't support this yet)?
