import Dexie, { type EntityTable } from 'dexie'
import type { FinancialItem, BonusScheme, AppSetting, WarehouseBatch, WarehouseItem, StockLevel, StockTransaction } from './schema'

// Define the database class
export class FinancialDashboardDB extends Dexie {
  // Define table types
  financialItems!: EntityTable<FinancialItem, 'id'>
  bonusSchemes!: EntityTable<BonusScheme, 'id'>
  appSettings!: EntityTable<AppSetting, 'id'>
  warehouseBatches!: EntityTable<WarehouseBatch, 'id'>
  warehouseItems!: EntityTable<WarehouseItem, 'id'>
  stockLevels!: EntityTable<StockLevel, 'id'>
  stockTransactions!: EntityTable<StockTransaction, 'id'>

  constructor() {
    super('FinancialDashboardDB')

    // Define schemas - Version 1 (original)
    this.version(1).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt'
    })

    // Version 2 - Add COGS calculation fields
    this.version(2).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt'
    }).upgrade(tx => {
      // Migrate existing VARIABLE_COGS items with realistic base values
      return tx.table('financialItems').toCollection().modify((item: any) => {
        if (item.category === 'variable_cogs') {
          // Set realistic base values based on current cost per cup
          switch (item.name) {
            case 'Milk (100ml)':
              item.baseUnitCost = 20000 // 20,000 IDR per liter
              item.baseUnitQuantity = 1000 // 1000 ml
              item.usagePerCup = 100 // 100 ml per cup
              item.unit = 'ml'
              break
            case 'Coffee Beans (5g)':
              item.baseUnitCost = 200000 // 200,000 IDR per kg
              item.baseUnitQuantity = 1000 // 1000 g
              item.usagePerCup = 5 // 5 g per cup
              item.unit = 'g'
              break
            case 'Palm Sugar (10ml)':
              item.baseUnitCost = 48500 // 48,500 IDR per liter
              item.baseUnitQuantity = 1000 // 1000 ml
              item.usagePerCup = 10 // 10 ml per cup
              item.unit = 'ml'
              break
            case 'Cup + Lid':
              item.baseUnitCost = 850 // 850 IDR per piece
              item.baseUnitQuantity = 1 // 1 piece
              item.usagePerCup = 1 // 1 piece per cup
              item.unit = 'piece'
              break
            case 'Ice Cubes (100g)':
              item.baseUnitCost = 2920 // 2,920 IDR per kg
              item.baseUnitQuantity = 1000 // 1000 g
              item.usagePerCup = 100 // 100 g per cup
              item.unit = 'g'
              break
            default:
              // Default values for any other items
              item.baseUnitCost = item.value // Use current value as base cost
              item.baseUnitQuantity = 1 // Default to 1 unit
              item.usagePerCup = 1 // Default to 1 unit per cup
              item.unit = 'unit' // Default unit
          }
        }
      })
    })

    // Version 3 - Add fixed asset management fields
    this.version(3).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt'
    }).upgrade(tx => {
      // Initialize fixed asset fields for existing items
      return tx.table('financialItems').toCollection().modify((item: any) => {
        // Set default values for new fields
        item.isFixedAsset = false
        item.estimatedUsefulLifeYears = null
        item.sourceAssetId = null

        // Mark existing depreciation entries with sourceAssetId if we can identify them
        if (item.category === 'fixed_costs' && item.name.toLowerCase().includes('depreciation')) {
          // This is likely a depreciation entry, but we can't automatically link it
          // Users will need to recreate the relationship through the UI
        }
      })
    })

    // Version 4 - Add warehouse management tables
    this.version(4).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt'
    })

    // Version 5 - Add stock management tables
    this.version(5).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, &[ingredientName+unit], ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, transactionDate, createdAt, updatedAt'
    })
  }
}

// Create database instance
export const db = new FinancialDashboardDB()

// Initialize database
export async function initializeDatabase() {
  try {
    // Open the database
    await db.open()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Close database connection
export function closeDatabase() {
  db.close()
}

// Export database instance
export { db as default }
