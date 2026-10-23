import { Card } from '@/components/ui'
import { AbsenceReport, BackButton } from '@/components/absence/AbsenceReport'
import { MobileShell } from './MobileShell'

/** דיווח היעדרות — mobile: a full page in the mobile shell (top bar, bottom navigation). */
export function MobileAbsence() {
  return (
    <MobileShell>
      <div className="m-absence">
        <header className="m-absence-header">
          <BackButton />
          <h1 className="text-title" data-page-title tabIndex={-1}>
            דיווח היעדרות
          </h1>
        </header>
        <Card className="m-absence-card">
          <AbsenceReport layout="mobile" />
        </Card>
      </div>
    </MobileShell>
  )
}
