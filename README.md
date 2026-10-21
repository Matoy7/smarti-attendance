# סמארטי-טיים

(Repository: `smarti-attendance`; the package id stays `smartime`.)

Hebrew RTL attendance management web app (React 19 + Vite 8 + Tailwind v4), built from the Figma Make desktop export.

**Status:** only the Attendance screen (נוכחות) is implemented. Flow: before clock-in → **working**
(start time, current time, live "זמן עבודה עד כה" in HH:MM, סיום עבודה) → **day summary** (first in, last out,
total; חזרה למסך נוכחות returns to the clock-in screen — a later clock-in adds to the day's total). State: `src/hooks/useAttendanceDay.ts`.
Viewports ≤ 760px render the mobile layout (`src/mobile/`: top bar, right-side drawer, persistent bottom
navigation); wider viewports render the desktop layout. Both share the same clock-in state and design tokens.
Navigation items other than נוכחות are in place but have no screens yet.
There is no backend: today's sessions are kept in the browser's `localStorage` only (reset the next day).
The other sidebar items, "הכנסה ידנית של שעה" and the location edit button are rendered as designed but not wired yet.

```bash
pnpm install
pnpm dev        # http://localhost:8443
pnpm typecheck
pnpm build      # -> dist/
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`
(the build uses a relative base, so it works under `/smarti-attendance/`).

## Design system

- `src/styles/tokens.css` — spacing (8px grid), type scale, colors, radii, shadows, layout sizes
- `src/styles/components.css` + `src/components/ui/` — Button, IconButton, Card, Avatar, text styles
- `src/styles/layout.css` — desktop shell (RTL sidebar with profile pinned to the bottom, content column)
- `src/styles/fonts.css` — self-hosted Heebo variable font (one family, weights via tokens)
