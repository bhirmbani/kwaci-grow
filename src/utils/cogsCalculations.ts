import type { FinancialItem } from '@/types'

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
 * Calculate total quantity needed for daily target
 */
export function calculateTotalQuantityNeeded(item: FinancialItem, dailyTarget: number): number {
  if (!item.usagePerCup || dailyTarget <= 0) {
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
  const conversions: Record<string, { threshold: number; targetUnit: string; factor: number }> = {
    'ml': { threshold: 1000, targetUnit: 'l', factor: 1000 },
    'g': { threshold: 1000, targetUnit: 'kg', factor: 1000 },
    'tsp': { threshold: 3, targetUnit: 'tbsp', factor: 3 },
    'tbsp': { threshold: 16, targetUnit: 'cup', factor: 16 },
  }

  const conversion = conversions[unit]

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
    .filter(item => item.usagePerCup && item.unit) // Only include items with complete data
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
