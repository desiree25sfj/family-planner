import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { GroceryPage } from './pages/GroceryPage'
import { MealsPage } from './pages/MealsPage'
import { WeekViewPage } from './pages/WeekViewPage'
import { groceryApi } from './services/groceryApi'
import { mealsApi } from './services/mealsApi'
import { weekPlanApi } from './services/weekPlanApi'
import type { GroceryItemResponseDto } from './types/grocery'
import type { CreateMealDto, MealResponseDto, UpdateMealDto } from './types/meal'
import type { AppPage } from './types/navigation'
import type { DayOfWeek, PlannedMealsByDay, WeekPlanResponseDto } from './types/weekPlan'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('week')
  const [meals, setMeals] = useState<MealResponseDto[]>([])
  const [plannedMeals, setPlannedMeals] = useState<PlannedMealsByDay>({})
  const [groceryItems, setGroceryItems] = useState<GroceryItemResponseDto[]>([])
  const [statusMessage, setStatusMessage] = useState('Loading planner data...')

  useEffect(() => {
    loadPlannerData()
  }, [])

  async function loadPlannerData() {
    try {
      const loadedMeals = await mealsApi.getAll()
      const loadedWeekPlan = await weekPlanApi.getCurrent()
      const loadedGroceryList = await groceryApi.getCurrent()

      setMeals(loadedMeals)
      setPlannedMeals(toPlannedMealsByDay(loadedWeekPlan, loadedMeals))
      setGroceryItems(sortGroceryItems(loadedGroceryList.items))
      setStatusMessage('')
    } catch {
      setMeals([])
      setPlannedMeals({})
      setGroceryItems([])
      setStatusMessage('Could not load API data. Start the API and refresh.')
    }
  }

  async function createMeal(meal: CreateMealDto) {
    try {
      const createdMeal = await mealsApi.create(meal)
      setMeals((currentMeals) => [createdMeal, ...currentMeals])
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not create meal. Check that the API is running.')
    }
  }

  async function updateMeal(id: number, meal: UpdateMealDto) {
    try {
      const updatedMeal = await mealsApi.update(id, meal)
      applyMealUpdate(updatedMeal)
      await refreshGroceryList()
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not update meal. Check that the API is running.')
    }
  }

  async function deleteMeal(id: number) {
    try {
      await mealsApi.delete(id)
      removeMealFromState(id)
      await refreshGroceryList()
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not delete meal. Check that the API is running.')
    }
  }

  async function assignMeal(day: DayOfWeek, meal: MealResponseDto) {
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
          assignedFamilyMemberName: savedPlannedMeal.assignedFamilyMemberName,
        },
      }))
      await refreshGroceryList()
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not update week plan. Check that the API is running.')
    }
  }

  async function clearMeal(day: DayOfWeek) {
    const existingAssignment = plannedMeals[day]

    if (!existingAssignment) {
      return
    }

    try {
      await weekPlanApi.deleteMeal(existingAssignment.plannedMealId)
      setPlannedMeals((currentPlan) => {
        const nextPlan = { ...currentPlan }
        delete nextPlan[day]
        return nextPlan
      })
      await refreshGroceryList()
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not update week plan. Check that the API is running.')
    }
  }

  function applyMealUpdate(updatedMeal: MealResponseDto) {
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

  async function addManualGroceryItem(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    try {
      await groceryApi.addItem({ name: trimmedName })
      await refreshGroceryList()
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not add grocery item. Check that the API is running.')
    }
  }

  async function toggleGroceryItem(item: GroceryItemResponseDto) {
    try {
      const updatedItem = await groceryApi.updateItem(item.id, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        isCompleted: !item.isCompleted,
      })
      setGroceryItems((currentItems) =>
        sortGroceryItems(
          currentItems.map((currentItem) =>
            currentItem.id === updatedItem.id ? updatedItem : currentItem,
          ),
        ),
      )
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not update grocery item. Check that the API is running.')
    }
  }

  async function removeGroceryItem(item: GroceryItemResponseDto) {
    try {
      await groceryApi.deleteItem(item.id)
      setGroceryItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      )
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not remove grocery item. Check that the API is running.')
    }
  }

  async function refreshGroceryList() {
    const groceryList = await groceryApi.getCurrent()
    setGroceryItems(sortGroceryItems(groceryList.items))
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
          generatedItemCount={
            groceryItems.filter((item) => !item.isManuallyAdded).length
          }
          manualItemCount={groceryItems.filter((item) => item.isManuallyAdded).length}
          onAddManualItem={addManualGroceryItem}
          onToggleItem={toggleGroceryItem}
          onRemoveItem={removeGroceryItem}
        />
      )}
    </AppShell>
  )
}

function sortGroceryItems(items: GroceryItemResponseDto[]) {
  return [...items].sort((first, second) => {
    if (first.isCompleted !== second.isCompleted) {
      return first.isCompleted ? 1 : -1
    }

    return first.name.localeCompare(second.name)
  })
}

function toPlannedMealsByDay(
  weekPlan: WeekPlanResponseDto,
  meals: MealResponseDto[],
): PlannedMealsByDay {
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
      assignedFamilyMemberName: day.plannedMeal.assignedFamilyMemberName,
    }
  })

  return plannedMealsByDay
}

export default App
