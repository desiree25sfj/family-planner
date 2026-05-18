import { apiRequest } from './apiClient'
import type {
  CreatePlannedMealRequest,
  PlannedMeal,
  UpdatePlannedMealRequest,
  WeekPlan,
} from '../types/weekPlan'

export const weekPlanApi = {
  getCurrent: () => apiRequest<WeekPlan>('/api/weekplans/current'),

  addMeal: (plannedMeal: CreatePlannedMealRequest) =>
    apiRequest<PlannedMeal>('/api/weekplans/current/meals', {
      method: 'POST',
      body: JSON.stringify(plannedMeal),
    }),

  updateMeal: (id: number, plannedMeal: UpdatePlannedMealRequest) =>
    apiRequest<PlannedMeal>(`/api/weekplans/current/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plannedMeal),
    }),

  deleteMeal: (id: number) =>
    apiRequest<void>(`/api/weekplans/current/meals/${id}`, {
      method: 'DELETE',
    }),
}
