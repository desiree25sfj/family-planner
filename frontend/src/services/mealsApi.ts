import { apiRequest } from './apiClient'
import type { CreateMealDto, MealResponseDto, UpdateMealDto } from '../types/meal'

export const mealsApi = {
  getAll: () => apiRequest<MealResponseDto[]>('/api/meals'),

  getById: (id: number) => apiRequest<MealResponseDto>(`/api/meals/${id}`),

  create: (meal: CreateMealDto) =>
    apiRequest<MealResponseDto>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  update: (id: number, meal: UpdateMealDto) =>
    apiRequest<MealResponseDto>(`/api/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/api/meals/${id}`, {
      method: 'DELETE',
    }),
}
