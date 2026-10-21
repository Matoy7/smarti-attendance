# סמארטי-טיים

(Repository: `smarti-attendance`; the package id stays `smartime`.)

Hebrew RTL attendance management web app (React 19 + Vite 8 + Tailwind v4), built from the Figma Make desktop export.

**Status:** only the Attendance screen (נוכחות) is implemented — live date/clock, clock-in / clock-out states.
Viewports ≤ 760px render the mobile layout (`src/mobile/`: top bar, right-side drawer, persistent bottom
navigation); wider viewports render the desktop layout. Both share the same clock-in state and design tokens.
Navigation items other than נוכחות are in place but have no screens yet.
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

## Design system

- `src/styles/tokens.css` — spacing (8px grid), type scale, colors, radii, shadows, layout sizes
- `src/styles/components.css` + `src/components/ui/` — Button, IconButton, Card, Avatar, text styles
- `src/styles/layout.css` — desktop shell (RTL sidebar with profile pinned to the bottom, content column)
- `src/styles/fonts.css` — self-hosted Assistant variable font (one family, weights via tokens)
