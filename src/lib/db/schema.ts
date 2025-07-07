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

export interface WarehouseBatch {
  id: string
  batchNumber: number // Auto-incrementing starting at 1
  dateAdded: string // ISO date string
  note: string
  createdAt: string
  updatedAt: string
}

export interface WarehouseItem {
  id: string
  batchId: string // Foreign key to WarehouseBatch
  ingredientName: string
  quantity: number
  unit: string
  costPerUnit: number // Cost per unit (e.g., cost per ml, cost per gram)
  totalCost: number // Total cost for this ingredient
  note: string
  createdAt: string
  updatedAt: string
}

export interface StockLevel {
  id: string
  ingredientName: string
  unit: string
  currentStock: number // Current available stock
  reservedStock: number // Stock reserved for pending orders
  lowStockThreshold: number // Alert when stock falls below this level
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

export interface StockTransaction {
  id: string
  ingredientName: string
  unit: string
  transactionType: 'ADD' | 'DEDUCT' | 'ADJUST' | 'RESERVE' | 'UNRESERVE' | 'PRODUCTION_COMPLETE' // Type of stock transaction
  quantity: number // Positive for ADD/RESERVE, negative for DEDUCT/UNRESERVE
  reason: string // Reason for the transaction (e.g., "Sale", "Warehouse addition", "Manual adjustment", "Order reservation")
  batchId?: string // Optional reference to warehouse batch
  reservationId?: string // Optional reference to reservation for RESERVE/UNRESERVE transactions
  reservationPurpose?: string // Purpose of reservation (e.g., "Manual Reservation", "Production Batch #5")
  productionBatchId?: string // Optional reference to production batch
  transactionDate: string
  createdAt: string
  updatedAt: string
}

export interface ProductionBatch {
  id: string
  batchNumber: number // Auto-incrementing starting at 1
  dateCreated: string // ISO date string
  status: 'Pending' | 'In Progress' | 'Completed' // Production batch status
  note: string
  createdAt: string
  updatedAt: string
}

export interface ProductionItem {
  id: string
  productionBatchId: string // Foreign key to ProductionBatch
  ingredientName: string
  quantity: number
  unit: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  note: string
  isActive: boolean // For soft deletion
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  name: string
  baseUnitCost: number // Cost of base unit (e.g., 20000 IDR per liter)
  baseUnitQuantity: number // Quantity of base unit (e.g., 1000 ml)
  unit: string // Unit of measurement (e.g., "ml", "g", "piece")
  supplierInfo?: string // Optional supplier information
  category?: string // Optional ingredient category
  note: string
  isActive: boolean // For soft deletion
  createdAt: string
  updatedAt: string
}

export interface ProductIngredient {
  id: string
  productId: string // Foreign key to Product
  ingredientId: string // Foreign key to Ingredient
  usagePerCup: number // Usage amount per cup (e.g., 100 ml)
  note: string
  createdAt: string
  updatedAt: string
}

export interface IngredientCategory {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

// Type aliases for new entities (same as the main types for Dexie)
export type NewFinancialItem = Omit<FinancialItem, 'createdAt' | 'updatedAt'>
export type NewBonusScheme = Omit<BonusScheme, 'id' | 'createdAt' | 'updatedAt'>
export type NewAppSetting = Omit<AppSetting, 'id' | 'createdAt' | 'updatedAt'>
export type NewWarehouseBatch = Omit<WarehouseBatch, 'createdAt' | 'updatedAt'>
export type NewWarehouseItem = Omit<WarehouseItem, 'createdAt' | 'updatedAt'>
export type NewStockLevel = Omit<StockLevel, 'createdAt' | 'updatedAt'>
export type NewStockTransaction = Omit<StockTransaction, 'createdAt' | 'updatedAt'>
export type NewProductionBatch = Omit<ProductionBatch, 'createdAt' | 'updatedAt'>
export type NewProductionItem = Omit<ProductionItem, 'createdAt' | 'updatedAt'>
export type NewProduct = Omit<Product, 'createdAt' | 'updatedAt'>
export type NewIngredient = Omit<Ingredient, 'createdAt' | 'updatedAt'>
export type NewProductIngredient = Omit<ProductIngredient, 'createdAt' | 'updatedAt'>
export type NewIngredientCategory = Omit<IngredientCategory, 'createdAt' | 'updatedAt'>

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

// Production batch status enum
export const PRODUCTION_BATCH_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const

export type ProductionBatchStatus = typeof PRODUCTION_BATCH_STATUS[keyof typeof PRODUCTION_BATCH_STATUS]

// Helper type for production batch with items
export interface ProductionBatchWithItems extends ProductionBatch {
  items: ProductionItem[]
}

// Helper type for product with ingredients
export interface ProductWithIngredients extends Product {
  ingredients: (ProductIngredient & { ingredient: Ingredient })[]
}

// Helper type for ingredient with usage info
export interface IngredientWithUsage extends Ingredient {
  usageInProducts: (ProductIngredient & { product: Product })[]
}
