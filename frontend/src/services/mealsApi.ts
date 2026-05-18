import { apiRequest } from './apiClient'
import type { CreateMealRequest, Meal, UpdateMealRequest } from '../types/meal'

export const mealsApi = {
  getAll: () => apiRequest<Meal[]>('/api/meals'),

  getById: (id: number) => apiRequest<Meal>(`/api/meals/${id}`),

  create: (meal: CreateMealRequest) =>
    apiRequest<Meal>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  update: (id: number, meal: UpdateMealRequest) =>
    apiRequest<Meal>(`/api/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/api/meals/${id}`, {
      method: 'DELETE',
    }),
}
