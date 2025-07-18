// TypeScript interfaces for database entities

// Business entity for multi-business support
export interface Business {
  id: string
  name: string
  description?: string
  note: string
  currency: string // Currency code (e.g., 'IDR', 'THB', 'SGD')
  logo?: string // Emoji character for business logo (e.g., '☕', '🥐', '🧃')
  createdAt: string
  updatedAt: string
}

export interface FinancialItem {
  id: string
  name: string
  value: number // Store in smallest currency unit (IDR) - calculated cost per cup for VARIABLE_COGS
  category: FinancialItemCategory
  note: string
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface ProductionBatch {
  id: string
  batchNumber: number // Auto-incrementing starting at 1
  dateCreated: string // ISO date string
  status: 'Pending' | 'In Progress' | 'Completed' // Production batch status
  note: string
  businessId: string // Foreign key to Business
  // Production output tracking (set when batch is completed)
  productName?: string // Name of the product being produced (e.g., "Espresso")
  outputQuantity?: number // Quantity produced (e.g., 10)
  outputUnit?: string // Unit of output (e.g., "cups")
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
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  note: string
  businessId: string // Foreign key to Business
  isActive: boolean // For soft deletion
  cogsPerCup?: number // Cost of goods sold per cup (calculated)
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
  businessId: string // Foreign key to Business
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
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface IngredientCategory {
  id: string
  name: string
  description?: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

// Menu Management Interfaces
export interface Menu {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface MenuProduct {
  id: string
  menuId: string // Foreign key to Menu
  productId: string // Foreign key to Product
  price: number // Price for this product in this menu (in IDR)
  category: string // e.g., 'Coffee', 'Tea', 'Pastry'
  displayOrder: number // For sorting products in menu
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  name: string
  location: string
  note: string
  businessId: string // Foreign key to Business
  isActive: boolean
  businessHoursStart: string // Business start time in HH:MM format (e.g., "06:00")
  businessHoursEnd: string // Business end time in HH:MM format (e.g., "22:00")
  createdAt: string
  updatedAt: string
}

export interface MenuBranch {
  id: string
  menuId: string // Foreign key to Menu
  branchId: string // Foreign key to Branch
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface DailySalesTarget {
  id: string
  menuId: string // Foreign key to Menu
  branchId: string // Foreign key to Branch
  targetDate: string // YYYY-MM-DD format
  targetAmount: number // Target sales amount in IDR
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface DailyProductSalesTarget {
  id: string
  menuId: string // Foreign key to Menu
  productId: string // Foreign key to Product
  branchId: string // Foreign key to Branch
  targetDate: string // YYYY-MM-DD format
  targetQuantity: number // Target quantity to sell
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface SalesRecord {
  id: string
  menuId: string // Foreign key to Menu
  productId: string // Foreign key to Product
  branchId: string // Foreign key to Branch
  saleDate: string // YYYY-MM-DD format
  saleTime: string // HH:MM:SS format
  quantity: number // Actual quantity sold
  unitPrice: number // Price per unit in IDR
  totalAmount: number // quantity * unitPrice
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface ProductTargetDefault {
  id: string
  productId: string // Foreign key to Product
  defaultTargetQuantityPerDay: number // Default target quantity per day
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface JourneyProgress {
  id: string
  stepId: string // Journey step identifier (e.g., "create-ingredient", "create-product")
  completed: boolean
  completedAt?: string // ISO date string when step was completed
  userId?: string // For future multi-user support
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

// Extended types for UI components
export interface MenuWithProducts extends Menu {
  products: (MenuProduct & { product: Product })[]
  productCount: number
  branches: Branch[]
}

export interface MenuWithProductCount extends Menu {
  productCount: number
  branchCount: number
}

export interface BranchWithMenus extends Branch {
  menus: Menu[]
  menuCount: number
}

export interface DailyProductSalesTargetWithDetails extends DailyProductSalesTarget {
  menu: Menu
  product: Product
  branch: Branch
}

export interface SalesRecordWithDetails extends SalesRecord {
  menu: Menu
  product: Product
  branch: Branch
}

export interface MenuWithProductTargets extends Menu {
  products: (MenuProduct & {
    product: Product
    target?: DailyProductSalesTarget
  })[]
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
export type NewProduct = Omit<Product, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type NewIngredient = Omit<Ingredient, 'createdAt' | 'updatedAt'>
export type NewProductIngredient = Omit<ProductIngredient, 'createdAt' | 'updatedAt'>
export type NewIngredientCategory = Omit<IngredientCategory, 'createdAt' | 'updatedAt'>
export type NewMenu = Omit<Menu, 'createdAt' | 'updatedAt'>
export type NewMenuProduct = Omit<MenuProduct, 'createdAt' | 'updatedAt'>
export type NewBranch = Omit<Branch, 'createdAt' | 'updatedAt'>
export type NewMenuBranch = Omit<MenuBranch, 'createdAt' | 'updatedAt'>
export type NewDailySalesTarget = Omit<DailySalesTarget, 'createdAt' | 'updatedAt'>
export type NewDailyProductSalesTarget = Omit<DailyProductSalesTarget, 'createdAt' | 'updatedAt'>
export type NewSalesRecord = Omit<SalesRecord, 'createdAt' | 'updatedAt'>
export type NewRecurringExpense = Omit<RecurringExpense, 'createdAt' | 'updatedAt'>

// Fixed Assets Management Schema
export interface FixedAsset {
  id: string
  name: string
  categoryId: string // Foreign key to AssetCategory
  purchaseDate: string // ISO date string
  purchaseCost: number // Cost in IDR
  depreciationMonths: number // Depreciation period in months
  currentValue: number // Calculated current value
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface AssetCategory {
  id: string
  name: string
  description?: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export type NewFixedAsset = Omit<FixedAsset, 'createdAt' | 'updatedAt' | 'currentValue'>
export type NewAssetCategory = Omit<AssetCategory, 'createdAt' | 'updatedAt'>

// Recurring Expenses Management Schema
export interface RecurringExpense {
  id: string
  name: string
  description?: string
  amount: number // Amount in IDR
  frequency: 'monthly' | 'yearly'
  category: string
  startDate: string // ISO date string
  endDate?: string // ISO date string, optional for expenses with known end dates
  note: string
  businessId: string // Foreign key to Business
  isActive: boolean // For soft deletion
  createdAt: string
  updatedAt: string
}

// Employee Management Schema
export interface Employee {
  id: string
  businessId: string // Foreign key to Business
  name: string
  companyIdNumber: string // Employee ID within company
  nationalIdNumber?: string // Government ID number
  dateOfBirth?: string // YYYY-MM-DD format
  position: string // Job title
  department: string
  jobLevel?: string // e.g., "Junior", "Senior", "Manager"
  salary?: number // Salary in IDR
  phone?: string
  email?: string
  hireDate: string // YYYY-MM-DD format
  employmentStatus: 'Active' | 'Inactive' | 'Terminated'
  note: string
  createdAt: string
  updatedAt: string
}

export interface EmployeePocAssignment {
  id: string
  businessId: string // Foreign key to Business
  employeeId: string // Foreign key to Employee
  branchId: string // Foreign key to Branch
  assignedDate: string // YYYY-MM-DD format
  isActive: boolean
  note: string
  createdAt: string
  updatedAt: string
}

// Extended types for Employee management
export interface EmployeeWithPocAssignments extends Employee {
  pocAssignments: (EmployeePocAssignment & { branch: Branch })[]
  pocAssignmentCount: number
}

export interface EmployeePocAssignmentWithDetails extends EmployeePocAssignment {
  employee: Employee
  branch: Branch
}

// Re-export planning schema types
export * from './planningSchema'
export type NewProductTargetDefault = Omit<ProductTargetDefault, 'createdAt' | 'updatedAt'>
export type NewJourneyProgress = Omit<JourneyProgress, 'createdAt' | 'updatedAt'>
export type NewEmployee = Omit<Employee, 'createdAt' | 'updatedAt'>
export type NewEmployeePocAssignment = Omit<EmployeePocAssignment, 'createdAt' | 'updatedAt'>

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
  ingredients: (ProductIngredient & { ingredient: Ingredient | null })[]
}

// Helper type for ingredient with usage info
export interface IngredientWithUsage extends Ingredient {
  usageInProducts: (ProductIngredient & { product: Product })[]
}
