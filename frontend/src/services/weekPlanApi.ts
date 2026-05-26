import { apiRequest } from './apiClient'
import type {
  CreatePlannedMealDto,
  PlannedMealResponseDto,
  UpdatePlannedMealDto,
  WeekPlanResponseDto,
} from '../types/weekPlan'

export const weekPlanApi = {
  getCurrent: () => apiRequest<WeekPlanResponseDto>('/api/weekplans/current'),

  addMeal: (plannedMeal: CreatePlannedMealDto) =>
    apiRequest<PlannedMealResponseDto>('/api/weekplans/current/meals', {
      method: 'POST',
      body: JSON.stringify(plannedMeal),
    }),

  updateMeal: (id: number, plannedMeal: UpdatePlannedMealDto) =>
    apiRequest<PlannedMealResponseDto>(`/api/weekplans/current/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plannedMeal),
    }),

  deleteMeal: (id: number) =>
    apiRequest<void>(`/api/weekplans/current/meals/${id}`, {
      method: 'DELETE',
    }),
}
