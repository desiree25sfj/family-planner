import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { MealResponseDto } from '../types/meal'
import type { DayOfWeek, PlannedMealsByDay } from '../types/weekPlan'

const weekdays: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

type WeekViewPageProps = {
  availableMeals: MealResponseDto[]
  plannedMeals: PlannedMealsByDay
  onAssignMeal: (day: DayOfWeek, meal: MealResponseDto) => void
  onClearMeal: (day: DayOfWeek) => void
  isSaving: boolean
}

export function WeekViewPage({
  availableMeals,
  plannedMeals,
  onAssignMeal,
  onClearMeal,
  isSaving,
}: WeekViewPageProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday')

  const selectedMeal = plannedMeals[selectedDay]?.meal
  const plannedMealCount = useMemo(
    () => weekdays.filter((day) => plannedMeals[day]).length,
    [plannedMeals],
  )

  return (
    <section>
      <PageHeader
        title="Plan Week"
        description="Pick a dinner for each day. The grocery list updates from the meals you choose."
      />

      <div className="card card-pad mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink">This week's dinner plan</p>
          <p className="mt-1 text-sm text-slate-600">
            {plannedMealCount} of 7 dinners assigned
          </p>
          {plannedMealCount === 0 && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start by picking a day below, then choose a dinner from the list.
            </p>
          )}
        </div>
        <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
          Editing {selectedDay}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {plannedMealCount === 0 && (
          <div className="empty-state md:col-span-2 lg:hidden">
            <h2 className="font-semibold text-ink">No meals planned this week</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a day, then pick a dinner. Your groceries will build from the plan.
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {weekdays.map((day) => {
            const meal = plannedMeals[day]?.meal
            const isSelected = selectedDay === day

            return (
              <article
                key={day}
                className={[
                  'card flex min-h-48 flex-col p-4 transition',
                  isSelected
                    ? 'border-ink ring-2 ring-ink/10'
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Dinner</p>
                    <h2 className="mt-1 font-semibold text-ink">{day}</h2>
                  </div>
                  {meal && (
                    <span className="rounded-md bg-sage/15 px-2 py-1 text-xs font-medium text-slate-700">
                      Planned
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
                  {meal ? (
                    <div>
                      <p className="text-base font-semibold text-ink">{meal.name}</p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {getMealSummary(meal)}
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-500">
                      Nothing assigned yet.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      disabled={isSaving}
                      className={meal ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                      aria-label={`${meal ? 'Change' : 'Choose'} dinner for ${day}`}
                    >
                      {meal ? 'Change' : 'Choose dinner'}
                    </button>
                    {meal && (
                      <button
                        type="button"
                        onClick={() => onClearMeal(day)}
                        disabled={isSaving}
                        className="btn-ghost flex-1"
                        aria-label={`Clear meal planned for ${day}`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="card card-pad">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-semibold text-ink">Choose dinner</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Planning {selectedDay}
              {selectedMeal ? `, currently ${selectedMeal.name}` : ''}.
            </p>
          </div>

          {availableMeals.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-ink">No meals available</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add a meal on the Meals page, then return here to plan the week.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {availableMeals.map((meal) => {
                const isAssignedToSelectedDay = selectedMeal?.id === meal.id

                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => onAssignMeal(selectedDay, meal)}
                    disabled={isSaving}
                    className={[
                      'w-full rounded-md border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60',
                      isAssignedToSelectedDay
                        ? 'border-ink bg-slate-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                    ].join(' ')}
                    aria-label={`Assign ${meal.name} to ${selectedDay}`}
                  >
                    <span className="block text-sm font-medium text-ink">
                      {meal.name}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      {getMealSummary(meal)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {selectedMeal && (
            <button
              type="button"
              onClick={() => onClearMeal(selectedDay)}
              disabled={isSaving}
              className="btn-ghost mt-4 w-full"
            >
              Remove meal from {selectedDay}
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}

function getMealSummary(meal: MealResponseDto) {
  if (meal.ingredients.length > 0) {
    return meal.ingredients.join(', ')
  }

  return meal.recipeInstructions || 'No meal details yet.'
}
