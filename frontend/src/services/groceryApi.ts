import { apiRequest } from './apiClient'
import type {
  CreateGroceryItemDto,
  GroceryItemResponseDto,
  GroceryListResponseDto,
  UpdateGroceryItemDto,
} from '../types/grocery'

export const groceryApi = {
  getCurrent: () => apiRequest<GroceryListResponseDto>('/api/grocerylist/current'),

  addItem: (item: CreateGroceryItemDto) =>
    apiRequest<GroceryItemResponseDto>('/api/grocerylist/current/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (id: number, item: UpdateGroceryItemDto) =>
    apiRequest<GroceryItemResponseDto>(`/api/grocerylist/current/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  deleteItem: (id: number) =>
    apiRequest<void>(`/api/grocerylist/current/items/${id}`, {
      method: 'DELETE',
    }),
}
