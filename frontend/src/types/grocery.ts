export type GroceryItemResponseDto = {
  id: number
  name: string
  quantity: string | null
  unit: string | null
  notes: string | null
  isCompleted: boolean
  isManuallyAdded: boolean
}

export type GroceryListResponseDto = {
  weekPlanId: number
  weekStartDate: string
  items: GroceryItemResponseDto[]
}

export type CreateGroceryItemDto = {
  name: string
  quantity?: string | null
  unit?: string | null
  notes?: string | null
}

export type UpdateGroceryItemDto = {
  name: string
  quantity?: string | null
  unit?: string | null
  notes?: string | null
  isCompleted: boolean
}
