import Dexie, { type EntityTable } from 'dexie'
import type { Business, FinancialItem, BonusScheme, AppSetting, WarehouseBatch, WarehouseItem, StockLevel, StockTransaction, ProductionBatch, ProductionItem, Product, Ingredient, ProductIngredient, IngredientCategory, Menu, MenuProduct, Branch, MenuBranch, DailySalesTarget, DailyProductSalesTarget, SalesRecord, ProductTargetDefault, JourneyProgress, OperationalPlan, PlanGoal, PlanTask, PlanMetric, PlanTemplate, PlanGoalTemplate, PlanTaskTemplate, PlanMetricTemplate, RecurringExpense, FixedAsset, AssetCategory } from './schema'

// Define the database class
export class FinancialDashboardDB extends Dexie {
  // Define table types
  businesses!: EntityTable<Business, 'id'>
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
  dailyProductSalesTargets!: EntityTable<DailyProductSalesTarget, 'id'>
  salesRecords!: EntityTable<SalesRecord, 'id'>
  journeyProgress!: EntityTable<JourneyProgress, 'id'>

  // Planning tables
  operationalPlans!: EntityTable<OperationalPlan, 'id'>
  planGoals!: EntityTable<PlanGoal, 'id'>
  planTasks!: EntityTable<PlanTask, 'id'>
  planMetrics!: EntityTable<PlanMetric, 'id'>
  planTemplates!: EntityTable<PlanTemplate, 'id'>
  planGoalTemplates!: EntityTable<PlanGoalTemplate, 'id'>
  planTaskTemplates!: EntityTable<PlanTaskTemplate, 'id'>
  planMetricTemplates!: EntityTable<PlanMetricTemplate, 'id'>
  productTargetDefaults!: EntityTable<ProductTargetDefault, 'id'>

  // Recurring expenses table
  recurringExpenses!: EntityTable<RecurringExpense, 'id'>

  // Fixed assets management tables
  fixedAssets!: EntityTable<FixedAsset, 'id'>
  assetCategories!: EntityTable<AssetCategory, 'id'>

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

    // Version 15 - Add daily product sales targets table
    this.version(15).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding daily product sales targets table...')
      console.log('✅ Daily product sales targets table created successfully')
    })

    // Version 16 - Add fixed assets management tables
    this.version(16).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding fixed assets management tables...')

      // Create default asset categories
      const defaultCategories = [
        { id: 'cat-equipment', name: 'Equipment', description: 'Coffee machines, grinders, and other equipment' },
        { id: 'cat-furniture', name: 'Furniture', description: 'Tables, chairs, and other furniture' },
        { id: 'cat-technology', name: 'Technology', description: 'POS systems, computers, and technology' },
        { id: 'cat-kitchen', name: 'Kitchen Equipment', description: 'Kitchen appliances and tools' },
        { id: 'cat-improvements', name: 'Building Improvements', description: 'Renovations and building improvements' },
        { id: 'cat-vehicles', name: 'Vehicles', description: 'Delivery vehicles and transportation' }
      ]

      const now = new Date().toISOString()
      for (const category of defaultCategories) {
        await tx.table('assetCategories').put({
          ...category,
          createdAt: now,
          updatedAt: now
        })
      }

      console.log('✅ Fixed assets management tables created successfully')
    })

    // Version 11: Add sales records table for operations tracking
    this.version(11).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientId, quantity, unit, expiryDate, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientId, currentStock, unit, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientId, transactionType, quantity, unit, reference, note, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, status, targetDate, note, createdAt, updatedAt',
      productionItems: 'id, batchId, ingredientId, allocatedQuantity, consumedQuantity, unit, purpose, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding sales records table for operations tracking...')
      console.log('✅ Sales records table created successfully')
    })

    // Version 16 - Add product target defaults table
    this.version(16).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, cogsPerCup, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding product target defaults table...')
      console.log('✅ Product target defaults table created successfully')
    })

    // Version 17 - Add production output tracking and journey progress
    this.version(17).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, cogsPerCup, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding production output tracking and journey progress...')
      console.log('✅ Production output tracking and journey progress added successfully')
    })

    // Version 18 - Add planning tables for operational planning features
    this.version(18).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, cogsPerCup, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      operationalPlans: 'id, name, type, status, startDate, endDate, branchId, templateId, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, completed, dueDate, note, createdAt, updatedAt',
      planTasks: 'id, planId, title, category, priority, status, assignedTo, dueDate, completedAt, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastUpdated, note, createdAt, updatedAt',
      planTemplates: 'id, name, description, type, category, isDefault, estimatedDuration, difficulty, tags, note, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note'
    }).upgrade(async tx => {
      console.log('🔄 Adding planning tables for operational planning features...')
      console.log('✅ Planning tables created successfully')
    })

    // Version 19 - Fix planning template schema to include missing fields
    this.version(19).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, cogsPerCup, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      operationalPlans: 'id, name, type, status, startDate, endDate, branchId, templateId, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, completed, dueDate, note, createdAt, updatedAt',
      planTasks: 'id, planId, title, category, priority, status, assignedTo, dueDate, completedAt, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastUpdated, note, createdAt, updatedAt',
      planTemplates: 'id, name, description, type, category, isDefault, estimatedDuration, difficulty, tags, note, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note'
    }).upgrade(async tx => {
      console.log('🔄 Fixing planning template schema to include missing fields...')
      console.log('✅ Planning template schema fixed successfully')
    })

    // Version 20 - Add taskType field to planTasks for internal linking
    this.version(20).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, reservationId, reservationPurpose, productionBatchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, cogsPerCup, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, supplierInfo, category, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      operationalPlans: 'id, name, type, status, startDate, endDate, branchId, templateId, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, completed, dueDate, note, createdAt, updatedAt',
      planTasks: 'id, planId, title, category, priority, status, assignedTo, dueDate, completedAt, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastUpdated, note, createdAt, updatedAt',
      planTemplates: 'id, name, description, type, category, isDefault, estimatedDuration, difficulty, tags, note, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note'
    }).upgrade(async tx => {
      console.log('🔄 Adding taskType field to planTasks for internal linking...')
      console.log('✅ TaskType field added successfully')
    })

    // Version 21 - Fix fixed assets categoryId indexing issue
    this.version(21).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      // Fixed assets tables with proper categoryId indexing
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Fixing fixed assets categoryId indexing issue...')

      // Verify that the categoryId index is properly created
      const fixedAssetsTable = tx.table('fixedAssets')
      console.log('✅ Fixed assets table categoryId index created successfully')

      // Test the index by attempting a query (this will validate the index works)
      try {
        const testQuery = await fixedAssetsTable.where('categoryId').equals('test').count()
        console.log('✅ CategoryId index validation successful')
      } catch (error) {
        console.warn('⚠️ CategoryId index validation failed:', error)
      }

      console.log('✅ Fixed assets categoryId indexing issue resolved')
    })

    // Version 19: Fix plan template schemas to include missing fields
    this.version(19).stores({
      branches: 'id, name, location, isActive, note, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, category, isActive, note, createdAt, updatedAt',
      products: 'id, name, description, category, isActive, note, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      menus: 'id, name, description, branchId, isActive, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, isAvailable, note, createdAt, updatedAt',
      salesTargets: 'id, branchId, menuId, date, targetCups, note, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, branchId, status, totalCost, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientId, quantity, unitCost, totalCost, expiryDate, note, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, branchId, status, totalQuantity, totalCost, note, createdAt, updatedAt',
      productionItems: 'id, batchId, productId, quantity, unitCost, totalCost, note, createdAt, updatedAt',
      stockReservations: 'id, batchId, warehouseItemId, reservedQuantity, purpose, status, note, createdAt, updatedAt',
      salesRecords: 'id, branchId, menuId, productId, timestamp, quantity, unitPrice, totalRevenue, note, createdAt, updatedAt',
      fixedAssets: 'id, name, description, category, purchasePrice, purchaseDate, depreciationMethod, usefulLifeYears, salvageValue, branchId, isActive, note, createdAt, updatedAt',
      fixedCosts: 'id, assetId, month, depreciationAmount, accumulatedDepreciation, bookValue, note, createdAt, updatedAt',
      operationalPlans: 'id, name, type, status, startDate, endDate, branchId, templateId, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, completed, dueDate, branchId, linkedTaskIds, note, createdAt, updatedAt',
      planTasks: 'id, planId, title, category, priority, status, assignedTo, estimatedDuration, actualDuration, dependencies, dueDate, completedAt, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastUpdated, note, createdAt, updatedAt',
      planTemplates: 'id, name, description, type, category, isDefault, estimatedDuration, difficulty, tags, note, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, description, defaultTargetValue, unit, category, priority, note',
      planTaskTemplates: 'id, templateId, title, description, category, priority, estimatedDuration, dependencies, note',
      planMetricTemplates: 'id, templateId, name, description, defaultTargetValue, unit, category, trackingFrequency, note'
    }).upgrade(async tx => {
      console.log('🔄 Fixing plan template schemas to include missing fields (description, unit, dependencies)...')
      console.log('✅ Plan template schemas fixed successfully')
    })

    // Version 24 - Add recurring expenses table (fixed index with required fields)
    this.version(24).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt',
      // New recurring expenses table
      recurringExpenses: 'id, name, amount, frequency, category, startDate, isActive, createdAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding recurring expenses table...')
      console.log('✅ Recurring expenses table added successfully')
    })

    // Version 25 - Fix recurring expenses table schema to match interface definition
    this.version(25).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt',
      // Fixed recurring expenses table with all required fields
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Fixing recurring expenses table schema to match interface definition...')
      console.log('✅ Recurring expenses table schema fixed successfully')
    })

    // Version 26 - Force complete database reset to fix persistent IDBKeyRange errors
    this.version(26).stores({
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
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt',
      // Properly defined recurring expenses table with all required fields
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Force resetting database to fix IDBKeyRange errors...')

      // Clear the recurring expenses table to ensure clean state
      try {
        await tx.table('recurringExpenses').clear()
        console.log('✅ Recurring expenses table cleared')
      } catch (error) {
        console.log('ℹ️ Recurring expenses table does not exist yet, will be created')
      }

      console.log('✅ Database reset completed - recurring expenses table properly configured')
    })

    // Version 27 - Add business hours to branches table
    this.version(27).stores({
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
      branches: 'id, name, location, note, isActive, businessHoursStart, businessHoursEnd, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt, [menuId+productId+branchId+targetDate]',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt',
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding business hours to branches table...')

      // Update existing branches with default business hours (6:00 AM - 10:00 PM)
      const branches = await tx.table('branches').toArray()
      for (const branch of branches) {
        await tx.table('branches').update(branch.id, {
          businessHoursStart: '06:00',
          businessHoursEnd: '22:00',
          updatedAt: new Date().toISOString()
        })
      }

      console.log('✅ Business hours added to branches table successfully')
    })

    // Version 28 - Add compound index for dailyProductSalesTargets performance optimization
    this.version(28).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, transactionDate, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, category, supplierInfo, note, isActive, createdAt, updatedAt',
      products: 'id, name, description, note, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, createdAt, updatedAt',
      menus: 'id, name, description, status, note, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, createdAt, updatedAt',
      branches: 'id, name, location, note, isActive, businessHoursStart, businessHoursEnd, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, createdAt, updatedAt, [menuId+productId+branchId+targetDate]',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, createdAt, updatedAt',
      assetCategories: 'id, name, description, createdAt, updatedAt',
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding compound index for dailyProductSalesTargets performance optimization...')
      console.log('✅ Compound index [menuId+productId+branchId+targetDate] added successfully')
    })

    // Version 29 - Add Business table and businessId foreign keys for multi-business support
    this.version(29).stores({
      businesses: 'id, name, description, note, createdAt, updatedAt',
      financialItems: 'id, name, category, value, note, businessId, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, businessId, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, businessId, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, businessId, createdAt, updatedAt',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, businessId, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, transactionDate, businessId, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, businessId, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, businessId, createdAt, updatedAt',
      ingredientCategories: 'id, name, description, businessId, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, category, supplierInfo, note, businessId, isActive, createdAt, updatedAt',
      products: 'id, name, description, note, businessId, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, businessId, createdAt, updatedAt',
      menus: 'id, name, description, status, note, businessId, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, businessId, createdAt, updatedAt',
      branches: 'id, name, location, note, businessId, isActive, businessHoursStart, businessHoursEnd, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, businessId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, businessId, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, businessId, createdAt, updatedAt, [menuId+productId+branchId+targetDate]',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, businessId, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, businessId, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, businessId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, businessId, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note, businessId',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note, businessId',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note, businessId',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, businessId, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, businessId, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, businessId, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, businessId, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, businessId, createdAt, updatedAt',
      assetCategories: 'id, name, description, businessId, createdAt, updatedAt',
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, businessId, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding Business table and businessId foreign keys for multi-business support...')

      // Create a default business for existing data
      const defaultBusiness = {
        id: 'default-business-' + Date.now(),
        name: 'My Coffee Business',
        description: 'Default business created during multi-business migration',
        note: 'This is the default business created when upgrading to multi-business support. You can rename or modify this business as needed.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await tx.table('businesses').add(defaultBusiness)
      console.log('✅ Default business created:', defaultBusiness.name)

      // Migrate existing data to use the default business
      const tables = [
        'financialItems', 'bonusSchemes', 'warehouseBatches', 'warehouseItems',
        'stockLevels', 'stockTransactions', 'productionBatches', 'productionItems',
        'ingredientCategories', 'ingredients', 'products', 'productIngredients',
        'menus', 'menuProducts', 'branches', 'menuBranches', 'dailySalesTargets',
        'dailyProductSalesTargets', 'salesRecords', 'productTargetDefaults',
        'journeyProgress', 'planTemplates', 'planGoalTemplates', 'planTaskTemplates',
        'planMetricTemplates', 'plans', 'planGoals', 'planTasks', 'planMetrics',
        'fixedAssets', 'assetCategories', 'recurringExpenses'
      ]

      for (const tableName of tables) {
        try {
          const records = await tx.table(tableName).toArray()
          for (const record of records) {
            await tx.table(tableName).update(record.id, {
              businessId: defaultBusiness.id,
              updatedAt: new Date().toISOString()
            })
          }
          console.log(`✅ Migrated ${records.length} records in ${tableName} table`)
        } catch (error) {
          console.log(`ℹ️ Table ${tableName} does not exist or is empty, skipping migration`)
        }
      }

      console.log('✅ Multi-business support added successfully')
    })

    // Version 30 - Add compound indexes for warehouse and production queries
    this.version(30).stores({
      businesses: 'id, name, description, note, createdAt, updatedAt',
      financialItems: 'id, name, category, value, note, businessId, createdAt, updatedAt, baseUnitCost, baseUnitQuantity, usagePerCup, unit, isFixedAsset, estimatedUsefulLifeYears, sourceAssetId',
      bonusSchemes: '++id, target, perCup, baristaCount, note, businessId, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt',
      warehouseBatches: 'id, batchNumber, dateAdded, note, businessId, createdAt, updatedAt',
      warehouseItems: 'id, batchId, ingredientName, quantity, unit, costPerUnit, totalCost, note, businessId, createdAt, updatedAt, [businessId+batchId]',
      stockLevels: 'id, ingredientName, unit, currentStock, reservedStock, lowStockThreshold, lastUpdated, businessId, createdAt, updatedAt',
      stockTransactions: 'id, ingredientName, unit, transactionType, quantity, reason, batchId, transactionDate, businessId, createdAt, updatedAt',
      productionBatches: 'id, batchNumber, dateCreated, status, note, businessId, productName, outputQuantity, outputUnit, createdAt, updatedAt',
      productionItems: 'id, productionBatchId, ingredientName, quantity, unit, note, businessId, createdAt, updatedAt, [businessId+productionBatchId]',
      ingredientCategories: 'id, name, description, businessId, createdAt, updatedAt',
      ingredients: 'id, name, baseUnitCost, baseUnitQuantity, unit, category, supplierInfo, note, businessId, isActive, createdAt, updatedAt',
      products: 'id, name, description, note, businessId, isActive, createdAt, updatedAt',
      productIngredients: 'id, productId, ingredientId, usagePerCup, note, businessId, createdAt, updatedAt',
      menus: 'id, name, description, status, note, businessId, createdAt, updatedAt',
      menuProducts: 'id, menuId, productId, price, category, displayOrder, note, businessId, createdAt, updatedAt',
      branches: 'id, name, location, note, businessId, isActive, businessHoursStart, businessHoursEnd, createdAt, updatedAt',
      menuBranches: 'id, menuId, branchId, businessId, createdAt, updatedAt',
      dailySalesTargets: 'id, menuId, branchId, targetDate, targetAmount, note, businessId, createdAt, updatedAt',
      dailyProductSalesTargets: 'id, menuId, productId, branchId, targetDate, targetQuantity, note, businessId, createdAt, updatedAt, [menuId+productId+branchId+targetDate]',
      salesRecords: 'id, menuId, productId, branchId, saleDate, saleTime, quantity, unitPrice, totalAmount, note, businessId, createdAt, updatedAt',
      productTargetDefaults: 'id, productId, defaultTargetQuantityPerDay, note, businessId, createdAt, updatedAt',
      journeyProgress: 'id, stepId, completed, completedAt, userId, businessId, createdAt, updatedAt',
      planTemplates: 'id, name, description, category, isActive, businessId, createdAt, updatedAt',
      planGoalTemplates: 'id, templateId, title, category, defaultTargetValue, priority, note, businessId',
      planTaskTemplates: 'id, templateId, title, category, priority, estimatedDuration, note, businessId',
      planMetricTemplates: 'id, templateId, name, category, defaultTargetValue, trackingFrequency, note, businessId',
      plans: 'id, name, description, planType, startDate, endDate, branchId, templateId, status, note, businessId, createdAt, updatedAt',
      planGoals: 'id, planId, title, category, targetValue, currentValue, priority, status, note, businessId, createdAt, updatedAt',
      planTasks: 'id, planId, goalId, title, category, priority, status, estimatedDuration, actualDuration, dependencies, taskType, note, businessId, createdAt, updatedAt',
      planMetrics: 'id, planId, name, category, targetValue, currentValue, trackingFrequency, lastTracked, note, businessId, createdAt, updatedAt',
      fixedAssets: 'id, name, categoryId, purchaseDate, purchaseCost, depreciationMonths, currentValue, note, businessId, createdAt, updatedAt',
      assetCategories: 'id, name, description, businessId, createdAt, updatedAt',
      recurringExpenses: 'id, name, description, amount, frequency, category, startDate, endDate, note, businessId, isActive, createdAt, updatedAt'
    }).upgrade(async tx => {
      console.log('🔄 Adding compound indexes for warehouse and production queries...')
      console.log('✅ Compound index [businessId+batchId] added to warehouseItems')
      console.log('✅ Compound index [businessId+productionBatchId] added to productionItems')
      console.log('✅ Warehouse and production query optimization completed')
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
