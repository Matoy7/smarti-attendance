import { useEffect, useRef } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { AttendancePage } from '@/pages/AttendancePage'
import { TeamReportsPage } from '@/pages/TeamReportsPage'
import { MobileAttendance } from '@/mobile/MobileAttendance'
import { MobileTeamReports } from '@/mobile/MobileTeamReports'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRoute } from '@/lib/router'
import { NAV_SECTIONS } from '@/lib/navigation'
import { APP_NAME } from '@/lib/app'

/** After in-app navigation: top of the page, tab title, and focus on the new screen's heading. */
function useRouteChangeEffects(route: string) {
  const first = useRef(true)
  useEffect(() => {
    const label = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === route)?.label
    document.title = label && route !== 'attendance' ? `${label} · ${APP_NAME}` : APP_NAME
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('[data-page-title]')?.focus({ preventScroll: true })
  }, [route])
}

export default function App() {
  const isMobile = useIsMobile()
  const route = useRoute()
  useRouteChangeEffects(route)

  if (isMobile) return route === 'team-reports' ? <MobileTeamReports /> : <MobileAttendance />

  return (
    <div className="app-shell" dir="rtl">
      <Sidebar />
      <main className="main-content">{route === 'team-reports' ? <TeamReportsPage /> : <AttendancePage />}</main>
    </div>
  )
}
