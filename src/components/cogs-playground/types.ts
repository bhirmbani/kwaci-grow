// Types for COGS Playground temporary data structures

export interface TempIngredient {
  id: string // temporary ID for React keys
  name: string
  baseUnitCost: number
  baseUnitQuantity: number
  unit: string
  supplierInfo?: string
  category?: string
  note: string
  isActive: boolean
}

export interface TempProductIngredient {
  ingredientId: string // references TempIngredient.id
  usagePerCup: number
  note: string
}

export interface TempProduct {
  id: string // temporary ID for React keys
  name: string
  description: string
  note: string
  isActive: boolean
  ingredients: TempProductIngredient[]
}

export interface COGSPlaygroundState {
  ingredients: TempIngredient[]
  products: TempProduct[]
}

// Helper function to generate temporary IDs
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Convert temp ingredient to FinancialItem for COGS calculations
export function tempIngredientToFinancialItem(ingredient: TempIngredient, usagePerCup: number): import('@/types').FinancialItem {
  return {
    id: ingredient.id,
    name: ingredient.name,
    value: 0, // Will be calculated
    category: 'VARIABLE_COGS' as const,
    note: ingredient.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    baseUnitCost: ingredient.baseUnitCost,
    baseUnitQuantity: ingredient.baseUnitQuantity,
    usagePerCup: usagePerCup,
    unit: ingredient.unit
  }
}
