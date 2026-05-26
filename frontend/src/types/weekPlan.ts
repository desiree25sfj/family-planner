import type { MealResponseDto } from './meal'

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type PlannedMealResponseDto = {
  id: number
  dayOfWeek: DayOfWeek
  mealId: number
  mealName: string
  assignedFamilyMemberName: string | null
}

export type DayPlanResponseDto = {
  dayOfWeek: DayOfWeek
  date: string
  plannedMeal: PlannedMealResponseDto | null
}

export type WeekPlanResponseDto = {
  id: number
  weekStartDate: string
  days: DayPlanResponseDto[]
}

export type CreatePlannedMealDto = {
  dayOfWeek: DayOfWeek
  mealId: number
  assignedFamilyMemberName?: string | null
}

export type UpdatePlannedMealDto = CreatePlannedMealDto

export type PlannedMealAssignment = {
  plannedMealId: number
  meal: MealResponseDto
  assignedFamilyMemberName: string | null
}

export type PlannedMealsByDay = Partial<Record<DayOfWeek, PlannedMealAssignment>>
