export interface FinancialItem {
  id: string
  name: string
  value: number
  note?: string
  // COGS calculation fields (optional, used for VARIABLE_COGS category)
  baseUnitCost?: number // Cost of base unit (e.g., 20000 IDR per liter)
  baseUnitQuantity?: number // Quantity of base unit (e.g., 1000 ml)
  usagePerCup?: number // Usage amount per cup (e.g., 100 ml)
  unit?: string // Unit of measurement (e.g., "ml", "g", "piece")
}

export interface BonusScheme {
  target: number
  perCup: number
  baristaCount: number
  note?: string
}

export interface ProjectionRow {
  cupsPerDay: number
  revenue: number
  variableCogs: number
  grossProfit: number
  fixedCosts: number
  bonus: number
  netProfit: number
}