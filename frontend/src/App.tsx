import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { GroceryPage } from './pages/GroceryPage'
import { MealsPage } from './pages/MealsPage'
import { WeekViewPage } from './pages/WeekViewPage'
import { mealsApi } from './services/mealsApi'
import { weekPlanApi } from './services/weekPlanApi'
import type { GroceryChecklistItem, ManualGroceryItem } from './types/grocery'
import type { CreateMealRequest, Meal, UpdateMealRequest } from './types/meal'
import type { AppPage } from './types/navigation'
import type { DayOfWeek, PlannedMealsByDay, WeekPlan } from './types/weekPlan'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('week')
  const [meals, setMeals] = useState<Meal[]>([])
  const [plannedMeals, setPlannedMeals] = useState<PlannedMealsByDay>({})
  const [manualGroceryItems, setManualGroceryItems] = useState<ManualGroceryItem[]>([])
  const [completedGeneratedGroceryNames, setCompletedGeneratedGroceryNames] =
    useState<Set<string>>(() => new Set())
  const [removedGeneratedGroceryNames, setRemovedGeneratedGroceryNames] =
    useState<Set<string>>(() => new Set())
  const [statusMessage, setStatusMessage] = useState('Loading planner data...')

  const generatedGroceryItems = useMemo(
    () =>
      buildGeneratedGroceryItems(
        plannedMeals,
        completedGeneratedGroceryNames,
        removedGeneratedGroceryNames,
      ),
    [completedGeneratedGroceryNames, plannedMeals, removedGeneratedGroceryNames],
  )

  const groceryItems = useMemo(
    () =>
      [
        ...generatedGroceryItems,
        ...manualGroceryItems.map((item) => ({
          id: `manual-${item.id}`,
          name: item.name,
          source: 'manual' as const,
          isCompleted: item.isCompleted,
        })),
      ].sort((first, second) => {
        if (first.isCompleted !== second.isCompleted) {
          return first.isCompleted ? 1 : -1
        }

        return first.name.localeCompare(second.name)
      }),
    [generatedGroceryItems, manualGroceryItems],
  )

  useEffect(() => {
    loadPlannerData()
  }, [])

  async function loadPlannerData() {
    try {
      const loadedMeals = await mealsApi.getAll()
      const loadedWeekPlan = await weekPlanApi.getCurrent()

      setMeals(loadedMeals)
      setPlannedMeals(toPlannedMealsByDay(loadedWeekPlan, loadedMeals))
      setStatusMessage('')
    } catch {
      setMeals([])
      setPlannedMeals({})
      setStatusMessage('Could not load API data. Start the API and refresh.')
    }
  }

  async function createMeal(meal: CreateMealRequest) {
    try {
      const createdMeal = await mealsApi.create(meal)
      setMeals((currentMeals) => [createdMeal, ...currentMeals])
      setStatusMessage('')
    } catch {
      const nextId = Math.max(0, ...meals.map((currentMeal) => currentMeal.id)) + 1
      setMeals((currentMeals) => [{ id: nextId, ...meal }, ...currentMeals])
      setStatusMessage('Saved locally because the API is unavailable.')
    }
  }

  async function updateMeal(id: number, meal: UpdateMealRequest) {
    try {
      const updatedMeal = await mealsApi.update(id, meal)
      applyMealUpdate(updatedMeal)
      setStatusMessage('')
    } catch {
      applyMealUpdate({ id, ...meal })
      setStatusMessage('Updated locally because the API is unavailable.')
    }
  }

  async function deleteMeal(id: number) {
    try {
      await mealsApi.delete(id)
      removeMealFromState(id)
      setStatusMessage('')
    } catch {
      removeMealFromState(id)
      setStatusMessage('Deleted locally because the API is unavailable.')
    }
  }

  async function assignMeal(day: DayOfWeek, meal: Meal) {
    const existingAssignment = plannedMeals[day]

    try {
      const savedPlannedMeal = existingAssignment
        ? await weekPlanApi.updateMeal(existingAssignment.plannedMealId, {
            dayOfWeek: day,
            mealId: meal.id,
          })
        : await weekPlanApi.addMeal({ dayOfWeek: day, mealId: meal.id })

      setPlannedMeals((currentPlan) => ({
        ...currentPlan,
        [day]: {
          plannedMealId: savedPlannedMeal.id,
          meal,
        },
      }))
      setStatusMessage('')
    } catch {
      setPlannedMeals((currentPlan) => ({
        ...currentPlan,
        [day]: {
          plannedMealId: existingAssignment?.plannedMealId ?? Date.now(),
          meal,
        },
      }))
      setStatusMessage('Week plan changed locally because the API is unavailable.')
    }
  }

  async function clearMeal(day: DayOfWeek) {
    const existingAssignment = plannedMeals[day]

    if (!existingAssignment) {
      return
    }

    try {
      await weekPlanApi.deleteMeal(existingAssignment.plannedMealId)
      setStatusMessage('')
    } catch {
      setStatusMessage('Week plan changed locally because the API is unavailable.')
    }

    setPlannedMeals((currentPlan) => {
      const nextPlan = { ...currentPlan }
      delete nextPlan[day]
      return nextPlan
    })
  }

  function applyMealUpdate(updatedMeal: Meal) {
    setMeals((currentMeals) =>
      currentMeals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)),
    )
    setPlannedMeals((currentPlan) => {
      const nextPlan: PlannedMealsByDay = {}

      Object.entries(currentPlan).forEach(([day, assignment]) => {
        if (!assignment) {
          return
        }

        nextPlan[day as DayOfWeek] =
          assignment.meal.id === updatedMeal.id
            ? { ...assignment, meal: updatedMeal }
            : assignment
      })

      return nextPlan
    })
  }

  function removeMealFromState(id: number) {
    setMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== id))
    setPlannedMeals((currentPlan) => {
      const nextPlan: PlannedMealsByDay = {}

      Object.entries(currentPlan).forEach(([day, assignment]) => {
        if (assignment && assignment.meal.id !== id) {
          nextPlan[day as DayOfWeek] = assignment
        }
      })

      return nextPlan
    })
  }

  function addManualGroceryItem(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    setManualGroceryItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now(),
        name: trimmedName,
        isCompleted: false,
      },
    ])
  }

  function toggleGroceryItem(item: GroceryChecklistItem) {
    if (item.source === 'manual') {
      const manualItemId = Number(item.id.replace('manual-', ''))
      setManualGroceryItems((currentItems) =>
        currentItems.map((manualItem) =>
          manualItem.id === manualItemId
            ? { ...manualItem, isCompleted: !manualItem.isCompleted }
            : manualItem,
        ),
      )
      return
    }

    const ingredientKey = item.id.replace('generated-', '')
    setCompletedGeneratedGroceryNames((currentNames) => {
      const nextNames = new Set(currentNames)

      if (nextNames.has(ingredientKey)) {
        nextNames.delete(ingredientKey)
      } else {
        nextNames.add(ingredientKey)
      }

      return nextNames
    })
  }

  function removeGroceryItem(item: GroceryChecklistItem) {
    if (item.source === 'manual') {
      const manualItemId = Number(item.id.replace('manual-', ''))
      setManualGroceryItems((currentItems) =>
        currentItems.filter((manualItem) => manualItem.id !== manualItemId),
      )
      return
    }

    const ingredientKey = item.id.replace('generated-', '')
    setRemovedGeneratedGroceryNames((currentNames) =>
      new Set(currentNames).add(ingredientKey),
    )
  }

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {statusMessage && (
        <div className="mb-4 rounded-lg border border-marigold/40 bg-marigold/10 px-4 py-3 text-sm text-slate-700">
          {statusMessage}
        </div>
      )}

      {activePage === 'week' && (
        <WeekViewPage
          availableMeals={meals}
          plannedMeals={plannedMeals}
          onAssignMeal={assignMeal}
          onClearMeal={clearMeal}
        />
      )}
      {activePage === 'meals' && (
        <MealsPage
          meals={meals}
          onCreateMeal={createMeal}
          onUpdateMeal={updateMeal}
          onDeleteMeal={deleteMeal}
        />
      )}
      {activePage === 'grocery' && (
        <GroceryPage
          groceryItems={groceryItems}
          generatedItemCount={generatedGroceryItems.length}
          manualItemCount={manualGroceryItems.length}
          onAddManualItem={addManualGroceryItem}
          onToggleItem={toggleGroceryItem}
          onRemoveItem={removeGroceryItem}
        />
      )}
    </AppShell>
  )
}

function buildGeneratedGroceryItems(
  plannedMeals: PlannedMealsByDay,
  completedNames: Set<string>,
  removedNames: Set<string>,
): GroceryChecklistItem[] {
  const ingredientsByName = new Map<string, string>()

  Object.values(plannedMeals).forEach((assignment) => {
    assignment?.meal.ingredients.forEach((ingredient) => {
      const name = ingredient.trim()

      if (!name) {
        return
      }

      const key = normalizeName(name)
      if (!ingredientsByName.has(key)) {
        ingredientsByName.set(key, name)
      }
    })
  })

  return Array.from(ingredientsByName.entries())
    .filter(([key]) => !removedNames.has(key))
    .map(([key, name]) => ({
      id: `generated-${key}`,
      name,
      source: 'generated' as const,
      isCompleted: completedNames.has(key),
    }))
    .sort((first, second) => first.name.localeCompare(second.name))
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function toPlannedMealsByDay(weekPlan: WeekPlan, meals: Meal[]): PlannedMealsByDay {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]))
  const plannedMealsByDay: PlannedMealsByDay = {}

  weekPlan.days.forEach((day) => {
    if (!day.plannedMeal) {
      return
    }

    const meal = mealsById.get(day.plannedMeal.mealId)
    if (!meal) {
      return
    }

    plannedMealsByDay[day.dayOfWeek] = {
      plannedMealId: day.plannedMeal.id,
      meal,
    }
  })

  return plannedMealsByDay
}

export default App
