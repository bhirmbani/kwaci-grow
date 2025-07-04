// TypeScript interfaces for database entities
export interface FinancialItem {
  id: string
  name: string
  value: number // Store in smallest currency unit (IDR) - calculated cost per cup for VARIABLE_COGS
  category: FinancialItemCategory
  note: string
  createdAt: string
  updatedAt: string
  // COGS calculation fields (optional, used for VARIABLE_COGS category)
  baseUnitCost?: number // Cost of base unit (e.g., 20000 IDR per liter)
  baseUnitQuantity?: number // Quantity of base unit (e.g., 1000 ml)
  usagePerCup?: number // Usage amount per cup (e.g., 100 ml)
  unit?: string // Unit of measurement (e.g., "ml", "g", "piece")
  // Fixed asset management fields (optional, used for INITIAL_CAPITAL category)
  isFixedAsset?: boolean // Whether this item is a fixed asset requiring depreciation
  estimatedUsefulLifeYears?: number // Useful life in years for depreciation calculation
  sourceAssetId?: string // For depreciation entries, references the source fixed asset ID
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
  DAILY_TARGET_CUPS: 'daily_target_cups',
} as const

export type AppSettingKey = typeof APP_SETTING_KEYS[keyof typeof APP_SETTING_KEYS]
