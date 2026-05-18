import { apiRequest } from './apiClient'
import type {
  CreateGroceryItemRequest,
  GroceryItem,
  GroceryList,
  UpdateGroceryItemRequest,
} from '../types/grocery'

export const groceryApi = {
  getCurrent: () => apiRequest<GroceryList>('/api/grocerylist/current'),

  addItem: (item: CreateGroceryItemRequest) =>
    apiRequest<GroceryItem>('/api/grocerylist/current/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (id: number, item: UpdateGroceryItemRequest) =>
    apiRequest<GroceryItem>(`/api/grocerylist/current/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  deleteItem: (id: number) =>
    apiRequest<void>(`/api/grocerylist/current/items/${id}`, {
      method: 'DELETE',
    }),
}
