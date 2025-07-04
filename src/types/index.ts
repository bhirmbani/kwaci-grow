export interface FinancialItem {
  id: string
  name: string
  value: number
  note?: string
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