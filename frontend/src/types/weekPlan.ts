import type { Meal } from './meal'

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type PlannedMeal = {
  id: number
  dayOfWeek: DayOfWeek
  mealId: number
  mealName: string
  assignedFamilyMemberName?: string | null
}

export type DayPlan = {
  dayOfWeek: DayOfWeek
  date: string
  plannedMeal?: PlannedMeal | null
}

export type WeekPlan = {
  id: number
  weekStartDate: string
  days: DayPlan[]
}

export type CreatePlannedMealRequest = {
  dayOfWeek: DayOfWeek
  mealId: number
  assignedFamilyMemberName?: string
}

export type UpdatePlannedMealRequest = CreatePlannedMealRequest

export type PlannedMealAssignment = {
  plannedMealId: number
  meal: Meal
}

export type PlannedMealsByDay = Partial<Record<DayOfWeek, PlannedMealAssignment>>
