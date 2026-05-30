## Goal

Replace the current MyJourney implementation with the code from
`https://github.com/gygisblanche-boop/to_75.git`.

## Important caveat

The repo is a **plain Vite + React 19** app (entry `src/main.tsx`, single `App.tsx` with its own tab switcher). This project runs on **TanStack Start** (file-based routing under `src/routes/`, SSR-capable Worker runtime). I cannot copy the repo verbatim — `main.tsx`, `index.html`, `vite.config.ts`, `tsconfig*.json`, and the repo's `package.json` would break the Lovable stack.

Instead I will port the repo's UI/logic into this project's TanStack Start shell.

## What I will copy as-is

- `src/components/` → `AuthScreen.tsx`, `BadgesDrawer.tsx`, `CircularProgress.tsx`, `GeminiCoach.tsx`, `Navigation.tsx`, `Onboarding.tsx`, `QuickLogModal.tsx`
- `src/tabs/` → `Dashboard.tsx`, `ExerciseTracker.tsx`, `HabitLog.tsx`, `BodyComp.tsx`, `TodoList.tsx`
- `src/context/AppContext.tsx` (replaces current `src/lib/app-store.tsx`)
- `src/index.css` and `src/App.css` (merged into `src/styles.css`, keeping Tailwind v4 `@import` + theme tokens required by the stack)
- `src/assets/hero.png`
- `public/favicon.svg`, `public/logo.svg`, `public/icons.svg`, `public/manifest.json`, `public/sw.js`

## What I will adapt

- **Supabase client**: repo's `src/supabase.ts` is replaced by re-exporting from `@/integrations/supabase/client` (the auto-generated Lovable file — must not be edited).
- **Routing**: repo uses internal tab state in `App.tsx`. I'll wire it into TanStack Start by:
  - Replacing `src/routes/index.tsx` with the repo's `App.tsx` content (auth gate + onboarding + tabbed shell).
  - Removing the now-redundant `src/routes/dashboard.tsx`, `exercise.tsx`, `habits.tsx`, `body.tsx`, `tasks.tsx`, `onboarding.tsx` (the repo handles all of this inside one component).
  - Keeping `src/routes/__root.tsx` (shell + `<Outlet />`) — only updating `<head>` metadata to match the repo's `index.html` (title, theme-color, fonts, manifest link).
- **Imports**: rewrite the repo's relative imports (`./components/...`, `./context/...`, `./supabase`) to use `@/` aliases consistent with this project.
- **Tailwind**: repo likely uses utility classes; this project uses Tailwind v4 via `src/styles.css`. I'll port any custom CSS variables/animations from `index.css`/`App.css` into `src/styles.css` using the existing OKLCH token pattern.

## What I will delete from current project

- `src/routes/dashboard.tsx`, `exercise.tsx`, `habits.tsx`, `body.tsx`, `tasks.tsx`, `onboarding.tsx`
- `src/lib/app-store.tsx`
- `src/components/AppShell.tsx`, `src/components/ProgressRing.tsx`
- `public/icon.svg` (replaced by repo's `logo.svg`/`favicon.svg`)

## What I will NOT touch (Lovable-managed)

- `src/integrations/supabase/*` (client, types, auth-middleware, auth-attacher, client.server)
- `src/routeTree.gen.ts` (auto-generated)
- `src/router.tsx`, `src/start.ts`, `src/server.ts`
- `.env`, `supabase/config.toml`, `package.json` (deps added via `bun add` only if needed)
- `vite.config.ts`, `tsconfig.json`

## Dependencies

Repo only needs `@supabase/supabase-js` and `lucide-react`, both already installed. No `bun add` needed.

## Risk

The repo's Gemini coach component may reference a Gemini API key. I'll wire it to Lovable AI Gateway (existing pattern) only if it currently references `import.meta.env.VITE_GEMINI_API_KEY` — otherwise leave behavior as-is.

## Outcome

Single home route (`/`) serving the auth gate → onboarding → tabbed app exactly as the GitHub repo renders, running on this project's TanStack Start + Lovable Cloud infrastructure.
