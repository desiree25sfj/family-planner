import { PageHeader } from '../components/PageHeader'

export function GroceryPage() {
  return (
    <section>
      <PageHeader
        title="Grocery List"
        description="Generated and manual grocery items will live here once the API data is connected."
      />

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-3">
            <span className="h-4 w-4 rounded border border-slate-300" />
            Generated ingredients from planned meals
          </li>
          <li className="flex items-center gap-3">
            <span className="h-4 w-4 rounded border border-slate-300" />
            Manual grocery additions
          </li>
          <li className="flex items-center gap-3">
            <span className="h-4 w-4 rounded border border-slate-300" />
            Completed item checkboxes
          </li>
        </ul>
      </div>
    </section>
  )
}
