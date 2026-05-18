import type { Meal } from '../types/meal'
import type { PlannedMealsByDay } from '../types/weekPlan'

export const mockMeals: Meal[] = [
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
]

export const mockPlannedMeals: PlannedMealsByDay = {
  Monday: { plannedMealId: 1, meal: mockMeals[0] },
  Wednesday: { plannedMealId: 2, meal: mockMeals[1] },
  Friday: { plannedMealId: 3, meal: mockMeals[2] },
}
