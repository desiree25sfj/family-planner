import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { DayOfWeek } from '../types/weekPlan'

type MockMeal = {
  id: number
  name: string
  shortDescription: string
}

type PlannedMealByDay = Partial<Record<DayOfWeek, MockMeal>>

const weekdays: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const mockMeals: MockMeal[] = [
  {
    id: 1,
    name: 'Taco Bowls',
    shortDescription: 'Rice, beans, vegetables, salsa',
  },
  {
    id: 2,
    name: 'Pasta with Tomato Sauce',
    shortDescription: 'Fast pasta night with parmesan',
  },
  {
    id: 3,
    name: 'Sheet Pan Salmon',
    shortDescription: 'Salmon, potatoes, broccoli, lemon',
  },
  {
    id: 4,
    name: 'Vegetable Fried Rice',
    shortDescription: 'Leftover rice, eggs, mixed vegetables',
  },
  {
    id: 5,
    name: 'Chicken Wraps',
    shortDescription: 'Tortillas, chicken, salad, dressing',
  },
]

const initialPlan: PlannedMealByDay = {
  Monday: mockMeals[0],
  Wednesday: mockMeals[1],
  Friday: mockMeals[2],
}

export function WeekViewPage() {
  const [plannedMeals, setPlannedMeals] = useState<PlannedMealByDay>(initialPlan)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday')

  const selectedMeal = plannedMeals[selectedDay]
  const plannedMealCount = useMemo(
    () => weekdays.filter((day) => plannedMeals[day]).length,
    [plannedMeals],
  )

  function assignMeal(day: DayOfWeek, meal: MockMeal) {
    setPlannedMeals((currentPlan) => ({
      ...currentPlan,
      [day]: meal,
    }))
  }

  function clearMeal(day: DayOfWeek) {
    setPlannedMeals((currentPlan) => {
      const nextPlan = { ...currentPlan }
      delete nextPlan[day]
      return nextPlan
    })
  }

  return (
    <section>
      <PageHeader
        title="Week View"
        description="Plan dinners for the week and see the household rhythm at a glance."
      />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Current draft plan</p>
          <p className="mt-1 text-sm text-slate-600">
            {plannedMealCount} of 7 dinners assigned
          </p>
        </div>
        <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Editing {selectedDay}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {weekdays.map((day) => {
            const meal = plannedMeals[day]
            const isSelected = selectedDay === day

            return (
              <article
                key={day}
                className={[
                  'flex min-h-44 flex-col rounded-lg border bg-white p-4 shadow-sm transition',
                  isSelected
                    ? 'border-ink ring-2 ring-ink/10'
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-ink">{day}</h2>
                  {meal && (
                    <span className="rounded-md bg-sage/15 px-2 py-1 text-xs font-medium text-slate-700">
                      Planned
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
                  {meal ? (
                    <div>
                      <p className="font-medium text-ink">{meal.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {meal.shortDescription}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">
                      No meal planned yet.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className="min-h-10 rounded-md bg-ink px-3 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      {meal ? 'Edit meal' : 'Assign meal'}
                    </button>
                    {meal && (
                      <button
                        type="button"
                        onClick={() => clearMeal(day)}
                        className="min-h-10 rounded-md bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
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

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-semibold text-ink">Choose dinner</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Assigning to {selectedDay}
              {selectedMeal ? `, currently ${selectedMeal.name}` : ''}.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {mockMeals.map((meal) => {
              const isAssignedToSelectedDay = selectedMeal?.id === meal.id

              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => assignMeal(selectedDay, meal)}
                  className={[
                    'w-full rounded-md border p-3 text-left transition',
                    isAssignedToSelectedDay
                      ? 'border-ink bg-slate-100'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className="block text-sm font-medium text-ink">
                    {meal.name}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {meal.shortDescription}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedMeal && (
            <button
              type="button"
              onClick={() => clearMeal(selectedDay)}
              className="mt-4 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Remove meal from {selectedDay}
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}
