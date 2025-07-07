import Dexie, { type EntityTable } from 'dexie'
import type { FinancialItem, BonusScheme, AppSetting, WarehouseBatch, WarehouseItem, StockLevel, StockTransaction, ProductionBatch, ProductionItem, Product, Ingredient, ProductIngredient, IngredientCategory, Menu, MenuProduct, Branch, MenuBranch, DailySalesTarget } from './schema'

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
  productionBatches!: EntityTable<ProductionBatch, 'id'>
  productionItems!: EntityTable<ProductionItem, 'id'>
  products!: EntityTable<Product, 'id'>
  ingredients!: EntityTable<Ingredient, 'id'>
  productIngredients!: EntityTable<ProductIngredient, 'id'>
  ingredientCategories!: EntityTable<IngredientCategory, 'id'>
  menus!: EntityTable<Menu, 'id'>
  menuProducts!: EntityTable<MenuProduct, 'id'>
  branches!: EntityTable<Branch, 'id'>
  menuBranches!: EntityTable<MenuBranch, 'id'>
  dailySalesTargets!: EntityTable<DailySalesTarget, 'id'>

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
      return tx.table('financialItems').toCollection().modify((item: FinancialItem) => {
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
      return tx.table('financialItems').toCollection().modify((item: FinancialItem) => {
        // Set default values for new fields
        item.isFixedAsset = false
        item.estimatedUsefulLifeYears = undefined
        item.sourceAssetId = undefined

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

    // Version 6 - Add production management tables and extend stock transactions
    this.version(6).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, &[ingredientName+unit], ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt'
    })

    // Version 7 - Add product management tables (fixed indexing)
    this.version(7).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, &[ingredientName+unit], ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async (tx) => {
      // Migration logic: Convert existing VARIABLE_COGS items to ingredients and create default product
      const now = new Date().toISOString()

      // Get existing VARIABLE_COGS items
      const cogsItems = await tx.table('financialItems')
        .where('category')
        .equals('variable_cogs')
        .toArray()

      if (cogsItems.length > 0) {
        console.log('Migrating VARIABLE_COGS items to new product management system...')

        // Create ingredients from existing COGS items
        const ingredients = cogsItems.map((item: FinancialItem) => ({
          id: `ingredient-${item.id}`,
          name: item.name,
          baseUnitCost: item.baseUnitCost || 0,
          baseUnitQuantity: item.baseUnitQuantity || 1,
          unit: item.unit || 'piece',
          supplierInfo: '',
          category: 'Coffee Ingredients',
          note: item.note || `Migrated from COGS item: ${item.name}`,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }))

        // Create default "Coffee" product
        const defaultProduct = {
          id: 'product-default-coffee',
          name: 'Coffee',
          description: 'Default coffee product migrated from existing COGS configuration',
          note: 'Auto-created during migration from hardcoded COGS items',
          isActive: true,
          createdAt: now,
          updatedAt: now
        }

        // Create product-ingredient relationships
        const productIngredients = cogsItems.map((item: FinancialItem) => ({
          id: `pi-${item.id}`,
          productId: defaultProduct.id,
          ingredientId: `ingredient-${item.id}`,
          usagePerCup: item.usagePerCup || 0,
          note: `Migrated from COGS item: ${item.name}`,
          createdAt: now,
          updatedAt: now
        }))

        // Insert new data
        await tx.table('ingredients').bulkAdd(ingredients)
        await tx.table('products').add(defaultProduct)
        await tx.table('productIngredients').bulkAdd(productIngredients)

        console.log(`Migration completed: Created ${ingredients.length} ingredients, 1 product, and ${productIngredients.length} product-ingredient relationships`)
      }
    })

    // Version 8 - Fix indexing issues
    this.version(8).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, &[ingredientName+unit], ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      // Clear any problematic data and recreate with proper structure
      console.log('Fixing product management data structure...')

      // Clear existing product management tables to avoid indexing issues
      await tx.table('productIngredients').clear()
      await tx.table('products').clear()
      await tx.table('ingredients').clear()

      // Re-run the migration logic
      const now = new Date().toISOString()

      // Get existing VARIABLE_COGS items
      const cogsItems = await tx.table('financialItems')
        .where('category')
        .equals('variable_cogs')
        .toArray()

      if (cogsItems.length > 0) {
        console.log('Re-migrating VARIABLE_COGS items to new product management system...')

        // Create ingredients from existing COGS items
        const ingredients = cogsItems.map((item: FinancialItem) => ({
          id: `ingredient-${item.id}`,
          name: item.name,
          baseUnitCost: item.baseUnitCost || 0,
          baseUnitQuantity: item.baseUnitQuantity || 1,
          unit: item.unit || 'piece',
          supplierInfo: '',
          category: 'Coffee Ingredients',
          note: item.note || `Migrated from COGS item: ${item.name}`,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }))

        // Create default "Coffee" product
        const defaultProduct = {
          id: 'product-default-coffee',
          name: 'Coffee',
          description: 'Default coffee product migrated from existing COGS configuration',
          note: 'Auto-created during migration from hardcoded COGS items',
          isActive: true,
          createdAt: now,
          updatedAt: now
        }

        // Create product-ingredient relationships
        const productIngredients = cogsItems.map((item: FinancialItem) => ({
          id: `pi-${item.id}`,
          productId: defaultProduct.id,
          ingredientId: `ingredient-${item.id}`,
          usagePerCup: item.usagePerCup || 0,
          note: `Migrated from COGS item: ${item.name}`,
          createdAt: now,
          updatedAt: now
        }))

        // Insert new data
        await tx.table('ingredients').bulkAdd(ingredients)
        await tx.table('products').add(defaultProduct)
        await tx.table('productIngredients').bulkAdd(productIngredients)

        console.log(`Re-migration completed: Created ${ingredients.length} ingredients, 1 product, and ${productIngredients.length} product-ingredient relationships`)
      }
    })

    // Version 9 - Fix compound index issues that cause IDBKeyRange errors
    this.version(9).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt, [ingredientName+unit]',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async () => {
      console.log('Fixing compound index syntax to prevent IDBKeyRange errors...')
      // No data migration needed, just fixing the index syntax
      // The compound index is now defined as [ingredientName+unit] instead of &[ingredientName+unit]
      // This should resolve the "Failed to execute 'bound' on 'IDBKeyRange'" errors
    })

    // Version 10 - Remove compound index entirely to fix IDBKeyRange errors
    this.version(10).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('Removing compound index from stockLevels to prevent IDBKeyRange errors...')
      // Clear and recreate stockLevels table to remove any corrupted compound index data
      await tx.table('stockLevels').clear()
      console.log('StockLevels table cleared and will use simple indexes only')
    })

    // Version 11 - Force complete database recreation to fix persistent IDBKeyRange errors
    this.version(11).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Force recreating all product management tables to fix IDBKeyRange errors...')

      // Clear all potentially problematic tables
      await tx.table('productIngredients').clear()
      await tx.table('products').clear()
      await tx.table('ingredients').clear()
      await tx.table('stockLevels').clear()

      console.log('✅ All product management tables cleared')

      // Re-run the migration logic from existing COGS items
      const now = new Date().toISOString()

      // Get existing VARIABLE_COGS items
      const cogsItems = await tx.table('financialItems')
        .where('category')
        .equals('variable_cogs')
        .toArray()

      if (cogsItems.length > 0) {
        console.log(`🔄 Re-migrating ${cogsItems.length} VARIABLE_COGS items to new product management system...`)

        // Create ingredients from existing COGS items
        const ingredients = cogsItems.map((item: FinancialItem) => ({
          id: `ingredient-${item.id}`,
          name: item.name,
          baseUnitCost: item.baseUnitCost || 0,
          baseUnitQuantity: item.baseUnitQuantity || 1,
          unit: item.unit || 'piece',
          supplierInfo: '',
          category: 'Coffee Ingredients',
          note: item.note || `Migrated from COGS item: ${item.name}`,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }))

        // Create default "Coffee" product
        const defaultProduct = {
          id: 'product-default-coffee',
          name: 'Coffee',
          description: 'Default coffee product migrated from existing COGS configuration',
          note: 'Auto-created during migration from hardcoded COGS items',
          isActive: true,
          createdAt: now,
          updatedAt: now
        }

        // Create product-ingredient relationships
        const productIngredients = cogsItems.map((item: FinancialItem) => ({
          id: `pi-${item.id}`,
          productId: defaultProduct.id,
          ingredientId: `ingredient-${item.id}`,
          usagePerCup: item.usagePerCup || 0,
          note: `Migrated from COGS item: ${item.name}`,
          createdAt: now,
          updatedAt: now
        }))

        // Insert new data
        await tx.table('ingredients').bulkAdd(ingredients)
        await tx.table('products').add(defaultProduct)
        await tx.table('productIngredients').bulkAdd(productIngredients)

        console.log(`✅ Force re-migration completed: Created ${ingredients.length} ingredients, 1 product, and ${productIngredients.length} product-ingredient relationships`)
      } else {
        console.log('ℹ️ No COGS items found to migrate')
        console.log('ℹ️ Product management tables will remain empty until data is added manually')
      }
    })

    // Version 12 - Complete database reset with fresh seeded data
    this.version(12).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Database Version 12: Complete reset with fresh seeded data...')

      // Clear ALL tables for a complete fresh start
      await tx.table('financialItems').clear()
      await tx.table('bonusSchemes').clear()
      await tx.table('appSettings').clear()
      await tx.table('warehouseBatches').clear()
      await tx.table('warehouseItems').clear()
      await tx.table('stockLevels').clear()
      await tx.table('stockTransactions').clear()
      await tx.table('productionBatches').clear()
      await tx.table('productionItems').clear()
      await tx.table('productIngredients').clear()
      await tx.table('products').clear()
      await tx.table('ingredients').clear()

      console.log('✅ All tables cleared - starting with fresh database')

      // Import and call the seeding functions
      const { seedDatabase } = await import('./seed')
      await seedDatabase()

      console.log('✅ Database reset and seeding complete')
    })

    // Version 13 - Add ingredient categories table
    this.version(13).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding ingredient categories table...')
      
      const now = new Date().toISOString()
      
      // Create default categories based on existing ingredient categories
      const existingIngredients = await tx.table('ingredients').toArray()
      const existingCategories = new Set(existingIngredients.map((ing: Ingredient) => ing.category).filter(Boolean))
      
      const defaultCategories = [
        { id: 'cat-coffee-ingredients', name: 'Coffee Ingredients', description: 'Basic coffee making ingredients' },
        { id: 'cat-dairy', name: 'Dairy', description: 'Milk and dairy products' },
        { id: 'cat-sweeteners', name: 'Sweeteners', description: 'Sugar and sweetening agents' },
        { id: 'cat-packaging', name: 'Packaging', description: 'Cups, lids, and packaging materials' },
        { id: 'cat-other', name: 'Other', description: 'Miscellaneous ingredients' }
      ]
      
      // Add existing categories that aren't in defaults
      existingCategories.forEach(catName => {
        if (!defaultCategories.some(def => def.name === catName)) {
          defaultCategories.push({
            id: `cat-${(catName || 'uncategorized').toLowerCase().replace(/\s+/g, '-')}`,
            name: catName || 'Uncategorized',
            description: `Category for ${catName}`
          })
        }
      })
      
      const categoriesToAdd = defaultCategories.map(cat => ({
        ...cat,
        createdAt: now,
        updatedAt: now
      }))
      
      await tx.table('ingredientCategories').bulkAdd(categoriesToAdd)
      
      console.log(`✅ Added ${categoriesToAdd.length} ingredient categories`)
    })

    // Version 14 - Add menu management tables
    this.version(14).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding menu management tables...')

      const now = new Date().toISOString()

      // Create default branches
      const defaultBranches = [
        {
          id: 'branch-main',
          name: 'Main Location',
          location: 'Primary coffee cart location',
          note: 'Default branch for menu assignments',
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ]

      await tx.table('branches').bulkAdd(defaultBranches)

      console.log(`✅ Added ${defaultBranches.length} default branches`)
      console.log('✅ Menu management tables created successfully')
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

      // Only check for actual IDBKeyRange DataError, not general errors
      if (error instanceof Error && error.name === 'DataError' && error.message && error.message.includes('IDBKeyRange')) {
      console.error('🚨 IDBKeyRange error detected - database corruption likely')
      console.error('💡 A database reset is required to fix this issue')

      // Provide a more helpful error message
      const helpfulError = new Error(
        'Database corruption detected (IDBKeyRange error). ' +
        'A database reset is required to fix this issue.'
      )
      helpfulError.name = 'DatabaseCorruptionError'
      throw helpfulError
    }

    throw error
  }
}

// Close database connection
export function closeDatabase() {
  db.close()
}

// Export database instance
export { db as default }
