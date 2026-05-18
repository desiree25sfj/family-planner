import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { GroceryPage } from './pages/GroceryPage'
import { MealsPage } from './pages/MealsPage'
import { WeekViewPage } from './pages/WeekViewPage'
import type { Meal } from './types/meal'
import type { AppPage } from './types/navigation'
import type { DayOfWeek, PlannedMealsByDay } from './types/weekPlan'

const availableMeals: Meal[] = [
  {
    id: 1,
    name: 'Taco Bowls',
    recipeInstructions:
      'Cook rice, warm beans with taco seasoning, chop vegetables, and serve with salsa.',
    ingredients: ['Rice', 'Black beans', 'Tomatoes', 'Salsa'],
  },
  {
    id: 2,
    name: 'Pasta with Tomato Sauce',
    recipeInstructions: 'Boil pasta, warm tomato sauce, and finish with parmesan.',
    ingredients: ['Pasta', 'Tomato sauce', 'Parmesan'],
  },
  {
    id: 3,
    name: 'Sheet Pan Salmon',
    recipeInstructions:
      'Roast salmon, potatoes, and broccoli together until cooked through.',
    ingredients: ['Salmon', 'Potatoes', 'Broccoli', 'Lemon'],
  },
  {
    id: 4,
    name: 'Vegetable Fried Rice',
    recipeInstructions: 'Fry rice with eggs, vegetables, soy sauce, and sesame oil.',
    ingredients: ['Rice', 'Eggs', 'Mixed vegetables', 'Soy sauce'],
  },
  {
    id: 5,
    name: 'Chicken Wraps',
    recipeInstructions: 'Fill tortillas with chicken, salad, and dressing.',
    ingredients: ['Tortillas', 'Chicken', 'Lettuce', 'Dressing'],
  },
]

const initialPlannedMeals: PlannedMealsByDay = {
  Monday: availableMeals[0],
  Wednesday: availableMeals[1],
  Friday: availableMeals[2],
}

function App() {
  const [activePage, setActivePage] = useState<AppPage>('week')
  const [plannedMeals, setPlannedMeals] =
    useState<PlannedMealsByDay>(initialPlannedMeals)

  function assignMeal(day: DayOfWeek, meal: Meal) {
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
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'week' && (
        <WeekViewPage
          availableMeals={availableMeals}
          plannedMeals={plannedMeals}
          onAssignMeal={assignMeal}
          onClearMeal={clearMeal}
        />
      )}
      {activePage === 'meals' && <MealsPage />}
      {activePage === 'grocery' && <GroceryPage plannedMeals={plannedMeals} />}
    </AppShell>
  )
}

export default App
