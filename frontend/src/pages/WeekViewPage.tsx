import { PageHeader } from '../components/PageHeader'

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function WeekViewPage() {
  return (
    <section>
      <PageHeader
        title="Week View"
        description="Plan dinners for the week and see the household rhythm at a glance."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {weekdays.map((day) => (
          <article
            key={day}
            className="min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="font-semibold text-ink">{day}</h2>
            <p className="mt-3 text-sm text-slate-500">No meal planned yet.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
