# סמארטי-טיים

(Repository: `smarti-attendance`; the package id stays `smartime`.)

Hebrew RTL attendance management web app (React 19 + Vite 8 + Tailwind v4), built from the Figma Make desktop export.

**Status:** two screens — Attendance (נוכחות, `#/attendance`) and Employee reports (דיווחי עובדים, `#/team-reports`, managers only). Flow: before clock-in → **working**
(start time, current time, live "זמן עבודה עד כה" in HH:MM, דווח יציאה) → **day summary** (first in, last out,
total; חזרה למסך נוכחות returns to the clock-in screen — a later clock-in adds to the day's total). State: `src/hooks/useAttendanceDay.ts`.
Clock-in/out resolve only after the record is saved and read back (`useAttendanceFlow`): the button shows a spinner while pending,
repeat clicks are ignored, success shows a green banner at the top of the card ("הכניסה דווחה בהצלחה" / "היציאה דווחה בהצלחה", collapses after 5s)
and a failed save shows a coral error banner and leaves the state unchanged.
Viewports ≤ 760px render the mobile layout (`src/mobile/`: top bar, right-side drawer, persistent bottom
navigation); wider viewports render the desktop layout. Both share the same clock-in state and design tokens.
Navigation is one shared model (`src/lib/navigation.ts`): **אזור אישי** (דיווח נוכחות, דיווח היעדרות, הדיווחים שלי, הגדרות)
and **ניהול ארגוני** (דיווחי עובדים — shown only with the `org.attendance.manage` permission, see `src/lib/permissions.ts`).
Desktop sidebar and mobile menu render it identically; the mobile bottom bar uses the same order and permission.
Routing is hash-based (`src/lib/router.ts`): דיווח נוכחות and דיווחי עובדים have screens; the other items have no destination yet.

**דיווחי עובדים** — the manager's monthly approval of each employee's attendance report (אושר / ממתין לאישור / נדחה).
Desktop (`src/pages/TeamReportsPage.tsx`): search, month and department filters, כל העובדים / בקשות לאישור views, table with
row selection + bulk approve/reject, a ⋯ actions menu per row, and pagination. Mobile (`src/mobile/MobileTeamReports.tsx`):
the same data and actions as a card list with native pickers, a segmented control, an approve/reject action sheet and
"show more". Shared logic: `src/hooks/useTeamReports.ts`. **Demo data** (`src/lib/teamReports.ts`, no backend yet):
28 employees, statuses stable per month; approve/reject decisions live in memory. "הוספת בקשה" is rendered but not wired yet.
There is no backend: today's sessions are kept in the browser's `localStorage` only (reset the next day).
The other sidebar items and "הכנסה ידנית של שעה" are rendered as designed but not wired yet.

**Work location** — the pencil on the location row opens "שינוי מיקום עבודה": a centered modal on desktop, a bottom
drawer on mobile, both the same `LocationDialog` + `LocationPicker` (`src/components/location/`). Address/place search
with autocomplete (primary + secondary line, keyboard navigation, loading / empty / error + retry states); Save is
enabled only after a suggestion is picked, and nothing changes until Save is confirmed (Cancel, ✕, Escape and the
backdrop keep the previous location). The saved location is kept in `localStorage` (`src/lib/location.ts`).

Autocomplete goes through `server/places-proxy` (Cloudflare Worker → Google Places API (New)), which holds the API key.
**External setup required** — see `server/places-proxy/README.md`: deploy the Worker with the
`GOOGLE_PLACES_API_KEY` secret, then add the repo variable `PLACES_PROXY_URL`. Until then the dialog says address
search is unavailable; there is no placeholder data.

```bash
pnpm install
pnpm dev        # http://localhost:8443
pnpm typecheck
pnpm build      # -> dist/
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`
(the build uses a relative base, so it works under `/smarti-attendance/`).

## Design system

- `src/styles/tokens.css` — spacing (8px grid), type scale, colors (incl. the mobile `-mobile` roles, soft pastel blue / coral accents and success/danger feedback roles), radii, shadows, layout sizes, z-index layers
- `src/styles/components.css` + `src/components/ui/` — Button, IconButton, PunchButton, Card, Avatar, IconTile, TimeDisplay, text styles (incl. `text-value` / `text-value-lg` for numbers)
- `src/components/attendance/LocationRow.tsx` — work location, `footer` (desktop) and `tile` (mobile) variants (pin, details, edit)
- `src/components/attendance/AttendanceFeedback.tsx` — action feedback banner
- `src/styles/layout.css` — desktop shell (RTL sidebar with profile pinned to the bottom, content column)
- Light / dark theme: `:root[data-theme='dark']` in `tokens.css` overrides color roles only; `src/lib/theme.ts` + `useTheme` + `ThemeToggle`
  (desktop: sidebar header; mobile: top bar). Follows the OS setting until the user toggles; the choice is kept in `localStorage`
  (`smartime.theme`) and an inline script in `index.html` applies it before first paint.
- `src/styles/fonts.css` — self-hosted Heebo variable font (one family, weights via tokens)
