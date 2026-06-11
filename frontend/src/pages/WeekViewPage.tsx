import { useMemo, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
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
  onCreateAndAssignMeal: (day: DayOfWeek, mealName: string) => Promise<boolean>
  onClearMeal: (day: DayOfWeek) => void
  onEditMeal: (meal: MealResponseDto) => void
  isSaving: boolean
}

export function WeekViewPage({
  availableMeals,
  plannedMeals,
  onAssignMeal,
  onCreateAndAssignMeal,
  onClearMeal,
  onEditMeal,
  isSaving,
}: WeekViewPageProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday')
  const [quickMealName, setQuickMealName] = useState('')
  const [quickAddError, setQuickAddError] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  const selectedMeal = plannedMeals[selectedDay]?.meal
  const plannedMealCount = useMemo(
    () => weekdays.filter((day) => plannedMeals[day]).length,
    [plannedMeals],
  )

  function selectDay(day: DayOfWeek) {
    if (!isSaving) {
      setSelectedDay(day)
    }
  }

  function handleDayCardKeyDown(event: KeyboardEvent<HTMLElement>, day: DayOfWeek) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectDay(day)
    }
  }

  function stopCardClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  async function quickAddMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const mealName = quickMealName.trim()

    if (!mealName) {
      setQuickAddError('Meal name is required.')
      return
    }

    try {
      setIsQuickAdding(true)
      const added = await onCreateAndAssignMeal(selectedDay, mealName)

      if (added) {
        setQuickMealName('')
        setQuickAddError('')
      }
    } finally {
      setIsQuickAdding(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Plan Week"
        description="Pick a dinner for each day. The grocery list updates from the meals you choose."
      />

      <div className="card card-pad mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">This week's dinner plan</p>
          <p className="mt-1 text-sm text-muted">
            {plannedMealCount} of 7 dinners assigned
          </p>
          {plannedMealCount === 0 && (
            <p className="mt-2 text-sm leading-6 text-muted">
              Start by picking a day below, then choose a dinner from the list.
            </p>
          )}
        </div>
        <p className="rounded-lg bg-sage/10 px-3 py-2 text-sm font-semibold text-ink">
          Choosing for {selectedDay}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-3">
          {plannedMealCount === 0 && (
            <div className="empty-state">
              <h2 className="font-semibold text-ink">No meals planned this week</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Choose a day, then pick a dinner. Your groceries will build from the
                plan.
              </p>
            </div>
          )}

          {weekdays.map((day) => {
            const meal = plannedMeals[day]?.meal
            const isSelected = selectedDay === day

            return (
              <article
                key={day}
                role="button"
                tabIndex={0}
                onClick={() => selectDay(day)}
                onKeyDown={(event) => handleDayCardKeyDown(event, day)}
                className={[
                  'card cursor-pointer p-3 transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage sm:p-5',
                  isSelected
                    ? 'border-sage bg-linen ring-2 ring-sage/15'
                    : 'hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_14px_34px_rgba(47,48,44,0.08)]',
                ].join(' ')}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{day}</h2>
                      {isSelected && (
                        <span className="rounded-md bg-sage px-2 py-1 text-xs font-semibold text-white">
                          Choosing now
                        </span>
                      )}
                      {meal && !isSelected && (
                        <span className="rounded-md bg-sage/10 px-2 py-1 text-xs font-semibold text-ink">
                          Planned
                        </span>
                      )}
                      {meal?.isDraft && (
                        <span className="rounded-md bg-marigold/15 px-2 py-1 text-xs font-semibold text-ink">
                          Draft
                        </span>
                      )}
                    </div>

                    {meal ? (
                      <div className="mt-3 rounded-lg bg-paper/70 p-3">
                        <p className="break-words text-base font-semibold text-ink">
                          {meal.name}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                          {getMealSummary(meal)}
                        </p>
                        {meal.isDraft && (
                          <button
                            type="button"
                            onClick={(event) => {
                              stopCardClick(event)
                              onEditMeal(meal)
                            }}
                            className="mt-3 text-sm font-semibold text-sage hover:text-ink"
                          >
                            Add details
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg border border-dashed border-oat bg-paper/60 p-3">
                        <p className="text-sm font-semibold text-ink">
                          No dinner chosen yet
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          Choose this day, then select a meal from Available Meals.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-40">
                    <button
                      type="button"
                      onClick={(event) => {
                        stopCardClick(event)
                        selectDay(day)
                      }}
                      disabled={isSaving}
                      className={meal ? 'btn-secondary w-full' : 'btn-primary w-full'}
                      aria-label={`${meal ? 'Change' : 'Assign'} meal for ${day}`}
                    >
                      {meal ? 'Change meal' : 'Assign meal'}
                    </button>
                    {meal && (
                      <button
                        type="button"
                        onClick={(event) => {
                          stopCardClick(event)
                          onClearMeal(day)
                        }}
                        disabled={isSaving}
                        className="btn-ghost w-full"
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

        <aside className="card card-pad lg:sticky lg:top-5">
          <div className="border-b border-oat pb-4">
            <p className="eyebrow">Available Meals</p>
            <h2 className="mt-1 font-semibold text-ink">Choose for {selectedDay}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selectedMeal
                ? `${selectedDay} currently has ${selectedMeal.name}.`
                : `${selectedDay} is empty right now.`}
            </p>
          </div>

          <form
            className="mt-4 rounded-lg border border-oat bg-paper/60 p-3"
            onSubmit={quickAddMeal}
          >
            <label className="field-label" htmlFor="quick-meal-name">
              + Add meal (quick)
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row lg:flex-col">
              <input
                id="quick-meal-name"
                value={quickMealName}
                disabled={isQuickAdding}
                onChange={(event) => {
                  setQuickMealName(event.target.value)
                  setQuickAddError('')
                }}
                className="field mt-0 min-w-0 flex-1"
                placeholder="Type a quick dinner idea..."
              />
              <button
                type="submit"
                disabled={isSaving || isQuickAdding}
                className="btn-primary"
              >
                {isQuickAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
            {quickAddError && (
              <p className="mt-2 text-sm font-medium text-berry">{quickAddError}</p>
            )}
          </form>

          {availableMeals.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-oat bg-paper/60 p-4">
              <h3 className="text-sm font-semibold text-ink">No meals available</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Quick add a meal here, or add a full recipe on the Meals page.
              </p>
            </div>
          ) : (
            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[38rem]">
              {availableMeals.map((meal) => {
                const isAssignedToSelectedDay = selectedMeal?.id === meal.id

                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => onAssignMeal(selectedDay, meal)}
                    disabled={isSaving}
                    className={[
                      'min-h-11 w-full rounded-lg border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60',
                      isAssignedToSelectedDay
                        ? 'border-sage bg-sage/10'
                        : 'border-oat bg-linen hover:border-sage/40 hover:bg-paper/80',
                    ].join(' ')}
                    aria-label={`Assign ${meal.name} to ${selectedDay}`}
                  >
                    <span className="block break-words text-sm font-medium text-ink">
                      {meal.name}
                    </span>
                    {meal.isDraft && (
                      <span className="mt-1 inline-flex rounded-md bg-marigold/15 px-2 py-1 text-xs font-semibold text-ink">
                        Draft
                      </span>
                    )}
                    <span className="mt-1 block line-clamp-2 text-sm leading-6 text-muted">
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
              Clear {selectedDay}
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

  return meal.recipeInstructions || 'Add details when you have time.'
}
