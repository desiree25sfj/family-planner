export type GroceryItem = {
  id: number
  name: string
  quantity?: string | null
  unit?: string | null
  notes?: string | null
  isCompleted: boolean
  isManuallyAdded: boolean
}

export type GroceryList = {
  weekPlanId: number
  weekStartDate: string
  items: GroceryItem[]
}

export type CreateGroceryItemRequest = {
  name: string
  quantity?: string
  unit?: string
  notes?: string
}

export type UpdateGroceryItemRequest = CreateGroceryItemRequest & {
  isCompleted: boolean
}
