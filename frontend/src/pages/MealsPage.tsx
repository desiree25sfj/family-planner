import { PageHeader } from '../components/PageHeader'

export function MealsPage() {
  return (
    <section>
      <PageHeader
        title="Meals"
        description="Meal cards, recipe editing, and ingredient management will be added here next."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {['Taco Bowls', 'Pasta Night', 'Sheet Pan Dinner'].map((meal) => (
          <article
            key={meal}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="font-semibold text-ink">{meal}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Placeholder meal card for the upcoming API-backed meal database.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
