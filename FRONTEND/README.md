<p align="center">
  <img src="public/logo.svg" width="72" alt="Project-X logo" />
</p>

# FRONTEND — Project-X React SPA

React 18 + Vite 5 + Tailwind 3 + shadcn/ui. See root `../README.md` for full docs and screenshots.

## Logo

`src/components/logo.jsx:14` — pill-bubble X + hub. No thin × (not a close button).

```jsx
import { Logo, LogoIcon } from "@/components/logo"
<Logo size={32} wordmarkSize="lg" />
<LogoIcon size={32} variant="sidebar" />
```

Assets: `public/favicon.svg`, `public/logo.svg`, `public/logo-full.svg` → copied to `../BACKEND/public` on build.

## Scripts

Use **pnpm** (`pnpm-lock.yaml`):

```bash
pnpm install
pnpm dev          # :3000
pnpm build        # → ../BACKEND/public (assets/ + index.html)
pnpm test:run     # vitest/jsdom
pnpm lint         # --max-warnings 0
```

`@` → `src` (`vite.config.js` + `vitest.config.js`). Single `vendor` chunk — don't re-split (TDZ on lazy `ProfilePage`). `VITE_API_URL=""` → same-origin prod, Vite proxy in dev.
