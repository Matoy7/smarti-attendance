# Smartime

Hebrew RTL attendance management web app (React 19 + Vite 8 + Tailwind v4), built from the Figma Make desktop export.

**Status:** only the Attendance screen (נוכחות) is implemented — live date/clock, clock-in / clock-out states.
Viewports ≤ 760px render the mobile layout (`src/mobile/`, from the mobile Figma export, restyled with the
desktop design system); wider viewports render the desktop layout. Both share the same clock-in state.
There is no backend: the clock-in state is kept in the browser's `localStorage` only.
The other sidebar items, "הכנסה ידנית של שעה" and the location edit button are rendered as designed but not wired yet.

```bash
pnpm install
pnpm dev        # http://localhost:8443
pnpm typecheck
pnpm build      # -> dist/
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`
(the build uses a relative base, so it works under `/smarti-attendance/`).
