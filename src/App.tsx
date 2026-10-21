import { Sidebar } from '@/components/Sidebar'
import { AttendancePage } from '@/pages/AttendancePage'

export default function App() {
  return (
    <div className="app-shell" dir="rtl">
      <Sidebar />
      <main className="main-content">
        <AttendancePage />
      </main>
    </div>
  )
}
