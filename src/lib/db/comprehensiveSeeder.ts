import { db } from './index'
import { v4 as uuidv4 } from 'uuid'
import type {
  Branch, Ingredient, IngredientCategory, Product, ProductIngredient,
  Menu, MenuProduct, MenuBranch, DailySalesTarget, DailyProductSalesTarget,
  SalesRecord, WarehouseBatch, WarehouseItem, StockLevel, StockTransaction,
  ProductionBatch, ProductionItem, FixedAsset, AssetCategory, RecurringExpense,
  OperationalPlan, PlanGoal, PlanTask, PlanMetric, PlanTemplate,
  PlanGoalTemplate, PlanTaskTemplate, PlanMetricTemplate, JourneyProgress,
  AppSetting, FinancialItem, BonusScheme
} from './schema'
import { FINANCIAL_ITEM_CATEGORIES, APP_SETTING_KEYS } from './schema'

export interface SeedingProgress {
  step: string
  progress: number
  total: number
  message: string
  completed: boolean
  error?: string
}

export type ProgressCallback = (progress: SeedingProgress) => void

/**
 * Comprehensive database seeder that creates realistic test data
 * for all major entities in the coffee shop management system
 */
export class ComprehensiveSeeder {
  private progressCallback?: ProgressCallback
  private currentStep = 0
  private totalSteps = 18

  constructor(progressCallback?: ProgressCallback) {
    this.progressCallback = progressCallback
  }

  private updateProgress(step: string, message: string, completed = false, error?: string) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        progress: this.currentStep,
        total: this.totalSteps,
        message,
        completed,
        error
      })
    }
  }

  /**
   * Clear all existing data from the database
   */
  async clearAllData(): Promise<void> {
    this.updateProgress('Clearing Data', 'Clearing all existing data...')
    
    try {
      await db.transaction('rw', [
        db.financialItems, db.bonusSchemes, db.appSettings,
        db.warehouseBatches, db.warehouseItems, db.stockLevels, db.stockTransactions,
        db.productionBatches, db.productionItems, db.productIngredients,
        db.products, db.ingredients, db.ingredientCategories,
        db.menus, db.menuProducts, db.branches, db.menuBranches,
        db.dailySalesTargets, db.dailyProductSalesTargets, db.salesRecords,
        db.productTargetDefaults, db.fixedAssets, db.assetCategories,
        db.recurringExpenses, db.operationalPlans, db.planGoals,
        db.planTasks, db.planMetrics, db.planTemplates,
        db.planGoalTemplates, db.planTaskTemplates, db.planMetricTemplates,
        db.journeyProgress
      ], async () => {
        // Clear all tables
        await Promise.all([
          db.financialItems.clear(),
          db.bonusSchemes.clear(),
          db.appSettings.clear(),
          db.warehouseBatches.clear(),
          db.warehouseItems.clear(),
          db.stockLevels.clear(),
          db.stockTransactions.clear(),
          db.productionBatches.clear(),
          db.productionItems.clear(),
          db.productIngredients.clear(),
          db.products.clear(),
          db.ingredients.clear(),
          db.ingredientCategories.clear(),
          db.menus.clear(),
          db.menuProducts.clear(),
          db.branches.clear(),
          db.menuBranches.clear(),
          db.dailySalesTargets.clear(),
          db.dailyProductSalesTargets.clear(),
          db.salesRecords.clear(),
          db.productTargetDefaults.clear(),
          db.fixedAssets.clear(),
          db.assetCategories.clear(),
          db.recurringExpenses.clear(),
          db.operationalPlans.clear(),
          db.planGoals.clear(),
          db.planTasks.clear(),
          db.planMetrics.clear(),
          db.planTemplates.clear(),
          db.planGoalTemplates.clear(),
          db.planTaskTemplates.clear(),
          db.planMetricTemplates.clear(),
          db.journeyProgress.clear()
        ])
      })

      this.updateProgress('Clearing Data', 'All data cleared successfully', true)
    } catch (error) {
      this.updateProgress('Clearing Data', 'Failed to clear data', true, error.message)
      throw error
    }
  }

  /**
   * Seed the database with comprehensive test data
   */
  async seedDatabase(clearFirst = true): Promise<void> {
    try {
      this.currentStep = 0

      if (clearFirst) {
        await this.clearAllData()
        this.currentStep++
      }

      // Seed in dependency order
      await this.seedAppSettings()
      await this.seedFinancialItems()
      await this.seedIngredientCategories()
      await this.seedIngredients()
      await this.seedProducts()
      await this.seedProductIngredients()
      await this.seedBranches()
      await this.seedMenus()
      await this.seedMenuProducts()
      await this.seedMenuBranches()
      await this.seedAssetCategories()
      await this.seedFixedAssets()
      await this.seedRecurringExpenses()
      await this.seedSalesTargets()
      await this.seedHistoricalSales()
      await this.seedWarehouseData()
      await this.seedProductionData()
      await this.seedPlanningData()

      this.updateProgress('Complete', 'Database seeding completed successfully!', true)
    } catch (error) {
      this.updateProgress('Error', `Seeding failed: ${error.message}`, true, error.message)
      throw error
    }
  }

  private async seedAppSettings(): Promise<void> {
    this.currentStep++
    this.updateProgress('App Settings', 'Creating application settings...')

    const now = new Date().toISOString()
    const appSettings: AppSetting[] = [
      {
        key: APP_SETTING_KEYS.CURRENCY_SYMBOL,
        value: 'IDR',
        createdAt: now,
        updatedAt: now
      },
      {
        key: APP_SETTING_KEYS.BUSINESS_NAME,
        value: 'On The Go Coffee',
        createdAt: now,
        updatedAt: now
      },
      {
        key: APP_SETTING_KEYS.DEFAULT_PROFIT_MARGIN,
        value: '0.65',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.appSettings.bulkAdd(appSettings)
  }

  private async seedFinancialItems(): Promise<void> {
    this.currentStep++
    this.updateProgress('Financial Items', 'Creating financial items...')

    const now = new Date().toISOString()
    const financialItems: FinancialItem[] = [
      {
        id: uuidv4(),
        name: 'Rent',
        value: 15000000, // 15M IDR per month
        category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
        note: 'Monthly rent for main location',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Staff Salary',
        value: 25000000, // 25M IDR per month
        category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
        note: 'Total monthly staff salaries',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Utilities',
        value: 3000000, // 3M IDR per month
        category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
        note: 'Electricity, water, internet',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.financialItems.bulkAdd(financialItems)
  }

  private async seedIngredientCategories(): Promise<void> {
    this.currentStep++
    this.updateProgress('Ingredient Categories', 'Creating ingredient categories...')

    const now = new Date().toISOString()
    const categories: IngredientCategory[] = [
      {
        id: uuidv4(),
        name: 'Coffee Beans',
        description: 'Various types of coffee beans',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dairy & Milk',
        description: 'Milk and dairy products',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Syrups & Flavors',
        description: 'Flavoring syrups and additives',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Packaging',
        description: 'Cups, lids, sleeves, and packaging materials',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Sweeteners',
        description: 'Sugar and artificial sweeteners',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.ingredientCategories.bulkAdd(categories)
  }

  private async seedIngredients(): Promise<void> {
    this.currentStep++
    this.updateProgress('Ingredients', 'Creating ingredients with COGS data...')

    // Get categories for reference
    const categories = await db.ingredientCategories.toArray()
    const coffeeCat = categories.find(c => c.name === 'Coffee Beans')?.id
    const dairyCat = categories.find(c => c.name === 'Dairy & Milk')?.id
    const syrupCat = categories.find(c => c.name === 'Syrups & Flavors')?.id
    const packagingCat = categories.find(c => c.name === 'Packaging')?.id
    const sweetenerCat = categories.find(c => c.name === 'Sweeteners')?.id

    const now = new Date().toISOString()
    const ingredients: Ingredient[] = [
      // Coffee Beans
      {
        id: uuidv4(),
        name: 'Arabica Coffee Beans',
        baseUnitCost: 120000, // 120k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: coffeeCat,
        supplierInfo: 'Premium Coffee Roasters',
        note: 'High-quality Arabica beans for espresso',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Robusta Coffee Beans',
        baseUnitCost: 80000, // 80k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: coffeeCat,
        supplierInfo: 'Local Coffee Suppliers',
        note: 'Strong Robusta beans for blends',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Dairy & Milk
      {
        id: uuidv4(),
        name: 'Whole Milk',
        baseUnitCost: 15000, // 15k IDR per liter
        baseUnitQuantity: 1000, // 1000ml
        unit: 'ml',
        category: dairyCat,
        supplierInfo: 'Fresh Dairy Co.',
        note: 'Fresh whole milk for lattes and cappuccinos',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Oat Milk',
        baseUnitCost: 25000, // 25k IDR per liter
        baseUnitQuantity: 1000, // 1000ml
        unit: 'ml',
        category: dairyCat,
        supplierInfo: 'Plant Based Alternatives',
        note: 'Premium oat milk for dairy-free options',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Syrups & Flavors
      {
        id: uuidv4(),
        name: 'Vanilla Syrup',
        baseUnitCost: 35000, // 35k IDR per bottle
        baseUnitQuantity: 750, // 750ml
        unit: 'ml',
        category: syrupCat,
        supplierInfo: 'Flavor Masters',
        note: 'Natural vanilla flavoring syrup',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Caramel Syrup',
        baseUnitCost: 35000, // 35k IDR per bottle
        baseUnitQuantity: 750, // 750ml
        unit: 'ml',
        category: syrupCat,
        supplierInfo: 'Flavor Masters',
        note: 'Rich caramel flavoring syrup',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Packaging
      {
        id: uuidv4(),
        name: '12oz Paper Cups',
        baseUnitCost: 150000, // 150k IDR per 1000 cups
        baseUnitQuantity: 1000, // 1000 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'EcoPack Solutions',
        note: 'Biodegradable paper cups with logo',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cup Lids',
        baseUnitCost: 80000, // 80k IDR per 1000 lids
        baseUnitQuantity: 1000, // 1000 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'EcoPack Solutions',
        note: 'Recyclable plastic lids',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Sweeteners
      {
        id: uuidv4(),
        name: 'White Sugar',
        baseUnitCost: 12000, // 12k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: sweetenerCat,
        supplierInfo: 'Sweet Supply Co.',
        note: 'Regular white sugar',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Brown Sugar',
        baseUnitCost: 18000, // 18k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: sweetenerCat,
        supplierInfo: 'Sweet Supply Co.',
        note: 'Natural brown sugar',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.ingredients.bulkAdd(ingredients)
  }

  private async seedProducts(): Promise<void> {
    this.currentStep++
    this.updateProgress('Products', 'Creating coffee products...')

    const now = new Date().toISOString()
    const products: Product[] = [
      {
        id: uuidv4(),
        name: 'Espresso',
        description: 'Classic single shot espresso',
        note: 'Strong and bold coffee shot',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Americano',
        description: 'Espresso with hot water',
        note: 'Simple black coffee',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Latte',
        description: 'Espresso with steamed milk',
        note: 'Creamy and smooth coffee',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        note: 'Traditional Italian coffee',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Vanilla Latte',
        description: 'Latte with vanilla syrup',
        note: 'Sweet and aromatic coffee',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Caramel Macchiato',
        description: 'Espresso with caramel and steamed milk',
        note: 'Sweet caramel flavored coffee',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.products.bulkAdd(products)
  }

  private async seedProductIngredients(): Promise<void> {
    this.currentStep++
    this.updateProgress('Product Ingredients', 'Linking products with ingredients...')

    // Get products and ingredients for reference
    const products = await db.products.toArray()
    const ingredients = await db.ingredients.toArray()

    const espresso = products.find(p => p.name === 'Espresso')
    const americano = products.find(p => p.name === 'Americano')
    const latte = products.find(p => p.name === 'Latte')
    const cappuccino = products.find(p => p.name === 'Cappuccino')
    const vanillaLatte = products.find(p => p.name === 'Vanilla Latte')
    const caramelMacchiato = products.find(p => p.name === 'Caramel Macchiato')

    const arabica = ingredients.find(i => i.name === 'Arabica Coffee Beans')
    const milk = ingredients.find(i => i.name === 'Whole Milk')
    const vanillaSyrup = ingredients.find(i => i.name === 'Vanilla Syrup')
    const caramelSyrup = ingredients.find(i => i.name === 'Caramel Syrup')
    const cups = ingredients.find(i => i.name === '12oz Paper Cups')
    const lids = ingredients.find(i => i.name === 'Cup Lids')

    const now = new Date().toISOString()
    const productIngredients: ProductIngredient[] = []

    // Espresso ingredients
    if (espresso && arabica && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: espresso.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: espresso.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Americano ingredients
    if (americano && arabica && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: americano.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso base',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: americano.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: americano.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Latte ingredients
    if (latte && arabica && milk && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso base',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Vanilla Latte ingredients
    if (vanillaLatte && arabica && milk && vanillaSyrup && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso base',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: vanillaSyrup.id,
          usagePerCup: 15, // 15ml vanilla syrup
          note: 'Vanilla flavoring',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Cappuccino ingredients
    if (cappuccino && arabica && milk && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso base',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: milk.id,
          usagePerCup: 150, // 150ml steamed milk (less than latte)
          note: 'Steamed milk with foam',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Caramel Macchiato ingredients
    if (caramelMacchiato && arabica && milk && caramelSyrup && cups && lids) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: arabica.id,
          usagePerCup: 18, // 18g coffee per shot
          note: 'Single shot espresso base',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: caramelSyrup.id,
          usagePerCup: 20, // 20ml caramel syrup (more than vanilla)
          note: 'Caramel flavoring',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          createdAt: now,
          updatedAt: now
        }
      )
    }

    await db.productIngredients.bulkAdd(productIngredients)
  }

  private async seedBranches(): Promise<void> {
    this.currentStep++
    this.updateProgress('Branches', 'Creating branch locations...')

    const now = new Date().toISOString()
    const branches: Branch[] = [
      {
        id: uuidv4(),
        name: 'Downtown Cafe',
        location: 'Jl. Sudirman No. 123, Jakarta Pusat',
        businessHoursStart: '07:00',
        businessHoursEnd: '22:00',
        note: 'Main flagship store in business district',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Mall Kiosk',
        location: 'Grand Indonesia Mall, Level 3',
        businessHoursStart: '10:00',
        businessHoursEnd: '21:00',
        note: 'High-traffic mall location',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'University Campus',
        location: 'Universitas Indonesia, Depok',
        businessHoursStart: '06:30',
        businessHoursEnd: '20:00',
        note: 'Student-focused location with study areas',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Airport Terminal',
        location: 'Soekarno-Hatta Airport, Terminal 2',
        businessHoursStart: '05:00',
        businessHoursEnd: '23:00',
        note: 'Travel hub with extended hours',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.branches.bulkAdd(branches)
  }

  private async seedMenus(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menus', 'Creating menus...')

    const now = new Date().toISOString()
    const menus: Menu[] = [
      {
        id: uuidv4(),
        name: 'Morning Rush',
        description: 'Premium coffee selection for early birds',
        status: 'active',
        note: 'Available 6:00 AM - 11:00 AM with premium pricing',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'All Day Menu',
        description: 'Complete coffee menu available all day',
        status: 'active',
        note: 'Standard menu with regular pricing',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Evening Special',
        description: 'Discounted coffee for evening customers',
        status: 'active',
        note: 'Available 6:00 PM - close with special pricing',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.menus.bulkAdd(menus)
  }

  private async seedMenuProducts(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menu Products', 'Adding products to menus...')

    // Get menus and products for reference
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()

    const morningMenu = menus.find(m => m.name === 'Morning Rush')
    const allDayMenu = menus.find(m => m.name === 'All Day Menu')
    const eveningMenu = menus.find(m => m.name === 'Evening Special')

    const now = new Date().toISOString()
    const menuProducts: MenuProduct[] = []

    // Morning Rush Menu - Premium pricing
    if (morningMenu) {
      products.forEach((product, index) => {
        let price = 0
        switch (product.name) {
          case 'Espresso': price = 25000; break
          case 'Americano': price = 30000; break
          case 'Latte': price = 45000; break
          case 'Cappuccino': price = 40000; break
          case 'Vanilla Latte': price = 50000; break
          case 'Caramel Macchiato': price = 55000; break
          default: price = 35000
        }

        menuProducts.push({
          id: uuidv4(),
          menuId: morningMenu.id,
          productId: product.id,
          price: price,
          category: 'Coffee',
          displayOrder: index + 1,
          note: 'Premium morning pricing',
          createdAt: now,
          updatedAt: now
        })
      })
    }

    // All Day Menu - Standard pricing
    if (allDayMenu) {
      products.forEach((product, index) => {
        let price = 0
        switch (product.name) {
          case 'Espresso': price = 20000; break
          case 'Americano': price = 25000; break
          case 'Latte': price = 38000; break
          case 'Cappuccino': price = 35000; break
          case 'Vanilla Latte': price = 42000; break
          case 'Caramel Macchiato': price = 48000; break
          default: price = 30000
        }

        menuProducts.push({
          id: uuidv4(),
          menuId: allDayMenu.id,
          productId: product.id,
          price: price,
          category: 'Coffee',
          displayOrder: index + 1,
          note: 'Standard all-day pricing',
          createdAt: now,
          updatedAt: now
        })
      })
    }

    // Evening Special Menu - Discounted pricing
    if (eveningMenu) {
      products.forEach((product, index) => {
        let price = 0
        switch (product.name) {
          case 'Espresso': price = 15000; break
          case 'Americano': price = 20000; break
          case 'Latte': price = 30000; break
          case 'Cappuccino': price = 28000; break
          case 'Vanilla Latte': price = 35000; break
          case 'Caramel Macchiato': price = 38000; break
          default: price = 25000
        }

        menuProducts.push({
          id: uuidv4(),
          menuId: eveningMenu.id,
          productId: product.id,
          price: price,
          category: 'Coffee',
          displayOrder: index + 1,
          note: 'Evening special pricing',
          createdAt: now,
          updatedAt: now
        })
      })
    }

    await db.menuProducts.bulkAdd(menuProducts)
  }

  private async seedMenuBranches(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menu Branches', 'Assigning menus to branches...')

    // Get menus and branches for reference
    const menus = await db.menus.toArray()
    const branches = await db.branches.toArray()

    const now = new Date().toISOString()
    const menuBranches: MenuBranch[] = []

    // Assign all menus to all branches
    menus.forEach(menu => {
      branches.forEach(branch => {
        menuBranches.push({
          id: uuidv4(),
          menuId: menu.id,
          branchId: branch.id,
          createdAt: now,
          updatedAt: now
        })
      })
    })

    await db.menuBranches.bulkAdd(menuBranches)
  }

  private async seedAssetCategories(): Promise<void> {
    this.currentStep++
    this.updateProgress('Asset Categories', 'Creating asset categories...')

    const now = new Date().toISOString()
    const categories: AssetCategory[] = [
      {
        id: uuidv4(),
        name: 'Coffee Equipment',
        description: 'Espresso machines, grinders, and brewing equipment',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Furniture & Fixtures',
        description: 'Tables, chairs, counters, and store fixtures',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Technology',
        description: 'POS systems, computers, and electronic equipment',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Kitchen Equipment',
        description: 'Refrigerators, ovens, and food preparation equipment',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.assetCategories.bulkAdd(categories)
  }

  private async seedFixedAssets(): Promise<void> {
    this.currentStep++
    this.updateProgress('Fixed Assets', 'Creating fixed assets with depreciation...')

    // Get asset categories for reference
    const categories = await db.assetCategories.toArray()
    const coffeeEquipCat = categories.find(c => c.name === 'Coffee Equipment')?.id
    const furnitureCat = categories.find(c => c.name === 'Furniture & Fixtures')?.id
    const techCat = categories.find(c => c.name === 'Technology')?.id
    const kitchenCat = categories.find(c => c.name === 'Kitchen Equipment')?.id

    const now = new Date().toISOString()
    const purchaseDate = new Date()
    purchaseDate.setMonth(purchaseDate.getMonth() - 6) // 6 months ago

    const assets: FixedAsset[] = [
      {
        id: uuidv4(),
        name: 'La Marzocco Espresso Machine',
        categoryId: coffeeEquipCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 150000000, // 150M IDR
        depreciationMonths: 120, // 10 years
        currentValue: 142500000, // Depreciated value
        note: 'Professional 3-group espresso machine',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Mazzer Coffee Grinder',
        categoryId: coffeeEquipCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 25000000, // 25M IDR
        depreciationMonths: 60, // 5 years
        currentValue: 21875000, // Depreciated value
        note: 'Commercial coffee grinder',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'POS System',
        categoryId: techCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 15000000, // 15M IDR
        depreciationMonths: 36, // 3 years
        currentValue: 11250000, // Depreciated value
        note: 'Complete point-of-sale system with tablets',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Commercial Refrigerator',
        categoryId: kitchenCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 20000000, // 20M IDR
        depreciationMonths: 84, // 7 years
        currentValue: 17857143, // Depreciated value
        note: 'Double-door commercial refrigerator',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dining Tables & Chairs Set',
        categoryId: furnitureCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 30000000, // 30M IDR
        depreciationMonths: 60, // 5 years
        currentValue: 26250000, // Depreciated value
        note: '10 tables with 40 chairs for customer seating',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.fixedAssets.bulkAdd(assets)
  }

  private async seedRecurringExpenses(): Promise<void> {
    this.currentStep++
    this.updateProgress('Recurring Expenses', 'Creating recurring expenses...')

    const now = new Date().toISOString()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12) // Started 1 year ago

    const expenses: RecurringExpense[] = [
      {
        id: uuidv4(),
        name: 'Store Rent - Downtown',
        amount: 25000000, // 25M IDR
        frequency: 'monthly',
        category: 'rent',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Monthly rent for downtown flagship store',
        isActive: true,
        note: 'Prime location rent with annual increase clause',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Staff Salaries',
        amount: 45000000, // 45M IDR
        frequency: 'monthly',
        category: 'salary',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Total monthly salaries for all staff',
        isActive: true,
        note: 'Includes manager, baristas, and part-time staff',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Electricity Bill',
        amount: 4500000, // 4.5M IDR
        frequency: 'monthly',
        category: 'utilities',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Monthly electricity consumption',
        isActive: true,
        note: 'High usage due to espresso machines and refrigeration',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Business Insurance',
        amount: 12000000, // 12M IDR
        frequency: 'yearly',
        category: 'insurance',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Comprehensive business insurance coverage',
        isActive: true,
        note: 'Covers property, liability, and equipment',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Internet & Phone',
        amount: 1200000, // 1.2M IDR
        frequency: 'monthly',
        category: 'utilities',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Internet and phone services',
        isActive: true,
        note: 'High-speed internet for POS and customer WiFi',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Equipment Maintenance',
        amount: 2500000, // 2.5M IDR
        frequency: 'monthly',
        category: 'maintenance',
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined, // Ongoing
        description: 'Regular maintenance for coffee equipment',
        isActive: true,
        note: 'Preventive maintenance to ensure quality',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.recurringExpenses.bulkAdd(expenses)
  }

  private async seedSalesTargets(): Promise<void> {
    this.currentStep++
    this.updateProgress('Sales Targets', 'Creating sales targets...')

    // Get menus, products, and branches for reference
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()
    const branches = await db.branches.toArray()
    const allDayMenu = menus.find(m => m.name === 'All Day Menu')

    if (!allDayMenu) return

    const now = new Date().toISOString()
    const targets: DailyProductSalesTarget[] = []

    // Create targets for the next 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + i)
      const dateStr = targetDate.toISOString().split('T')[0]

      branches.forEach(branch => {
        products.forEach(product => {
          let baseTarget = 0
          // Set realistic daily targets based on product popularity
          switch (product.name) {
            case 'Latte': baseTarget = 25; break
            case 'Americano': baseTarget = 20; break
            case 'Cappuccino': baseTarget = 15; break
            case 'Espresso': baseTarget = 10; break
            case 'Vanilla Latte': baseTarget = 12; break
            case 'Caramel Macchiato': baseTarget = 8; break
            default: baseTarget = 10
          }

          // Adjust targets based on branch type
          let branchMultiplier = 1
          switch (branch.name) {
            case 'Downtown Cafe': branchMultiplier = 1.5; break
            case 'Mall Kiosk': branchMultiplier = 1.2; break
            case 'University Campus': branchMultiplier = 1.3; break
            case 'Airport Terminal': branchMultiplier = 1.1; break
          }

          // Weekend adjustment (lower targets)
          const dayOfWeek = targetDate.getDay()
          const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1

          const finalTarget = Math.round(baseTarget * branchMultiplier * weekendMultiplier)

          targets.push({
            id: uuidv4(),
            menuId: allDayMenu.id,
            productId: product.id,
            branchId: branch.id,
            targetDate: dateStr,
            targetQuantity: finalTarget,
            note: `Daily target for ${product.name} at ${branch.name}`,
            createdAt: now,
            updatedAt: now
          })
        })
      })
    }

    await db.dailyProductSalesTargets.bulkAdd(targets)
  }

  private async seedHistoricalSales(): Promise<void> {
    this.currentStep++
    this.updateProgress('Historical Sales', 'Creating historical sales data...')

    // Get menus, products, branches, and menu products for reference
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()
    const branches = await db.branches.toArray()
    const menuProducts = await db.menuProducts.toArray()
    const allDayMenu = menus.find(m => m.name === 'All Day Menu')

    if (!allDayMenu) return

    const now = new Date().toISOString()
    const salesRecords: SalesRecord[] = []

    // Create historical sales for the past 30 days
    for (let i = 1; i <= 30; i++) {
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - i)
      const dateStr = saleDate.toISOString().split('T')[0]

      branches.forEach(branch => {
        // Generate sales throughout the day with realistic patterns
        const salesTimes = this.generateRealisticSalesTimes(saleDate, branch)

        salesTimes.forEach(saleTime => {
          // Randomly select a product based on popularity
          const selectedProduct = this.selectRandomProduct(products)
          const menuProduct = menuProducts.find(mp =>
            mp.menuId === allDayMenu.id && mp.productId === selectedProduct.id
          )

          if (menuProduct) {
            // Random quantity (mostly 1, sometimes 2-3)
            const quantity = Math.random() < 0.8 ? 1 : Math.random() < 0.7 ? 2 : 3
            const totalAmount = menuProduct.price * quantity

            salesRecords.push({
              id: uuidv4(),
              menuId: allDayMenu.id,
              productId: selectedProduct.id,
              branchId: branch.id,
              saleDate: dateStr,
              saleTime: saleTime,
              quantity: quantity,
              unitPrice: menuProduct.price,
              totalAmount: totalAmount,
              note: `Historical sale at ${branch.name}`,
              createdAt: now,
              updatedAt: now
            })
          }
        })
      })
    }

    await db.salesRecords.bulkAdd(salesRecords)
  }

  private generateRealisticSalesTimes(date: Date, branch: Branch): string[] {
    const times: string[] = []
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Base number of sales per day
    let baseSales = 0
    switch (branch.name) {
      case 'Downtown Cafe': baseSales = isWeekend ? 80 : 120; break
      case 'Mall Kiosk': baseSales = isWeekend ? 100 : 90; break
      case 'University Campus': baseSales = isWeekend ? 40 : 110; break
      case 'Airport Terminal': baseSales = 95; break // Consistent
      default: baseSales = 80
    }

    // Generate sales with realistic time distribution
    for (let i = 0; i < baseSales; i++) {
      const hour = this.selectRandomHour()
      const minute = Math.floor(Math.random() * 60)
      const second = Math.floor(Math.random() * 60)
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
      times.push(timeStr)
    }

    return times.sort()
  }

  private selectRandomHour(): number {
    // Weighted hour selection based on coffee shop patterns
    const hourWeights = {
      7: 15, 8: 20, 9: 18, 10: 12, 11: 8,  // Morning rush
      12: 10, 13: 12, 14: 8, 15: 6, 16: 5, // Lunch and afternoon
      17: 4, 18: 3, 19: 2, 20: 1           // Evening
    }

    const totalWeight = Object.values(hourWeights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (const [hour, weight] of Object.entries(hourWeights)) {
      random -= weight
      if (random <= 0) {
        return parseInt(hour)
      }
    }

    return 8 // Fallback
  }

  private selectRandomProduct(products: Product[]): Product {
    // Weighted product selection based on popularity
    const productWeights = {
      'Latte': 25,
      'Americano': 20,
      'Cappuccino': 18,
      'Vanilla Latte': 15,
      'Espresso': 12,
      'Caramel Macchiato': 10
    }

    const totalWeight = Object.values(productWeights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (const [productName, weight] of Object.entries(productWeights)) {
      random -= weight
      if (random <= 0) {
        const product = products.find(p => p.name === productName)
        if (product) return product
      }
    }

    return products[0] // Fallback
  }

  private async seedWarehouseData(): Promise<void> {
    this.currentStep++
    this.updateProgress('Warehouse Data', 'Creating warehouse inventory...')

    const ingredients = await db.ingredients.toArray()
    const now = new Date().toISOString()

    // Create warehouse batches
    const batches: WarehouseBatch[] = []
    const warehouseItems: WarehouseItem[] = []
    const stockLevels: StockLevel[] = []

    // Create 3 recent batches
    for (let i = 0; i < 3; i++) {
      const batchDate = new Date()
      batchDate.setDate(batchDate.getDate() - (i * 7)) // Weekly batches

      const batch: WarehouseBatch = {
        id: uuidv4(),
        batchNumber: `WB-${batchDate.getFullYear()}${(batchDate.getMonth() + 1).toString().padStart(2, '0')}${batchDate.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(3, '0')}`,
        dateAdded: batchDate.toISOString().split('T')[0],
        note: `Weekly inventory batch #${i + 1}`,
        createdAt: now,
        updatedAt: now
      }
      batches.push(batch)

      // Add items to each batch
      ingredients.forEach(ingredient => {
        // Calculate realistic quantities based on ingredient type
        let quantity = 0
        let costPerUnit = ingredient.baseUnitCost / ingredient.baseUnitQuantity

        switch (ingredient.unit) {
          case 'g': // Coffee beans, sugar
            quantity = Math.floor(Math.random() * 5000) + 2000 // 2-7kg
            break
          case 'ml': // Milk, syrups
            quantity = Math.floor(Math.random() * 10000) + 5000 // 5-15L
            break
          case 'piece': // Cups, lids
            quantity = Math.floor(Math.random() * 2000) + 1000 // 1000-3000 pieces
            break
          default:
            quantity = Math.floor(Math.random() * 100) + 50
        }

        const totalCost = quantity * costPerUnit

        warehouseItems.push({
          id: uuidv4(),
          batchId: batch.id,
          ingredientName: ingredient.name,
          quantity: quantity,
          unit: ingredient.unit,
          costPerUnit: costPerUnit,
          totalCost: totalCost,
          note: `Batch ${batch.batchNumber} - ${ingredient.name}`,
          createdAt: now,
          updatedAt: now
        })
      })
    }

    // Create current stock levels
    ingredients.forEach(ingredient => {
      // Calculate current stock from all batches
      const totalReceived = warehouseItems
        .filter(item => item.ingredientName === ingredient.name)
        .reduce((sum, item) => sum + item.quantity, 0)

      // Simulate some usage
      const usageRate = Math.random() * 0.4 + 0.1 // 10-50% used
      const currentStock = Math.floor(totalReceived * (1 - usageRate))
      const reservedStock = Math.floor(currentStock * 0.1) // 10% reserved

      // Set low stock thresholds
      let lowStockThreshold = 0
      switch (ingredient.unit) {
        case 'g': lowStockThreshold = 500; break // 500g
        case 'ml': lowStockThreshold = 1000; break // 1L
        case 'piece': lowStockThreshold = 200; break // 200 pieces
        default: lowStockThreshold = 10
      }

      stockLevels.push({
        id: uuidv4(),
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        currentStock: currentStock,
        reservedStock: reservedStock,
        lowStockThreshold: lowStockThreshold,
        lastUpdated: now,
        createdAt: now,
        updatedAt: now
      })
    })

    await db.warehouseBatches.bulkAdd(batches)
    await db.warehouseItems.bulkAdd(warehouseItems)
    await db.stockLevels.bulkAdd(stockLevels)
  }

  private async seedProductionData(): Promise<void> {
    this.currentStep++
    this.updateProgress('Production Data', 'Creating production batches...')

    const ingredients = await db.ingredients.toArray()
    const now = new Date().toISOString()

    const productionBatches: ProductionBatch[] = []
    const productionItems: ProductionItem[] = []

    // Create production batches in various statuses (using correct capitalized status values)
    const statuses: Array<'Pending' | 'In Progress' | 'Completed'> =
      ['Completed', 'Completed', 'In Progress', 'Pending', 'Completed']

    statuses.forEach((status, index) => {
      const batchDate = new Date()
      if (status === 'Completed') {
        batchDate.setDate(batchDate.getDate() - (index + 1)) // Past dates for completed
      } else if (status === 'In Progress') {
        // Today for in-progress
      } else {
        batchDate.setDate(batchDate.getDate() + 1) // Future for pending
      }

      const batch: ProductionBatch = {
        id: uuidv4(),
        batchNumber: index + 1, // Numeric batch number starting from 1
        dateCreated: batchDate.toISOString().split('T')[0], // Use dateCreated field
        status: status,
        note: `${status} production batch`,
        // Set output data for completed batches
        productName: status === 'Completed' ? 'Coffee Products' : undefined,
        outputQuantity: status === 'Completed' ? Math.floor(Math.random() * 100) + 50 : undefined,
        outputUnit: status === 'Completed' ? 'cups' : undefined,
        createdAt: now,
        updatedAt: now
      }

      // Add 3-5 random ingredients to each batch
      const selectedIngredients = ingredients
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 3)

      selectedIngredients.forEach(ingredient => {
        const quantity = Math.floor(Math.random() * 500) + 100 // 100-600 units

        productionItems.push({
          id: uuidv4(),
          productionBatchId: batch.id, // Use correct field name
          ingredientName: ingredient.name, // Use ingredient name as expected by schema
          quantity: quantity,
          unit: ingredient.unit,
          note: `${quantity} ${ingredient.unit} of ${ingredient.name}`,
          createdAt: now,
          updatedAt: now
        })
      })

      productionBatches.push(batch)
    })

    await db.productionBatches.bulkAdd(productionBatches)
    await db.productionItems.bulkAdd(productionItems)
  }

  private async seedPlanningData(): Promise<void> {
    this.currentStep++
    this.updateProgress('Planning Data', 'Creating plans, tasks, and goals...')

    const branches = await db.branches.toArray()
    const now = new Date().toISOString()

    // Create plan templates
    const planTemplates: PlanTemplate[] = [
      {
        id: uuidv4(),
        name: 'Daily Operations',
        description: 'Standard daily operational tasks',
        type: 'daily',
        category: 'operations',
        isDefault: true,
        estimatedDuration: 480, // 8 hours
        difficulty: 'beginner',
        tags: 'daily,operations,standard',
        note: 'Basic daily operations template',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Weekly Inventory',
        description: 'Weekly inventory management and planning',
        type: 'weekly',
        category: 'inventory',
        isDefault: true,
        estimatedDuration: 240, // 4 hours
        difficulty: 'intermediate',
        tags: 'weekly,inventory,planning',
        note: 'Comprehensive weekly inventory review',
        createdAt: now,
        updatedAt: now
      }
    ]

    // Create operational plans
    const operationalPlans: OperationalPlan[] = []
    const planGoals: PlanGoal[] = []
    const planTasks: PlanTask[] = []

    branches.forEach((branch, branchIndex) => {
      // Daily plan
      const dailyPlan: OperationalPlan = {
        id: uuidv4(),
        name: `Daily Operations - ${branch.name}`,
        description: `Daily operational plan for ${branch.name}`,
        type: 'daily',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        branchId: branch.id,
        templateId: planTemplates[0].id,
        note: `Active daily plan for ${branch.name}`,
        createdAt: now,
        updatedAt: now
      }
      operationalPlans.push(dailyPlan)

      // Weekly plan
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6) // End of week

      const weeklyPlan: OperationalPlan = {
        id: uuidv4(),
        name: `Weekly Inventory - ${branch.name}`,
        description: `Weekly inventory plan for ${branch.name}`,
        type: 'weekly',
        status: 'active',
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        branchId: branch.id,
        templateId: planTemplates[1].id,
        note: `Weekly inventory management for ${branch.name}`,
        createdAt: now,
        updatedAt: now
      }
      operationalPlans.push(weeklyPlan)

      // Create goals for each plan
      planGoals.push(
        {
          id: uuidv4(),
          planId: dailyPlan.id,
          title: 'Daily Sales Target',
          description: 'Achieve daily sales target for all products',
          targetValue: 150,
          currentValue: 120,
          unit: 'cups',
          category: 'sales',
          priority: 'high',
          dueDate: new Date().toISOString().split('T')[0],
          note: 'Track daily sales performance',
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          planId: weeklyPlan.id,
          title: 'Inventory Accuracy',
          description: 'Maintain 95% inventory accuracy',
          targetValue: 95,
          currentValue: 92,
          unit: 'percent',
          category: 'efficiency',
          priority: 'medium',
          dueDate: weekEnd.toISOString().split('T')[0],
          note: 'Weekly inventory accuracy target',
          createdAt: now,
          updatedAt: now
        }
      )

      // Create tasks for each plan
      const dailyTasks = [
        { title: 'Open Store', category: 'setup', priority: 'high', duration: 30, status: 'completed' },
        { title: 'Check Equipment', category: 'maintenance', priority: 'high', duration: 15, status: 'completed' },
        { title: 'Prepare Ingredients', category: 'production', priority: 'medium', duration: 45, status: 'in-progress' },
        { title: 'Clean Equipment', category: 'maintenance', priority: 'medium', duration: 30, status: 'pending' }
      ]

      dailyTasks.forEach((task, taskIndex) => {
        planTasks.push({
          id: uuidv4(),
          planId: dailyPlan.id,
          title: task.title,
          description: `${task.title} for ${branch.name}`,
          category: task.category as any,
          priority: task.priority as any,
          status: task.status as any,
          estimatedDuration: task.duration,
          dependencies: taskIndex > 0 ? [planTasks[planTasks.length - 1]?.id].filter(Boolean) : [],
          note: `Daily task: ${task.title}`,
          createdAt: now,
          updatedAt: now
        })
      })
    })

    await db.planTemplates.bulkAdd(planTemplates)
    await db.operationalPlans.bulkAdd(operationalPlans)
    await db.planGoals.bulkAdd(planGoals)
    await db.planTasks.bulkAdd(planTasks)
  }
}
