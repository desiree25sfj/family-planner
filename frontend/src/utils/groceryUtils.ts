import type { GroceryItemResponseDto } from '../types/grocery'

export function sortGroceryItems(items: GroceryItemResponseDto[]) {
  return [...items].sort((first, second) => {
    if (first.isCompleted !== second.isCompleted) {
      return first.isCompleted ? 1 : -1
    }

    return first.name.localeCompare(second.name)
  })
}
