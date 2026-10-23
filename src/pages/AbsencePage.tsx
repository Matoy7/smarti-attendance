import { Card, CardBody } from '@/components/ui'
import { AbsenceReport, BackButton } from '@/components/absence/AbsenceReport'

/** דיווח היעדרות — desktop: a page in the dashboard content area, laid out like דיווח נוכחות. */
export function AbsencePage() {
  return (
    <div className="page absence-page">
      <header className="page-header">
        <BackButton />
        <h1 className="text-title" data-page-title tabIndex={-1}>
          דיווח היעדרות
        </h1>
        <p className="text-body-lg text-secondary">היעדרות של ימים מלאים. הדיווח יועבר לאישור המנהל/ת.</p>
      </header>

      <Card className="absence-card">
        <CardBody>
          <AbsenceReport layout="desktop" />
        </CardBody>
      </Card>
    </div>
  )
}
