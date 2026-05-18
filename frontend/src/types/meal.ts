export type Meal = {
  id: number
  name: string
  recipeInstructions?: string | null
  ingredients: string[]
}

export type CreateMealRequest = {
  name: string
  recipeInstructions?: string
  ingredients: string[]
}

export type UpdateMealRequest = CreateMealRequest
