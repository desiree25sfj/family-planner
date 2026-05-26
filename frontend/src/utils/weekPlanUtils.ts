import type { MealResponseDto } from '../types/meal'
import type { DayOfWeek, PlannedMealsByDay, WeekPlanResponseDto } from '../types/weekPlan'

export function toPlannedMealsByDay(
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

export function removeMealFromPlannedMeals(
  plannedMeals: PlannedMealsByDay,
  mealId: number,
) {
  const nextPlan: PlannedMealsByDay = {}

  Object.entries(plannedMeals).forEach(([day, assignment]) => {
    if (assignment && assignment.meal.id !== mealId) {
      nextPlan[day as DayOfWeek] = assignment
    }
  })

  return nextPlan
}

export function updateMealInPlannedMeals(
  plannedMeals: PlannedMealsByDay,
  updatedMeal: MealResponseDto,
) {
  const nextPlan: PlannedMealsByDay = {}

  Object.entries(plannedMeals).forEach(([day, assignment]) => {
    if (!assignment) {
      return
    }

    nextPlan[day as DayOfWeek] =
      assignment.meal.id === updatedMeal.id
        ? { ...assignment, meal: updatedMeal }
        : assignment
  })

  return nextPlan
}
