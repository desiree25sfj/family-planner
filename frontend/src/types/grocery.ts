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

export type GroceryChecklistItem = {
  id: string
  name: string
  source: 'generated' | 'manual'
  isCompleted: boolean
}

export type ManualGroceryItem = {
  id: number
  name: string
  isCompleted: boolean
}
