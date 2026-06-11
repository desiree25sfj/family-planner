export type MealResponseDto = {
  id: number
  name: string
  recipeInstructions: string | null
  isDraft: boolean
  ingredients: string[]
}

export type CreateMealDto = {
  name: string
  recipeInstructions?: string | null
  ingredients?: string[]
}

export type UpdateMealDto = CreateMealDto
