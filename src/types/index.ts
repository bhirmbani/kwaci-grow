export interface FinancialItem {
  id: string
  name: string
  value: number
}

export interface BonusScheme {
  target: number
  perCup: number
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