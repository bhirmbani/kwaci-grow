import type { FinancialItem } from '@/types'
import type { ProductWithIngredients } from '@/lib/db/schema'

/**
 * Calculate cost per cup for a single ingredient
 * Formula: (baseUnitCost / baseUnitQuantity) × usagePerCup
 */
export function calculateCostPerCup(item: FinancialItem): number {
  // Return existing value if COGS calculation fields are not available
  if (!item.baseUnitCost || !item.baseUnitQuantity || !item.usagePerCup) {
    return item.value || 0
  }

  // Validate inputs
  if (item.baseUnitCost <= 0 || item.baseUnitQuantity <= 0 || item.usagePerCup < 0) {
    return 0
  }

  return Math.round((item.baseUnitCost / item.baseUnitQuantity) * item.usagePerCup)
}

/**
 * Calculate total COGS per cup from all variable COGS items
 */
export function calculateTotalCOGSPerCup(items: FinancialItem[]): number {
  return items.reduce((total, item) => {
    return total + calculateCostPerCup(item)
  }, 0)
}

/**
 * Calculate total COGS for a given number of cups
 */
export function calculateTotalCOGSForCups(items: FinancialItem[], cups: number): number {
  const cogsPerCup = calculateTotalCOGSPerCup(items)
  return cogsPerCup * cups
}

/**
 * Calculate daily COGS based on daily target
 */
export function calculateDailyCOGS(items: FinancialItem[], dailyTarget: number): number {
  return calculateTotalCOGSForCups(items, dailyTarget)
}

/**
 * Validate COGS calculation fields for an ingredient
 */
export function validateCOGSFields(item: Partial<FinancialItem>): string[] {
  const errors: string[] = []

  if (item.baseUnitCost !== undefined && item.baseUnitCost <= 0) {
    errors.push('Base unit cost must be greater than 0')
  }

  if (item.baseUnitQuantity !== undefined && item.baseUnitQuantity <= 0) {
    errors.push('Base unit quantity must be greater than 0')
  }

  if (item.usagePerCup !== undefined && item.usagePerCup < 0) {
    errors.push('Usage per cup cannot be negative')
  }

  return errors
}

/**
 * Check if an item has complete COGS calculation data
 */
export function hasCompleteCOGSData(item: FinancialItem): boolean {
  return !!(
    item.baseUnitCost &&
    item.baseUnitQuantity &&
    item.usagePerCup !== undefined &&
    item.unit
  )
}

/**
 * Update item's calculated value based on COGS parameters
 */
export function updateCalculatedValue(item: FinancialItem): FinancialItem {
  const calculatedValue = calculateCostPerCup(item)
  return {
    ...item,
    value: calculatedValue
  }
}

/**
 * Get breakdown of COGS by ingredient
 */
export interface COGSBreakdownItem {
  id: string
  name: string
  costPerCup: number
  percentage: number
  baseUnitCost?: number
  baseUnitQuantity?: number
  usagePerCup?: number
  unit?: string
}

export function getCOGSBreakdown(items: FinancialItem[]): COGSBreakdownItem[] {
  const totalCOGS = calculateTotalCOGSPerCup(items)
  
  return items.map(item => {
    const costPerCup = calculateCostPerCup(item)
    const percentage = totalCOGS > 0 ? (costPerCup / totalCOGS) * 100 : 0
    
    return {
      id: item.id,
      name: item.name,
      costPerCup,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      baseUnitCost: item.baseUnitCost,
      baseUnitQuantity: item.baseUnitQuantity,
      usagePerCup: item.usagePerCup,
      unit: item.unit
    }
  })
}

/**
 * Common unit options for ingredients
 */
export const UNIT_OPTIONS = [
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'piece', label: 'Pieces' },
  { value: 'cup', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons' },
  { value: 'tsp', label: 'Teaspoons' },
] as const

export type UnitOption = typeof UNIT_OPTIONS[number]['value']

/**
 * Product-based COGS calculation functions
 */

/**
 * Convert product with ingredients to FinancialItem format for compatibility
 */
export function convertProductToFinancialItems(product: ProductWithIngredients): FinancialItem[] {
  return product.ingredients.map(pi => ({
    id: pi.ingredient.id,
    name: pi.ingredient.name,
    value: (pi.ingredient.baseUnitCost / pi.ingredient.baseUnitQuantity) * pi.usagePerCup,
    category: 'variable_cogs' as const,
    note: pi.note || '',
    createdAt: pi.ingredient.createdAt,
    updatedAt: pi.ingredient.updatedAt,
    baseUnitCost: pi.ingredient.baseUnitCost,
    baseUnitQuantity: pi.ingredient.baseUnitQuantity,
    usagePerCup: pi.usagePerCup,
    unit: pi.ingredient.unit
  }))
}

/**
 * Calculate total COGS per cup for a product
 */
export function calculateProductCOGSPerCup(product: ProductWithIngredients): number {
  return product.ingredients.reduce((total, pi) => {
    const ingredient = pi.ingredient

    // Add null checks for ingredient and its properties
    if (!ingredient || !ingredient.baseUnitCost || !ingredient.baseUnitQuantity || ingredient.baseUnitQuantity === 0) {
      // Only warn if ingredient is completely missing, not just missing cost data
      if (!ingredient) {
        console.warn('Missing ingredient record for product ingredient:', pi)
      }
      return total
    }

    const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
    return total + costPerCup
  }, 0)
}

/**
 * Calculate ingredient quantities needed for a product
 */
export function calculateProductIngredientQuantities(product: ProductWithIngredients, dailyTarget: number): IngredientQuantity[] {
  return product.ingredients
    .filter(pi => pi.usagePerCup > 0)
    .map(pi => {
      const ingredient = pi.ingredient
      const totalNeeded = pi.usagePerCup * dailyTarget
      const formattedQuantity = getFormattedQuantity(totalNeeded, ingredient.unit)

      return {
        id: ingredient.id,
        name: ingredient.name,
        usagePerCup: pi.usagePerCup,
        unit: ingredient.unit,
        totalNeeded,
        formattedQuantity
      }
    })
}

/**
 * Generate shopping list for a product
 */
export function generateProductShoppingList(product: ProductWithIngredients, dailyTarget: number): ShoppingListSummary {
  const shoppingItems = product.ingredients
    .filter(pi => pi.usagePerCup > 0)
    .map(pi => {
      const ingredient = pi.ingredient
      const totalNeeded = pi.usagePerCup * dailyTarget
      const unitCost = ingredient.baseUnitCost / ingredient.baseUnitQuantity
      const totalCost = totalNeeded * unitCost
      const formattedQuantity = getFormattedQuantity(totalNeeded, ingredient.unit)

      return {
        id: ingredient.id,
        name: ingredient.name,
        totalNeeded,
        formattedQuantity,
        unit: ingredient.unit,
        unitCost,
        totalCost,
        baseUnitQuantity: ingredient.baseUnitQuantity
      }
    })

  const totalCost = shoppingItems.reduce((sum, item) => sum + item.totalCost, 0)

  return {
    items: shoppingItems,
    totalCost,
    dailyTarget
  }
}

/**
 * Calculate total quantity needed for daily target
 */
export function calculateTotalQuantityNeeded(item: FinancialItem, dailyTarget: number): number {
  if ((item.usagePerCup === undefined || item.usagePerCup === null) || dailyTarget <= 0) {
    return 0
  }
  return item.usagePerCup * dailyTarget
}

/**
 * Unit conversion utilities
 */
export interface UnitConversion {
  value: number
  unit: string
  displayText: string
}

export function convertToLargerUnit(quantity: number, unit: string): UnitConversion {
  // Handle null, undefined, or empty unit
  if (!unit || unit.trim() === '') {
    return {
      value: quantity,
      unit: 'unit',
      displayText: `${quantity.toLocaleString()} unit`
    }
  }

  const conversions: Record<string, { threshold: number; targetUnit: string; factor: number }> = {
    'ml': { threshold: 1000, targetUnit: 'l', factor: 1000 },
    'g': { threshold: 1000, targetUnit: 'kg', factor: 1000 },
    'tsp': { threshold: 3, targetUnit: 'tbsp', factor: 3 },
    'tbsp': { threshold: 16, targetUnit: 'cup', factor: 16 },
  }

  const conversion = conversions[unit.toLowerCase()]

  if (conversion && quantity >= conversion.threshold) {
    const convertedValue = quantity / conversion.factor
    const roundedValue = Math.round(convertedValue * 100) / 100 // Round to 2 decimal places

    return {
      value: roundedValue,
      unit: conversion.targetUnit,
      displayText: `${quantity.toLocaleString()} ${unit} (${roundedValue.toLocaleString()} ${conversion.targetUnit})`
    }
  }

  return {
    value: quantity,
    unit: unit,
    displayText: `${quantity.toLocaleString()} ${unit}`
  }
}

/**
 * Get formatted quantity display with unit conversion
 */
export function getFormattedQuantity(quantity: number, unit: string): string {
  // Handle edge cases
  if (quantity < 0) {
    return '0 unit'
  }

  if (!unit || unit.trim() === '') {
    return `${quantity.toLocaleString()} unit`
  }

  const conversion = convertToLargerUnit(quantity, unit)
  return conversion.displayText
}

/**
 * Calculate ingredient quantities for daily target
 */
export interface IngredientQuantity {
  id: string
  name: string
  usagePerCup: number
  unit: string
  totalNeeded: number
  formattedQuantity: string
}

export function calculateIngredientQuantities(items: FinancialItem[], dailyTarget: number): IngredientQuantity[] {
  return items
    .filter(item => {
      // More robust filtering for items that should show Total Needed
      const hasValidUsage = (item.usagePerCup !== undefined && item.usagePerCup !== null && item.usagePerCup >= 0);
      const hasValidUnit = (item.unit && item.unit.trim() !== '');
      return hasValidUsage && hasValidUnit;
    })
    .map(item => {
      const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget)
      const formattedQuantity = getFormattedQuantity(totalNeeded, item.unit!)

      return {
        id: item.id,
        name: item.name,
        usagePerCup: item.usagePerCup!,
        unit: item.unit!,
        totalNeeded,
        formattedQuantity
      }
    })
}

/**
 * Shopping List Calculation Functions
 */

export interface ShoppingListItem {
  id: string
  name: string
  totalNeeded: number
  formattedQuantity: string
  unit: string
  unitCost: number // Cost per base unit
  totalCost: number // Total cost for this ingredient
  baseUnitQuantity: number
}

export interface ShoppingListSummary {
  items: ShoppingListItem[]
  grandTotal: number
  totalItems: number
}

/**
 * Calculate unit cost (cost per base unit) for an ingredient
 */
export function calculateUnitCost(item: FinancialItem): number {
  if (!item.baseUnitCost || !item.baseUnitQuantity || item.baseUnitQuantity <= 0) {
    return 0
  }
  return item.baseUnitCost / item.baseUnitQuantity
}

/**
 * Calculate total cost for purchasing an ingredient for daily target
 */
export function calculateIngredientTotalCost(item: FinancialItem, dailyTarget: number): number {
  const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget)
  const unitCost = calculateUnitCost(item)
  return totalNeeded * unitCost
}

/**
 * Generate shopping list with costs for all ingredients
 */
export function generateShoppingList(items: FinancialItem[], dailyTarget: number): ShoppingListSummary {
  const shoppingItems = items
    .filter(item => hasCompleteCOGSData(item) && item.usagePerCup! > 0) // Only items with complete data and actual usage
    .map(item => {
      const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget)
      const unitCost = calculateUnitCost(item)
      const totalCost = calculateIngredientTotalCost(item, dailyTarget)
      const formattedQuantity = getFormattedQuantity(totalNeeded, item.unit!)

      return {
        id: item.id,
        name: item.name,
        totalNeeded,
        formattedQuantity,
        unit: item.unit!,
        unitCost,
        totalCost,
        baseUnitQuantity: item.baseUnitQuantity!
      }
    })
    .sort((a, b) => b.totalCost - a.totalCost) // Sort by total cost descending

  const grandTotal = shoppingItems.reduce((sum, item) => sum + item.totalCost, 0)

  return {
    items: shoppingItems,
    grandTotal,
    totalItems: shoppingItems.length
  }
}
