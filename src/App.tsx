import { Sidebar } from '@/components/Sidebar'
import { AttendancePage } from '@/pages/AttendancePage'
import { MobileAttendance } from '@/mobile/MobileAttendance'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function App() {
  const isMobile = useIsMobile()

  if (isMobile) return <MobileAttendance />

  return (
    <div className="app-shell" dir="rtl">
      <Sidebar />
      <main className="main-content">
        <AttendancePage />
      </main>
    </div>
  )
}
