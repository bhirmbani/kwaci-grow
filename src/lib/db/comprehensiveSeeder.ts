import { db } from './index'
import { v4 as uuidv4 } from 'uuid'
import type {
  Branch, Ingredient, IngredientCategory, Product, ProductIngredient,
  Menu, MenuProduct, MenuBranch, DailyProductSalesTarget,
  SalesRecord, WarehouseBatch, WarehouseItem, StockLevel,
  ProductionBatch, ProductionItem, FixedAsset, AssetCategory, RecurringExpense,
  OperationalPlan, PlanGoal, PlanTask, PlanTemplate,
  AppSetting, FinancialItem
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
  private totalSteps = 20
  private businessId?: string

  constructor(progressCallback?: ProgressCallback, businessId?: string) {
    this.progressCallback = progressCallback
    this.businessId = businessId
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
        db.financialItems, db.appSettings,
        db.warehouseBatches, db.warehouseItems, db.stockLevels,
        db.productionBatches, db.productionItems, db.productIngredients,
        db.products, db.ingredients, db.ingredientCategories,
        db.menus, db.menuProducts, db.branches, db.menuBranches,
        db.dailyProductSalesTargets, db.salesRecords,
        db.recurringExpenses, db.operationalPlans, db.planGoals,
        db.planTasks, db.planTemplates
      ], async () => {
        // Clear all tables
        await Promise.all([
          db.financialItems.clear(),
          db.appSettings.clear(),
          db.warehouseBatches.clear(),
          db.warehouseItems.clear(),
          db.stockLevels.clear(),
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
          db.dailyProductSalesTargets.clear(),
          db.salesRecords.clear(),
          db.recurringExpenses.clear(),
          db.operationalPlans.clear(),
          db.planGoals.clear(),
          db.planTasks.clear(),
          db.planTemplates.clear()
        ])
      })

      this.updateProgress('Clearing Data', 'All data cleared successfully', true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateProgress('Clearing Data', 'Failed to clear data', true, errorMessage)
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

      // Ensure businessId is available for business-specific seeding
      if (!this.businessId) {
        throw new Error('Business ID is required for comprehensive seeding')
      }

      // TypeScript assertion - businessId is guaranteed to be defined after the check above
      const businessId = this.businessId as string

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateProgress('Error', `Seeding failed: ${errorMessage}`, true, errorMessage)
      throw error
    }
  }

  private async seedAppSettings(): Promise<void> {
    this.currentStep++
    this.updateProgress('App Settings', 'Creating application settings...')

    const now = new Date().toISOString()
    const appSettings: AppSetting[] = [
      {
        key: APP_SETTING_KEYS.DAYS_PER_MONTH,
        value: '30',
        createdAt: now,
        updatedAt: now
      },
      {
        key: APP_SETTING_KEYS.PRICE_PER_CUP,
        value: '25000',
        createdAt: now,
        updatedAt: now
      },
      {
        key: APP_SETTING_KEYS.DAILY_TARGET_CUPS,
        value: '100',
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

    // Only create initial capital and depreciation entries here
    // Operational expenses should be in RecurringExpenses
    // Asset purchases will be created when fixed assets are seeded
    const financialItems: FinancialItem[] = [
      {
        id: uuidv4(),
        name: 'Initial Business Capital',
        value: 500000000, // 500M IDR initial investment
        category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
        note: 'Initial capital investment for coffee shop business',
        businessId: this.businessId!,
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
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dairy & Milk',
        description: 'Milk and dairy products',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Syrups & Flavors',
        description: 'Flavoring syrups and additives',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Packaging',
        description: 'Cups, lids, sleeves, and packaging materials',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Sweeteners',
        description: 'Sugar and artificial sweeteners',
        businessId: this.businessId!,
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
    const coffeeCat = categories.find(c => c.name === 'Coffee Beans')?.id!
    const dairyCat = categories.find(c => c.name === 'Dairy & Milk')?.id!
    const syrupCat = categories.find(c => c.name === 'Syrups & Flavors')?.id!
    const packagingCat = categories.find(c => c.name === 'Packaging')?.id!
    const sweetenerCat = categories.find(c => c.name === 'Sweeteners')?.id!

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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Americano',
        description: 'Espresso with hot water',
        note: 'Simple black coffee',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Latte',
        description: 'Espresso with steamed milk',
        note: 'Creamy and smooth coffee',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        note: 'Traditional Italian coffee',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Vanilla Latte',
        description: 'Latte with vanilla syrup',
        note: 'Sweet and aromatic coffee',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Caramel Macchiato',
        description: 'Espresso with caramel and steamed milk',
        note: 'Sweet caramel flavored coffee',
        businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: espresso.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: americano.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: americano.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: latte.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: vanillaSyrup.id,
          usagePerCup: 15, // 15ml vanilla syrup
          note: 'Vanilla flavoring',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaLatte.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: milk.id,
          usagePerCup: 150, // 150ml steamed milk (less than latte)
          note: 'Steamed milk with foam',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cappuccino.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml steamed milk
          note: 'Steamed milk',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: caramelSyrup.id,
          usagePerCup: 20, // 20ml caramel syrup (more than vanilla)
          note: 'Caramel flavoring',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: cups.id,
          usagePerCup: 1, // 1 cup
          note: 'Serving cup',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: caramelMacchiato.id,
          ingredientId: lids.id,
          usagePerCup: 1, // 1 lid
          note: 'Cup lid',
          businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'All Day Menu',
        description: 'Complete coffee menu available all day',
        status: 'active',
        note: 'Standard menu with regular pricing',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Evening Special',
        description: 'Discounted coffee for evening customers',
        status: 'active',
        note: 'Available 6:00 PM - close with special pricing',
        businessId: this.businessId!,
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
          businessId: this.businessId!,
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
          businessId: this.businessId!,
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
          businessId: this.businessId!,
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
          businessId: this.businessId!,
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

    if (!this.businessId) {
      throw new Error('Business ID is required for seeding asset categories')
    }

    const now = new Date().toISOString()
    const categories: AssetCategory[] = [
      {
        id: uuidv4(),
        name: 'Coffee Equipment',
        description: 'Espresso machines, grinders, and brewing equipment',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Furniture & Fixtures',
        description: 'Tables, chairs, counters, and store fixtures',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Technology',
        description: 'POS systems, computers, and electronic equipment',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Kitchen Equipment',
        description: 'Refrigerators, ovens, and food preparation equipment',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.assetCategories.bulkAdd(categories)
  }

  private async seedFixedAssets(): Promise<void> {
    this.currentStep++
    this.updateProgress('Fixed Assets', 'Creating fixed assets with depreciation...')

    if (!this.businessId) {
      throw new Error('Business ID is required for seeding fixed assets')
    }

    // Get asset categories for reference (filter by current business)
    const categories = await db.assetCategories.where('businessId').equals(this.businessId).toArray()
    const coffeeEquipCat = categories.find(c => c.name === 'Coffee Equipment')?.id!
    const furnitureCat = categories.find(c => c.name === 'Furniture & Fixtures')?.id!
    const techCat = categories.find(c => c.name === 'Technology')?.id!
    const kitchenCat = categories.find(c => c.name === 'Kitchen Equipment')?.id!

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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.fixedAssets.bulkAdd(assets)

    // Create corresponding financial items for asset purchases
    const assetPurchaseItems: FinancialItem[] = assets.map(asset => ({
      id: uuidv4(),
      name: `Purchase: ${asset.name}`,
      value: asset.purchaseCost,
      category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
      note: `Asset purchase: ${asset.note}`,
      businessId: this.businessId!,
      isFixedAsset: true,
      sourceAssetId: asset.id,
      createdAt: asset.purchaseDate + 'T00:00:00.000Z',
      updatedAt: now
    }))

    // Create depreciation entries for each asset
    const depreciationItems: FinancialItem[] = assets.map(asset => {
      const monthlyDepreciation = (asset.purchaseCost - asset.currentValue) / 6 // 6 months of depreciation
      return {
        id: uuidv4(),
        name: `Depreciation: ${asset.name}`,
        value: monthlyDepreciation,
        category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
        note: `Monthly depreciation for ${asset.name}`,
        businessId: this.businessId!,
        isFixedAsset: true,
        sourceAssetId: asset.id,
        createdAt: now,
        updatedAt: now
      }
    })

    await db.financialItems.bulkAdd([...assetPurchaseItems, ...depreciationItems])
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
            businessId: this.businessId!,
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
    this.updateProgress('Historical Sales', 'Creating comprehensive historical sales data...')

    // Get all necessary data for comprehensive sales generation
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()
    const branches = await db.branches.toArray()
    const menuProducts = await db.menuProducts.toArray()
    // const salesTargets = await db.dailyProductSalesTargets.toArray() // Not used currently

    const now = new Date().toISOString()
    const salesRecords: SalesRecord[] = []

    // Create limited historical sales for the past 10 days to keep total records around 500-1000
    for (let i = 1; i <= 10; i++) {
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - i)
      const dateStr = saleDate.toISOString().split('T')[0]
      const dayOfWeek = saleDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isToday = i === 0
      const isFuture = i < 0

      branches.forEach(branch => {
        // Get business hours for this branch
        const businessHours = this.getBranchBusinessHours(branch)

        // Generate sales for each menu that operates during different times
        menus.forEach(menu => {
          const menuProductsForMenu = menuProducts.filter(mp => mp.menuId === menu.id)
          if (menuProductsForMenu.length === 0) return

          // Determine menu operating hours
          const menuHours = this.getMenuOperatingHours(menu, businessHours)
          if (!menuHours) return

          // Generate realistic sales throughout the menu's operating hours
          const salesTimes = this.generateMenuSpecificSalesTimes(
            saleDate,
            branch,
            menu,
            menuHours,
            isWeekend,
            isToday,
            isFuture
          )

          salesTimes.forEach(saleTime => {
            // Select products based on menu and time-based popularity
            const selectedProducts = this.selectProductsForTimeSlot(
              menuProductsForMenu,
              saleTime,
              menu.name
            )

            selectedProducts.forEach(({ menuProduct, quantity }) => {
              const totalAmount = menuProduct.price * quantity

              salesRecords.push({
                id: uuidv4(),
                menuId: menu.id,
                productId: menuProduct.productId,
                branchId: branch.id,
                saleDate: dateStr,
                saleTime: saleTime,
                quantity: quantity,
                unitPrice: menuProduct.price,
                totalAmount: totalAmount,
                note: `${isFuture ? 'Projected' : 'Historical'} sale at ${branch.name} - ${menu.name}`,
                businessId: this.businessId!,
                createdAt: now,
                updatedAt: now
              })
            })
          })
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

  private getBranchBusinessHours(branch: Branch): { start: string; end: string } {
    return {
      start: branch.businessHoursStart || '07:00',
      end: branch.businessHoursEnd || '21:00'
    }
  }

  private getMenuOperatingHours(menu: Menu, businessHours: { start: string; end: string }): { start: string; end: string } | null {
    // Define menu-specific operating hours
    switch (menu.name) {
      case 'Morning Rush':
        return { start: businessHours.start, end: '11:00' }
      case 'All Day Menu':
        return { start: '11:00', end: '18:00' }
      case 'Evening Special':
        return { start: '18:00', end: businessHours.end }
      default:
        return businessHours // Default to full business hours
    }
  }

  private generateMenuSpecificSalesTimes(
    date: Date,
    branch: Branch,
    menu: Menu,
    menuHours: { start: string; end: string },
    isWeekend: boolean,
    isToday: boolean,
    isFuture: boolean
  ): string[] {
    const times: string[] = []

    // Calculate base sales volume for this menu and branch
    let baseSales = this.calculateBaseSalesVolume(branch, menu, isWeekend)

    // Adjust for today (partial day) or future (projected)
    if (isToday) {
      const currentHour = new Date().getHours()
      const menuEndHour = parseInt(menuHours.end.split(':')[0])
      if (currentHour < menuEndHour) {
        baseSales = Math.floor(baseSales * 0.6) // Partial day
      }
    } else if (isFuture) {
      baseSales = Math.floor(baseSales * (0.8 + Math.random() * 0.4)) // 80-120% of normal
    }

    // Generate sales times within menu operating hours
    const startHour = parseInt(menuHours.start.split(':')[0])
    const endHour = parseInt(menuHours.end.split(':')[0])

    for (let i = 0; i < baseSales; i++) {
      const hour = this.selectRandomHourForMenu(startHour, endHour, menu.name)
      const minute = Math.floor(Math.random() * 60)
      const second = Math.floor(Math.random() * 60)
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
      times.push(timeStr)
    }

    return times.sort()
  }

  private calculateBaseSalesVolume(branch: Branch, menu: Menu, isWeekend: boolean): number {
    // Base sales per menu per day - reduced for testing (targeting ~500 total records)
    let baseSales = 0

    // Menu-specific base volumes (reduced by ~75%)
    switch (menu.name) {
      case 'Morning Rush': baseSales = 10; break
      case 'All Day Menu': baseSales = 15; break
      case 'Evening Special': baseSales = 6; break
      default: baseSales = 8
    }

    // Branch multipliers
    switch (branch.name) {
      case 'Downtown Cafe': baseSales *= 1.5; break
      case 'Mall Kiosk': baseSales *= 1.2; break
      case 'University Campus': baseSales *= 1.3; break
      case 'Airport Terminal': baseSales *= 1.1; break
    }

    // Weekend adjustment
    if (isWeekend) {
      baseSales *= (menu.name === 'Mall Kiosk' ? 1.3 : 0.8)
    }

    return Math.floor(baseSales)
  }

  private selectRandomHourForMenu(startHour: number, endHour: number, menuName: string): number {
    // Different hour distributions for different menus
    const hours: number[] = []

    for (let hour = startHour; hour < endHour; hour++) {
      let weight = 1

      // Menu-specific hour weighting
      if (menuName === 'Morning Rush') {
        // Peak at 8-9 AM
        weight = hour >= 8 && hour <= 9 ? 3 : hour >= 7 && hour <= 10 ? 2 : 1
      } else if (menuName === 'All Day Menu') {
        // Peak at lunch (12-14) and mid-afternoon (15-16)
        weight = (hour >= 12 && hour <= 14) || (hour >= 15 && hour <= 16) ? 2 : 1
      } else if (menuName === 'Evening Special') {
        // Peak at early evening (18-19)
        weight = hour >= 18 && hour <= 19 ? 2 : 1
      }

      // Add hour multiple times based on weight
      for (let w = 0; w < weight; w++) {
        hours.push(hour)
      }
    }

    return hours[Math.floor(Math.random() * hours.length)]
  }

  private selectProductsForTimeSlot(
    menuProducts: MenuProduct[],
    saleTime: string,
    menuName: string
  ): Array<{ menuProduct: MenuProduct; quantity: number }> {
    const hour = parseInt(saleTime.split(':')[0])
    const selections: Array<{ menuProduct: MenuProduct; quantity: number }> = []

    // Number of products in this sale (usually 1, sometimes 2-3)
    const numProducts = Math.random() < 0.7 ? 1 : Math.random() < 0.8 ? 2 : 3

    for (let i = 0; i < numProducts; i++) {
      // Select product based on time and menu
      const selectedMenuProduct = this.selectProductForTimeAndMenu(menuProducts, hour, menuName)
      if (selectedMenuProduct) {
        const quantity = Math.random() < 0.8 ? 1 : Math.random() < 0.7 ? 2 : 3
        selections.push({ menuProduct: selectedMenuProduct, quantity })
      }
    }

    return selections
  }

  private selectProductForTimeAndMenu(menuProducts: MenuProduct[], hour: number, menuName: string): MenuProduct | null {
    if (menuProducts.length === 0) return null

    // Time-based product preferences
    const timePreferences: { [key: string]: number } = {}

    if (hour >= 6 && hour <= 10) {
      // Morning preferences
      timePreferences['Espresso'] = 3
      timePreferences['Americano'] = 3
      timePreferences['Latte'] = 2
      timePreferences['Cappuccino'] = 2
    } else if (hour >= 11 && hour <= 14) {
      // Lunch preferences
      timePreferences['Latte'] = 3
      timePreferences['Cappuccino'] = 2
      timePreferences['Vanilla Latte'] = 2
      timePreferences['Americano'] = 2
    } else if (hour >= 15 && hour <= 17) {
      // Afternoon preferences
      timePreferences['Caramel Macchiato'] = 3
      timePreferences['Vanilla Latte'] = 3
      timePreferences['Latte'] = 2
    } else {
      // Evening preferences
      timePreferences['Caramel Macchiato'] = 2
      timePreferences['Vanilla Latte'] = 2
      timePreferences['Latte'] = 1
    }

    // Create weighted array of menu products
    const weightedProducts: MenuProduct[] = []

    menuProducts.forEach(mp => {
      // Find the product to get its name
      const productName = this.getProductNameById(mp.productId)
      const weight = timePreferences[productName] || 1

      for (let w = 0; w < weight; w++) {
        weightedProducts.push(mp)
      }
    })

    return weightedProducts[Math.floor(Math.random() * weightedProducts.length)]
  }

  private getProductNameById(productId: string): string {
    // This is a simplified lookup - in a real implementation, you'd cache the products
    // For now, we'll use a simple mapping based on common product names
    const productNames = ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Vanilla Latte', 'Caramel Macchiato']
    return productNames[Math.floor(Math.random() * productNames.length)]
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
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
      batches.push(batch)

      // Add items to each batch
      ingredients.forEach(ingredient => {
        // Calculate realistic quantities based on ingredient type
        let quantity = 0
        const costPerUnit = ingredient.baseUnitCost / ingredient.baseUnitQuantity

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
          businessId: this.businessId!,
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
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      })
    })

    await db.warehouseBatches.bulkAdd(batches)
    await db.warehouseItems.bulkAdd(warehouseItems)
    await db.stockLevels.bulkAdd(stockLevels)

    // Create corresponding financial items for warehouse purchases
    const warehousePurchaseItems: FinancialItem[] = batches.map(batch => {
      const batchTotalCost = warehouseItems
        .filter(item => item.batchId === batch.id)
        .reduce((sum, item) => sum + item.totalCost, 0)

      return {
        id: uuidv4(),
        name: `Warehouse Purchase: ${batch.batchNumber}`,
        value: batchTotalCost,
        category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
        note: `Inventory purchase for batch ${batch.batchNumber}`,
        businessId: this.businessId!,
        createdAt: batch.dateAdded + 'T00:00:00.000Z',
        updatedAt: now
      }
    })

    await db.financialItems.bulkAdd(warehousePurchaseItems)
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
        businessId: this.businessId!,
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
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        })
      })

      productionBatches.push(batch)
    })

    await db.productionBatches.bulkAdd(productionBatches)
    await db.productionItems.bulkAdd(productionItems)

    // Create corresponding financial items for production costs (only for completed batches)
    const completedBatches = productionBatches.filter(batch => batch.status === 'Completed')
    const productionCostItems: FinancialItem[] = completedBatches.map(batch => {
      // Calculate production cost based on ingredients used
      const batchItems = productionItems.filter(item => item.productionBatchId === batch.id)
      const totalCost = batchItems.reduce((sum, item) => {
        const ingredient = ingredients.find(ing => ing.name === item.ingredientName)
        if (ingredient) {
          const costPerUnit = ingredient.baseUnitCost / ingredient.baseUnitQuantity
          return sum + (item.quantity * costPerUnit)
        }
        return sum
      }, 0)

      return {
        id: uuidv4(),
        name: `Production Cost: Batch #${batch.batchNumber}`,
        value: totalCost,
        category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
        note: `Production costs for batch #${batch.batchNumber}`,
        businessId: this.businessId!,
        createdAt: batch.dateCreated + 'T00:00:00.000Z',
        updatedAt: now
      }
    })

    await db.financialItems.bulkAdd(productionCostItems)
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
        businessId: this.businessId!,
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
          businessId: this.businessId!,
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
          businessId: this.businessId!,
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
          businessId: this.businessId!,
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
