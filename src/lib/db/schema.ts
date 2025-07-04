// TypeScript interfaces for database entities
export interface FinancialItem {
  id: string
  name: string
  value: number // Store in smallest currency unit (IDR)
  category: FinancialItemCategory
  note: string
  createdAt: string
  updatedAt: string
}

export interface BonusScheme {
  id?: number
  target: number // Target cups per month
  perCup: number // Bonus amount per cup above target (IDR)
  baristaCount: number // Number of baristas
  note: string
  createdAt: string
  updatedAt: string
}

export interface AppSetting {
  id?: number
  key: AppSettingKey
  value: string // Store as string, parse as needed
  createdAt: string
  updatedAt: string
}

// Type aliases for new entities (same as the main types for Dexie)
export type NewFinancialItem = Omit<FinancialItem, 'createdAt' | 'updatedAt'>
export type NewBonusScheme = Omit<BonusScheme, 'id' | 'createdAt' | 'updatedAt'>
export type NewAppSetting = Omit<AppSetting, 'id' | 'createdAt' | 'updatedAt'>

// Category enum for financial items
export const FINANCIAL_ITEM_CATEGORIES = {
  INITIAL_CAPITAL: 'initial_capital',
  FIXED_COSTS: 'fixed_costs',
  VARIABLE_COGS: 'variable_cogs',
} as const

export type FinancialItemCategory = typeof FINANCIAL_ITEM_CATEGORIES[keyof typeof FINANCIAL_ITEM_CATEGORIES]

// App setting keys
export const APP_SETTING_KEYS = {
  DAYS_PER_MONTH: 'days_per_month',
  PRICE_PER_CUP: 'price_per_cup',
} as const

export type AppSettingKey = typeof APP_SETTING_KEYS[keyof typeof APP_SETTING_KEYS]
