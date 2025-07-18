import { db } from './index'
import { v4 as uuidv4 } from 'uuid'
import type {
  Business, Branch, Ingredient, IngredientCategory, Product, ProductIngredient,
  Menu, MenuProduct, MenuBranch, DailyProductSalesTarget,
  SalesRecord, WarehouseBatch, WarehouseItem, StockLevel,
  ProductionBatch, ProductionItem, FixedAsset, AssetCategory, RecurringExpense,
  OperationalPlan, PlanGoal, PlanTask, PlanMetric, PlanTemplate,
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
 * Comprehensive bakery business seeder that creates realistic test data
 * for a bakery business with all the comprehensive data that coffee business has
 */
export class ComprehensiveBakerySeeder {
  private progressCallback?: ProgressCallback
  private currentStep = 0
  private totalSteps = 18 // Same as ComprehensiveSeeder
  private businessId: string

  constructor(progressCallback?: ProgressCallback) {
    this.progressCallback = progressCallback
    this.businessId = uuidv4() // Generate business ID for this seeder
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
   * Get the business ID for this seeder
   */
  getBusinessId(): string {
    return this.businessId
  }

  /**
   * Seed the comprehensive bakery business data
   */
  async seedBakeryBusiness(): Promise<string> {
    try {
      this.currentStep = 0

      // Seed in dependency order - same as ComprehensiveSeeder
      await this.seedBusiness()
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

      this.updateProgress('Complete', 'Comprehensive bakery business seeding completed successfully!', true)
      return this.businessId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateProgress('Error', `Bakery seeding failed: ${errorMessage}`, true, errorMessage)
      throw error
    }
  }

  private async seedBusiness(): Promise<void> {
    this.currentStep++
    this.updateProgress('Business', 'Creating bakery business...')

    const now = new Date().toISOString()
    const business: Business = {
      id: this.businessId,
      name: 'Sweet Dreams Bakery',
      description: 'Artisan bakery specializing in fresh breads, pastries, and custom cakes',
      note: 'Family-owned bakery serving the community since 2020',
      currency: 'THB', // Thai Baht for bakery business
      logo: '🥐', // Croissant emoji for bakery business
      createdAt: now,
      updatedAt: now
    }

    await db.businesses.add(business)
  }

  private async seedAppSettings(): Promise<void> {
    this.currentStep++
    this.updateProgress('App Settings', 'Creating bakery app settings...')

    // Check if app settings already exist (they are global, not business-specific)
    const existingSettings = await db.appSettings.toArray()
    if (existingSettings.length > 0) {
      // App settings already exist, skip creation
      return
    }

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
        value: '35000', // Higher average price for bakery items
        createdAt: now,
        updatedAt: now
      },
      {
        key: APP_SETTING_KEYS.DAILY_TARGET_CUPS,
        value: '80', // Lower volume but higher value items
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.appSettings.bulkAdd(appSettings)
  }

  private async seedFinancialItems(): Promise<void> {
    this.currentStep++
    this.updateProgress('Financial Items', 'Creating bakery financial items...')

    const now = new Date().toISOString()

    // Only create initial capital and depreciation entries here
    // Operational expenses should be in RecurringExpenses
    // Asset purchases will be created when fixed assets are seeded
    const financialItems: FinancialItem[] = [
      {
        id: uuidv4(),
        name: 'Initial Bakery Capital',
        value: 750000000, // 750M IDR initial investment (higher for bakery equipment)
        category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
        note: 'Initial capital investment for bakery business',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.financialItems.bulkAdd(financialItems)
  }

  private async seedIngredientCategories(): Promise<void> {
    this.currentStep++
    this.updateProgress('Ingredient Categories', 'Creating bakery ingredient categories...')

    const now = new Date().toISOString()
    const categories: IngredientCategory[] = [
      {
        id: uuidv4(),
        name: 'Flours & Grains',
        description: 'Various types of flour and grain products',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dairy & Eggs',
        description: 'Milk, butter, eggs, and other dairy products',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Sweeteners & Sugars',
        description: 'Various types of sugar and sweetening agents',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Fats & Oils',
        description: 'Butter, oils, and other fats for baking',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Leavening Agents',
        description: 'Yeast, baking powder, and other rising agents',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Flavorings & Extracts',
        description: 'Vanilla, chocolate, spices, and flavor extracts',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Packaging & Containers',
        description: 'Boxes, bags, and packaging materials',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.ingredientCategories.bulkAdd(categories)
  }

  private async seedIngredients(): Promise<void> {
    this.currentStep++
    this.updateProgress('Ingredients', 'Creating bakery ingredients...')

    // Get categories for reference
    const categories = await db.ingredientCategories.where('businessId').equals(this.businessId).toArray()
    const flourCat = categories.find(c => c.name === 'Flours & Grains')?.id
    const dairyCat = categories.find(c => c.name === 'Dairy & Eggs')?.id
    const sweetenerCat = categories.find(c => c.name === 'Sweeteners & Sugars')?.id
    const leavenCat = categories.find(c => c.name === 'Leavening Agents')?.id
    const flavorCat = categories.find(c => c.name === 'Flavorings & Extracts')?.id
    const packagingCat = categories.find(c => c.name === 'Packaging & Containers')?.id

    const now = new Date().toISOString()
    const ingredients: Ingredient[] = [
      // Flours & Grains
      {
        id: uuidv4(),
        name: 'All-Purpose Flour',
        baseUnitCost: 25000, // 25k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: flourCat,
        supplierInfo: 'Premium Flour Mills',
        note: 'High-quality all-purpose flour for general baking',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Bread Flour',
        baseUnitCost: 30000, // 30k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: flourCat,
        supplierInfo: 'Premium Flour Mills',
        note: 'High-protein flour for bread making',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cake Flour',
        baseUnitCost: 35000, // 35k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: flourCat,
        supplierInfo: 'Premium Flour Mills',
        note: 'Low-protein flour for tender cakes',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Dairy & Eggs
      {
        id: uuidv4(),
        name: 'Fresh Eggs',
        baseUnitCost: 30000, // 30k IDR per dozen
        baseUnitQuantity: 12, // 12 pieces
        unit: 'piece',
        category: dairyCat,
        supplierInfo: 'Local Farm Fresh',
        note: 'Grade A fresh eggs for baking',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Unsalted Butter',
        baseUnitCost: 45000, // 45k IDR per 500g
        baseUnitQuantity: 500, // 500g
        unit: 'g',
        category: dairyCat,
        supplierInfo: 'Premium Dairy Co.',
        note: 'High-quality unsalted butter for baking',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Whole Milk',
        baseUnitCost: 15000, // 15k IDR per liter
        baseUnitQuantity: 1000, // 1000ml
        unit: 'ml',
        category: dairyCat,
        supplierInfo: 'Fresh Dairy Co.',
        note: 'Fresh whole milk for baking and glazes',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Heavy Cream',
        baseUnitCost: 25000, // 25k IDR per 500ml
        baseUnitQuantity: 500, // 500ml
        unit: 'ml',
        category: dairyCat,
        supplierInfo: 'Premium Dairy Co.',
        note: 'Heavy cream for whipping and rich pastries',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Sweeteners & Sugars
      {
        id: uuidv4(),
        name: 'Granulated Sugar',
        baseUnitCost: 15000, // 15k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: sweetenerCat,
        supplierInfo: 'Sweet Supply Co.',
        note: 'Regular white granulated sugar',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Brown Sugar',
        baseUnitCost: 20000, // 20k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: sweetenerCat,
        supplierInfo: 'Sweet Supply Co.',
        note: 'Light brown sugar for rich flavor',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Powdered Sugar',
        baseUnitCost: 18000, // 18k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: sweetenerCat,
        supplierInfo: 'Sweet Supply Co.',
        note: 'Confectioners sugar for icings and dusting',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Leavening Agents
      {
        id: uuidv4(),
        name: 'Active Dry Yeast',
        baseUnitCost: 15000, // 15k IDR per 100g
        baseUnitQuantity: 100, // 100g
        unit: 'g',
        category: leavenCat,
        supplierInfo: 'Baking Essentials',
        note: 'Active dry yeast for bread making',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Baking Powder',
        baseUnitCost: 12000, // 12k IDR per 200g
        baseUnitQuantity: 200, // 200g
        unit: 'g',
        category: leavenCat,
        supplierInfo: 'Baking Essentials',
        note: 'Double-acting baking powder',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Flavorings & Extracts
      {
        id: uuidv4(),
        name: 'Pure Vanilla Extract',
        baseUnitCost: 50000, // 50k IDR per 100ml
        baseUnitQuantity: 100, // 100ml
        unit: 'ml',
        category: flavorCat,
        supplierInfo: 'Flavor Masters',
        note: 'Pure vanilla extract for premium flavor',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dark Chocolate Chips',
        baseUnitCost: 60000, // 60k IDR per 500g
        baseUnitQuantity: 500, // 500g
        unit: 'g',
        category: flavorCat,
        supplierInfo: 'Premium Chocolate Co.',
        note: 'High-quality dark chocolate chips',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cinnamon Powder',
        baseUnitCost: 40000, // 40k IDR per 200g
        baseUnitQuantity: 200, // 200g
        unit: 'g',
        category: flavorCat,
        supplierInfo: 'Spice Masters',
        note: 'Ground cinnamon for baking',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cocoa Powder',
        baseUnitCost: 35000, // 35k IDR per 250g
        baseUnitQuantity: 250, // 250g
        unit: 'g',
        category: flavorCat,
        supplierInfo: 'Premium Chocolate Co.',
        note: 'Unsweetened cocoa powder for chocolate flavor',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cream Cheese',
        baseUnitCost: 25000, // 25k IDR per 250g
        baseUnitQuantity: 250, // 250g
        unit: 'g',
        category: dairyCat,
        supplierInfo: 'Dairy Fresh Co.',
        note: 'Cream cheese for frostings and glazes',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Packaging
      {
        id: uuidv4(),
        name: 'Bakery Boxes (Small)',
        baseUnitCost: 5000, // 5k IDR per 10 boxes
        baseUnitQuantity: 10, // 10 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'Packaging Solutions',
        note: 'Small boxes for individual pastries',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Bakery Boxes (Large)',
        baseUnitCost: 8000, // 8k IDR per 10 boxes
        baseUnitQuantity: 10, // 10 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'Packaging Solutions',
        note: 'Large boxes for cakes and bread',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Paper Bags',
        baseUnitCost: 3000, // 3k IDR per 50 bags
        baseUnitQuantity: 50, // 50 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'Packaging Solutions',
        note: 'Paper bags for takeaway items',
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
    this.updateProgress('Products', 'Creating bakery products...')

    const now = new Date().toISOString()
    const products: Product[] = [
      {
        id: uuidv4(),
        name: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread with crispy crust',
        note: 'Made with natural sourdough starter, 24-hour fermentation',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Chocolate Chip Cookies',
        description: 'Classic chocolate chip cookies (dozen)',
        note: 'Soft and chewy with premium dark chocolate chips',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Vanilla Cupcakes',
        description: 'Fluffy vanilla cupcakes with buttercream frosting',
        note: 'Made with pure vanilla extract and topped with vanilla buttercream',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cinnamon Rolls',
        description: 'Warm cinnamon rolls with cream cheese glaze',
        note: 'Soft yeast dough rolled with cinnamon sugar filling',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Blueberry Muffins',
        description: 'Fresh blueberry muffins with streusel topping',
        note: 'Bursting with fresh blueberries and a crunchy top',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Croissants',
        description: 'Buttery, flaky French croissants',
        note: 'Laminated dough with multiple butter layers for perfect flakiness',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Chocolate Brownies',
        description: 'Rich, fudgy chocolate brownies',
        note: 'Dense and chocolatey with a perfect chewy texture',
        businessId: this.businessId!,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Apple Pie Slice',
        description: 'Classic apple pie with cinnamon and flaky crust',
        note: 'Made with fresh apples and our signature pie crust',
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
    this.updateProgress('Product Ingredients', 'Linking bakery products with ingredients...')

    // Get products and ingredients for reference
    const products = await db.products.where('businessId').equals(this.businessId).toArray()
    const ingredients = await db.ingredients.where('businessId').equals(this.businessId).toArray()

    const sourdoughBread = products.find(p => p.name === 'Artisan Sourdough Bread')
    const chocolateChipCookies = products.find(p => p.name === 'Chocolate Chip Cookies')
    const vanillaCupcakes = products.find(p => p.name === 'Vanilla Cupcakes')
    const cinnamonRolls = products.find(p => p.name === 'Cinnamon Rolls')
    const blueberryMuffins = products.find(p => p.name === 'Blueberry Muffins')
    const croissants = products.find(p => p.name === 'Croissants')
    const chocolateBrownies = products.find(p => p.name === 'Chocolate Brownies')
    const applePieSlice = products.find(p => p.name === 'Apple Pie Slice')

    const breadFlour = ingredients.find(i => i.name === 'Bread Flour')
    const allPurposeFlour = ingredients.find(i => i.name === 'All-Purpose Flour')
    const cakeFlour = ingredients.find(i => i.name === 'Cake Flour')
    const eggs = ingredients.find(i => i.name === 'Fresh Eggs')
    const butter = ingredients.find(i => i.name === 'Unsalted Butter')
    const sugar = ingredients.find(i => i.name === 'Granulated Sugar')
    const brownSugar = ingredients.find(i => i.name === 'Brown Sugar')
    const powderedSugar = ingredients.find(i => i.name === 'Powdered Sugar')
    const yeast = ingredients.find(i => i.name === 'Active Dry Yeast')
    const bakingPowder = ingredients.find(i => i.name === 'Baking Powder')
    const vanillaExtract = ingredients.find(i => i.name === 'Pure Vanilla Extract')
    const cinnamon = ingredients.find(i => i.name === 'Cinnamon Powder')
    const chocolateChips = ingredients.find(i => i.name === 'Dark Chocolate Chips')
    const cocoaPowder = ingredients.find(i => i.name === 'Cocoa Powder')
    const creamCheese = ingredients.find(i => i.name === 'Cream Cheese')
    const milk = ingredients.find(i => i.name === 'Whole Milk')
    const smallBoxes = ingredients.find(i => i.name === 'Bakery Boxes (Small)')
    const largeBoxes = ingredients.find(i => i.name === 'Bakery Boxes (Large)')

    const now = new Date().toISOString()
    const productIngredients: ProductIngredient[] = []

    // Artisan Sourdough Bread ingredients
    if (sourdoughBread && breadFlour && yeast && largeBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: sourdoughBread.id,
          ingredientId: breadFlour.id,
          usagePerCup: 500, // 500g flour per loaf
          note: 'High-protein bread flour for structure',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: sourdoughBread.id,
          ingredientId: yeast.id,
          usagePerCup: 5, // 5g yeast per loaf
          note: 'Active dry yeast for fermentation',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: sourdoughBread.id,
          ingredientId: largeBoxes.id,
          usagePerCup: 1, // 1 box per loaf
          note: 'Large bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Chocolate Chip Cookies ingredients (per dozen)
    if (chocolateChipCookies && allPurposeFlour && butter && eggs && sugar && brownSugar && chocolateChips && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 250, // 250g flour per dozen cookies
          note: 'All-purpose flour for cookie base',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: butter.id,
          usagePerCup: 150, // 150g butter per dozen
          note: 'Unsalted butter for rich flavor',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: eggs.id,
          usagePerCup: 2, // 2 eggs per dozen
          note: 'Fresh eggs for binding',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: sugar.id,
          usagePerCup: 100, // 100g granulated sugar
          note: 'Granulated sugar for sweetness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: brownSugar.id,
          usagePerCup: 100, // 100g brown sugar
          note: 'Brown sugar for moisture and flavor',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: chocolateChips.id,
          usagePerCup: 200, // 200g chocolate chips
          note: 'Dark chocolate chips for rich flavor',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per dozen
          note: 'Small bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Vanilla Cupcakes ingredients
    if (vanillaCupcakes && cakeFlour && butter && eggs && sugar && powderedSugar && bakingPowder && vanillaExtract && milk && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: cakeFlour.id,
          usagePerCup: 200, // 200g cake flour per dozen
          note: 'Cake flour for tender texture',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: butter.id,
          usagePerCup: 120, // 120g butter per dozen
          note: 'Unsalted butter for richness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: eggs.id,
          usagePerCup: 3, // 3 eggs per dozen
          note: 'Fresh eggs for structure',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: sugar.id,
          usagePerCup: 150, // 150g sugar
          note: 'Granulated sugar for sweetness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: powderedSugar.id,
          usagePerCup: 200, // 200g powdered sugar for frosting
          note: 'Powdered sugar for buttercream frosting',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: bakingPowder.id,
          usagePerCup: 10, // 10g baking powder
          note: 'Baking powder for rise',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: vanillaExtract.id,
          usagePerCup: 5, // 5ml vanilla extract
          note: 'Pure vanilla extract for flavor',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: milk.id,
          usagePerCup: 120, // 120ml milk
          note: 'Whole milk for moisture',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per dozen
          note: 'Small bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Cinnamon Rolls ingredients
    if (cinnamonRolls && allPurposeFlour && butter && eggs && sugar && brownSugar && yeast && cinnamon && creamCheese && powderedSugar && milk && largeBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 400, // 400g flour per batch
          note: 'All-purpose flour for dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: butter.id,
          usagePerCup: 100, // 100g butter
          note: 'Butter for dough and filling',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: eggs.id,
          usagePerCup: 2, // 2 eggs
          note: 'Eggs for enriched dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: sugar.id,
          usagePerCup: 50, // 50g sugar for dough
          note: 'Sugar for dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: brownSugar.id,
          usagePerCup: 100, // 100g brown sugar for filling
          note: 'Brown sugar for cinnamon filling',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: yeast.id,
          usagePerCup: 7, // 7g yeast
          note: 'Active dry yeast for rise',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: cinnamon.id,
          usagePerCup: 15, // 15g cinnamon
          note: 'Ground cinnamon for filling',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: creamCheese.id,
          usagePerCup: 100, // 100g cream cheese for glaze
          note: 'Cream cheese for glaze',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: powderedSugar.id,
          usagePerCup: 150, // 150g powdered sugar for glaze
          note: 'Powdered sugar for cream cheese glaze',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: milk.id,
          usagePerCup: 200, // 200ml milk
          note: 'Milk for dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: largeBoxes.id,
          usagePerCup: 1, // 1 large box
          note: 'Large bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Blueberry Muffins ingredients
    if (blueberryMuffins && allPurposeFlour && butter && eggs && sugar && bakingPowder && milk && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 250, // 250g flour per dozen
          note: 'All-purpose flour for muffin base',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: butter.id,
          usagePerCup: 80, // 80g butter
          note: 'Melted butter for moisture',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: eggs.id,
          usagePerCup: 2, // 2 eggs
          note: 'Eggs for binding',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: sugar.id,
          usagePerCup: 120, // 120g sugar
          note: 'Sugar for sweetness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: bakingPowder.id,
          usagePerCup: 12, // 12g baking powder
          note: 'Baking powder for rise',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: milk.id,
          usagePerCup: 180, // 180ml milk
          note: 'Milk for moisture',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: blueberryMuffins.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box
          note: 'Small bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Croissants ingredients
    if (croissants && allPurposeFlour && butter && eggs && sugar && yeast && milk && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 300, // 300g flour per batch
          note: 'All-purpose flour for laminated dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: butter.id,
          usagePerCup: 200, // 200g butter for lamination
          note: 'Butter for lamination layers',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: eggs.id,
          usagePerCup: 1, // 1 egg for wash
          note: 'Egg wash for golden color',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: sugar.id,
          usagePerCup: 30, // 30g sugar
          note: 'Sugar for dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: yeast.id,
          usagePerCup: 6, // 6g yeast
          note: 'Yeast for fermentation',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: milk.id,
          usagePerCup: 150, // 150ml milk
          note: 'Milk for dough',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: croissants.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box
          note: 'Small bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Chocolate Brownies ingredients
    if (chocolateBrownies && allPurposeFlour && butter && eggs && sugar && cocoaPowder && chocolateChips && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 150, // 150g flour
          note: 'All-purpose flour for structure',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: butter.id,
          usagePerCup: 180, // 180g butter
          note: 'Butter for fudgy texture',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: eggs.id,
          usagePerCup: 3, // 3 eggs
          note: 'Eggs for binding and richness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: sugar.id,
          usagePerCup: 200, // 200g sugar
          note: 'Sugar for sweetness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: cocoaPowder.id,
          usagePerCup: 50, // 50g cocoa powder
          note: 'Cocoa powder for chocolate flavor',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: chocolateChips.id,
          usagePerCup: 100, // 100g chocolate chips
          note: 'Chocolate chips for extra richness',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateBrownies.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box
          note: 'Small bakery box for packaging',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Apple Pie Slice ingredients
    if (applePieSlice && allPurposeFlour && butter && sugar && cinnamon && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: applePieSlice.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 200, // 200g flour for crust
          note: 'All-purpose flour for pie crust',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: applePieSlice.id,
          ingredientId: butter.id,
          usagePerCup: 120, // 120g butter for crust
          note: 'Cold butter for flaky crust',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: applePieSlice.id,
          ingredientId: sugar.id,
          usagePerCup: 80, // 80g sugar for filling
          note: 'Sugar for apple filling',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: applePieSlice.id,
          ingredientId: cinnamon.id,
          usagePerCup: 8, // 8g cinnamon
          note: 'Cinnamon for apple spice',
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: applePieSlice.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per slice
          note: 'Small bakery box for packaging',
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
    this.updateProgress('Branches', 'Creating bakery branches...')

    const now = new Date().toISOString()
    const branches: Branch[] = [
      {
        id: uuidv4(),
        name: 'Main Bakery',
        location: 'Sweet Dreams Bakery - Downtown Location',
        note: 'Main production facility and storefront with full kitchen',
        businessId: this.businessId!,
        isActive: true,
        businessHoursStart: '05:00',
        businessHoursEnd: '20:00',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Mall Kiosk',
        location: 'Sweet Dreams Express - Central Mall Food Court',
        note: 'Smaller retail location focusing on grab-and-go items',
        businessId: this.businessId!,
        isActive: true,
        businessHoursStart: '09:00',
        businessHoursEnd: '21:00',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.branches.bulkAdd(branches)
  }

  private async seedMenus(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menus', 'Creating bakery menus...')

    const now = new Date().toISOString()
    const menus: Menu[] = [
      {
        id: uuidv4(),
        name: 'Main Bakery Menu',
        description: 'Complete menu for main bakery location',
        status: 'active',
        note: 'Full selection of fresh baked goods and custom orders',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Express Menu',
        description: 'Limited menu for mall kiosk location',
        status: 'active',
        note: 'Quick grab-and-go items for busy shoppers',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.menus.bulkAdd(menus)
  }

  private async seedMenuProducts(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menu Products', 'Adding products to bakery menus...')

    // Get menus and products for reference
    const menus = await db.menus.where('businessId').equals(this.businessId).toArray()
    const products = await db.products.where('businessId').equals(this.businessId).toArray()

    const mainMenu = menus.find(m => m.name === 'Main Bakery Menu')
    const expressMenu = menus.find(m => m.name === 'Express Menu')

    const now = new Date().toISOString()
    const menuProducts: MenuProduct[] = []

    // Add all products to main menu with full pricing
    if (mainMenu) {
      const mainMenuProducts = [
        { product: 'Artisan Sourdough Bread', price: 45000, category: 'Breads', order: 1 },
        { product: 'Chocolate Chip Cookies', price: 35000, category: 'Cookies', order: 2 },
        { product: 'Vanilla Cupcakes', price: 40000, category: 'Cupcakes', order: 3 },
        { product: 'Cinnamon Rolls', price: 38000, category: 'Pastries', order: 4 },
        { product: 'Blueberry Muffins', price: 32000, category: 'Muffins', order: 5 },
        { product: 'Croissants', price: 25000, category: 'Pastries', order: 6 },
        { product: 'Chocolate Brownies', price: 30000, category: 'Desserts', order: 7 },
        { product: 'Apple Pie Slice', price: 28000, category: 'Pies', order: 8 }
      ]

      for (const item of mainMenuProducts) {
        const product = products.find(p => p.name === item.product)
        if (product) {
          menuProducts.push({
            id: uuidv4(),
            menuId: mainMenu.id,
            productId: product.id,
            price: item.price,
            category: item.category,
            displayOrder: item.order,
            note: `${item.product} available at main bakery`,
            businessId: this.businessId!,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

    // Add selected products to express menu with slightly higher pricing
    if (expressMenu) {
      const expressMenuProducts = [
        { product: 'Chocolate Chip Cookies', price: 38000, category: 'Cookies', order: 1 },
        { product: 'Vanilla Cupcakes', price: 42000, category: 'Cupcakes', order: 2 },
        { product: 'Blueberry Muffins', price: 35000, category: 'Muffins', order: 3 },
        { product: 'Croissants', price: 28000, category: 'Pastries', order: 4 },
        { product: 'Chocolate Brownies', price: 32000, category: 'Desserts', order: 5 }
      ]

      for (const item of expressMenuProducts) {
        const product = products.find(p => p.name === item.product)
        if (product) {
          menuProducts.push({
            id: uuidv4(),
            menuId: expressMenu.id,
            productId: product.id,
            price: item.price,
            category: item.category,
            displayOrder: item.order,
            note: `${item.product} available at express location`,
            businessId: this.businessId!,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

    await db.menuProducts.bulkAdd(menuProducts)
  }

  private async seedMenuBranches(): Promise<void> {
    this.currentStep++
    this.updateProgress('Menu Branches', 'Linking menus to bakery branches...')

    const menus = await db.menus.where('businessId').equals(this.businessId).toArray()
    const branches = await db.branches.where('businessId').equals(this.businessId).toArray()

    const mainMenu = menus.find(m => m.name === 'Main Bakery Menu')
    const expressMenu = menus.find(m => m.name === 'Express Menu')
    const mainBranch = branches.find(b => b.name === 'Main Bakery')
    const mallBranch = branches.find(b => b.name === 'Mall Kiosk')

    const now = new Date().toISOString()
    const menuBranches: MenuBranch[] = []

    if (mainMenu && mainBranch) {
      menuBranches.push({
        id: uuidv4(),
        menuId: mainMenu.id,
        branchId: mainBranch.id,
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      })
    }

    if (expressMenu && mallBranch) {
      menuBranches.push({
        id: uuidv4(),
        menuId: expressMenu.id,
        branchId: mallBranch.id,
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      })
    }

    await db.menuBranches.bulkAdd(menuBranches)
  }

  private async seedAssetCategories(): Promise<void> {
    this.currentStep++
    this.updateProgress('Asset Categories', 'Creating bakery asset categories...')

    const now = new Date().toISOString()
    const categories: AssetCategory[] = [
      {
        id: uuidv4(),
        name: 'Baking Equipment',
        description: 'Ovens, mixers, and baking tools',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Refrigeration',
        description: 'Refrigerators, freezers, and cooling equipment',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Display & Storage',
        description: 'Display cases, shelving, and storage solutions',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Point of Sale',
        description: 'Cash registers, payment systems, and POS equipment',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.assetCategories.bulkAdd(categories)
  }

  private async seedFixedAssets(): Promise<void> {
    this.currentStep++
    this.updateProgress('Fixed Assets', 'Creating bakery fixed assets...')

    const categories = await db.assetCategories.where('businessId').equals(this.businessId).toArray()
    const bakingCat = categories.find(c => c.name === 'Baking Equipment')?.id!
    const refrigerationCat = categories.find(c => c.name === 'Refrigeration')?.id!
    const displayCat = categories.find(c => c.name === 'Display & Storage')?.id!
    const posCat = categories.find(c => c.name === 'Point of Sale')?.id!

    const now = new Date().toISOString()
    const purchaseDate = new Date()
    purchaseDate.setMonth(purchaseDate.getMonth() - 8) // 8 months ago

    const assets: FixedAsset[] = [
      {
        id: uuidv4(),
        name: 'Commercial Convection Oven',
        categoryId: bakingCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 85000000, // 85M IDR
        depreciationMonths: 120, // 10 years
        currentValue: 79625000, // Calculated depreciated value
        note: 'Main baking oven for bread and pastries',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Industrial Stand Mixer',
        categoryId: bakingCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 25000000, // 25M IDR
        depreciationMonths: 96, // 8 years
        currentValue: 23333333, // Calculated depreciated value
        note: 'Heavy-duty mixer for dough and batters',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Walk-in Refrigerator',
        categoryId: refrigerationCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 45000000, // 45M IDR
        depreciationMonths: 144, // 12 years
        currentValue: 42500000, // Calculated depreciated value
        note: 'Main refrigeration for ingredients and finished products',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Display Case',
        categoryId: displayCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 15000000, // 15M IDR
        depreciationMonths: 120, // 10 years
        currentValue: 14000000, // Calculated depreciated value
        note: 'Front-of-house display for baked goods',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'POS System',
        categoryId: posCat || '',
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        purchaseCost: 8000000, // 8M IDR
        depreciationMonths: 48, // 4 years
        currentValue: 6666667, // Calculated depreciated value
        note: 'Modern POS system for order processing',
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
    this.updateProgress('Recurring Expenses', 'Creating bakery recurring expenses...')

    const now = new Date().toISOString()
    const expenses: RecurringExpense[] = [
      {
        id: uuidv4(),
        name: 'Equipment Maintenance',
        amount: 2500000, // 2.5M IDR per month
        frequency: 'monthly',
        category: 'maintenance',
        isActive: true,
        businessId: this.businessId!,
        startDate: now,
        note: 'Monthly equipment maintenance and repairs',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Health Department License',
        amount: 1500000, // 1.5M IDR per year
        frequency: 'yearly',
        category: 'licensing',
        isActive: true,
        businessId: this.businessId!,
        startDate: now,
        note: 'Annual health department license renewal',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cleaning Supplies',
        amount: 800000, // 800k IDR per month
        frequency: 'monthly',
        category: 'supplies',
        isActive: true,
        businessId: this.businessId!,
        startDate: now,
        note: 'Monthly cleaning and sanitation supplies',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Packaging Supplies',
        amount: 1200000, // 1.2M IDR per month
        frequency: 'monthly',
        category: 'supplies',
        isActive: true,
        businessId: this.businessId!,
        startDate: now,
        note: 'Monthly packaging and takeaway supplies',
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.recurringExpenses.bulkAdd(expenses)
  }

  private async seedSalesTargets(): Promise<void> {
    this.currentStep++
    this.updateProgress('Sales Targets', 'Creating bakery sales targets...')

    // Get menus, products, and branches for reference
    const menus = await db.menus.where('businessId').equals(this.businessId).toArray()
    const products = await db.products.where('businessId').equals(this.businessId).toArray()
    const branches = await db.branches.where('businessId').equals(this.businessId).toArray()
    const mainMenu = menus.find(m => m.name === 'Main Bakery Menu')

    if (!mainMenu) return

    const now = new Date().toISOString()
    const targets: DailyProductSalesTarget[] = []

    // Create targets for the next 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + i)
      const dateStr = targetDate.toISOString().split('T')[0]

      // Different targets for different days of the week
      const dayOfWeek = targetDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const multiplier = isWeekend ? 1.3 : 1.0 // Higher targets on weekends

      // Create targets for all branches with branch-specific multipliers
      branches.forEach(branch => {
        // Branch multipliers for bakery
        let branchMultiplier = 1
        switch (branch.name) {
          case 'Main Bakery': branchMultiplier = 1.5; break
          case 'Mall Kiosk': branchMultiplier = 1.2; break
          default: branchMultiplier = 1.0
        }

        const productTargets = [
          { name: 'Artisan Sourdough Bread', baseTarget: 15 },
          { name: 'Chocolate Chip Cookies', baseTarget: 25 },
          { name: 'Vanilla Cupcakes', baseTarget: 20 },
          { name: 'Cinnamon Rolls', baseTarget: 18 },
          { name: 'Blueberry Muffins', baseTarget: 22 },
          { name: 'Croissants', baseTarget: 30 },
          { name: 'Chocolate Brownies', baseTarget: 15 },
          { name: 'Apple Pie Slice', baseTarget: 12 }
        ]

        for (const target of productTargets) {
          const product = products.find(p => p.name === target.name)

          if (product) {
            const finalTarget = Math.round(target.baseTarget * multiplier * branchMultiplier)

            targets.push({
              id: uuidv4(),
              menuId: mainMenu.id,
              productId: product.id,
              branchId: branch.id,
              targetDate: dateStr,
              targetQuantity: finalTarget,
              note: `Bakery target for ${product.name} at ${branch.name} on ${dateStr}`,
              businessId: this.businessId!,
              createdAt: now,
              updatedAt: now
            })
          }
        }
      })
    }

    await db.dailyProductSalesTargets.bulkAdd(targets)
  }

  private async seedHistoricalSales(): Promise<void> {
    this.currentStep++
    this.updateProgress('Historical Sales', 'Creating comprehensive bakery sales data...')

    // Get all necessary data for comprehensive sales generation
    const menus = await db.menus.where('businessId').equals(this.businessId).toArray()
    const products = await db.products.where('businessId').equals(this.businessId).toArray()
    const branches = await db.branches.where('businessId').equals(this.businessId).toArray()
    const menuProducts = await db.menuProducts.where('businessId').equals(this.businessId).toArray()

    const now = new Date().toISOString()
    const salesRecords: SalesRecord[] = []

    // Create limited historical sales for the past 15 days to keep total records around 500-1000
    for (let i = 1; i <= 15; i++) {
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - i)
      const dateStr = saleDate.toISOString().split('T')[0]
      const dayOfWeek = saleDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      // Generate sales for each branch
      for (const branch of branches) {
        // Get business hours for this branch (bakery hours: 6 AM - 8 PM)
        const businessHours = this.getBranchBusinessHours(branch)

        // Get menus for this branch
        const branchMenus = menus.filter(menu => {
          if (branch.name === 'Main Bakery') return menu.name === 'Main Bakery Menu'
          if (branch.name === 'Mall Kiosk') return menu.name === 'Express Menu'
          return false
        })

        for (const menu of branchMenus) {
          const branchMenuProducts = menuProducts.filter(mp => mp.menuId === menu.id)
          if (branchMenuProducts.length === 0) continue

          // Determine menu operating hours
          const menuHours = this.getMenuOperatingHours(menu, businessHours)
          if (!menuHours) continue

          // Generate realistic sales throughout the menu's operating hours
          const salesTimes = this.generateBakerySpecificSalesTimes(
            saleDate,
            branch,
            menu,
            menuHours,
            isWeekend
          )

          salesTimes.forEach(saleTime => {
            // Select products based on menu and time-based popularity for bakery
            const selectedProducts = this.selectBakeryProductsForTimeSlot(
              branchMenuProducts,
              saleTime,
              menu.name
            )

            selectedProducts.forEach(({ menuProduct, quantity }) => {
              const product = products.find(p => p.id === menuProduct.productId)
              if (!product) return

              const totalAmount = menuProduct.price * quantity

              salesRecords.push({
                id: uuidv4(),
                menuId: menu.id,
                productId: product.id,
                branchId: branch.id,
                saleDate: dateStr,
                saleTime: saleTime,
                quantity: quantity,
                unitPrice: menuProduct.price,
                totalAmount: totalAmount,
                note: `Bakery sale at ${branch.name} - ${menu.name}`,
                businessId: this.businessId!,
                createdAt: now,
                updatedAt: now
              })
            })
          })
        }
      }
    }

    await db.salesRecords.bulkAdd(salesRecords)
  }

  private async seedWarehouseData(): Promise<void> {
    this.currentStep++
    this.updateProgress('Warehouse Data', 'Creating bakery warehouse inventory...')

    const ingredients = await db.ingredients.where('businessId').equals(this.businessId).toArray()
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
        batchNumber: `BB-${batchDate.getFullYear()}${(batchDate.getMonth() + 1).toString().padStart(2, '0')}${batchDate.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(3, '0')}`,
        dateAdded: batchDate.toISOString().split('T')[0],
        supplier: i === 0 ? 'Premium Flour Mills' : i === 1 ? 'Fresh Dairy Co.' : 'Baking Essentials',
        totalCost: (i + 1) * 5000000, // 5M, 10M, 15M IDR
        note: `Batch ${i + 1} - Weekly ingredient delivery`,
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
      batches.push(batch)

      // Add items to each batch
      const batchIngredients = ingredients.slice(i * 5, (i + 1) * 5) // 5 ingredients per batch
      for (const ingredient of batchIngredients) {
        const quantity = Math.floor(Math.random() * 50) + 20 // 20-70 units
        const unitCost = ingredient.baseUnitCost
        const totalCost = quantity * unitCost

        const warehouseItem: WarehouseItem = {
          id: uuidv4(),
          batchId: batch.id,
          ingredientName: ingredient.name,
          quantity,
          unit: ingredient.unit,
          costPerUnit: unitCost,
          totalCost,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          businessId: this.businessId!,
          createdAt: now,
          updatedAt: now
        }
        warehouseItems.push(warehouseItem)
      }
    }

    // Create current stock levels
    for (const ingredient of ingredients) {
      const currentStock = Math.floor(Math.random() * 100) + 50 // 50-150 units
      const minLevel = Math.floor(currentStock * 0.2) // 20% of current as minimum
      const maxLevel = Math.floor(currentStock * 2) // 200% of current as maximum

      const stockLevel: StockLevel = {
        id: uuidv4(),
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        currentStock,
        reservedStock: Math.floor(Math.random() * 20),
        lowStockThreshold: minLevel,
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
      stockLevels.push(stockLevel)
    }

    // Add all warehouse data
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
    this.updateProgress('Production Data', 'Creating bakery production records...')

    const products = await db.products.where('businessId').equals(this.businessId).toArray()
    const branches = await db.branches.where('businessId').equals(this.businessId).toArray()
    const ingredients = await db.ingredients.where('businessId').equals(this.businessId).toArray()
    const mainBranch = branches.find(b => b.name === 'Main Bakery')

    if (!mainBranch) return

    const now = new Date().toISOString()
    const productionBatches: ProductionBatch[] = []
    const productionItems: ProductionItem[] = []

    // Create production batches for the past 7 days
    for (let i = 1; i <= 7; i++) {
      const productionDate = new Date()
      productionDate.setDate(productionDate.getDate() - i)
      const dateStr = productionDate.toISOString().split('T')[0]

      // Morning production batch
      const morningBatch: ProductionBatch = {
        id: uuidv4(),
        batchNumber: `PB-${dateStr}-AM`,
        productionDate: dateStr,
        branchId: mainBranch.id,
        status: 'Completed',
        startTime: '04:00',
        endTime: '08:00',
        totalCost: 0, // Will be calculated
        note: 'Morning production batch for fresh daily items',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
      productionBatches.push(morningBatch)

      // Afternoon production batch
      const afternoonBatch: ProductionBatch = {
        id: uuidv4(),
        batchNumber: `PB-${dateStr}-PM`,
        productionDate: dateStr,
        branchId: mainBranch.id,
        status: 'completed',
        startTime: '12:00',
        endTime: '16:00',
        totalCost: 0, // Will be calculated
        note: 'Afternoon production batch for next day prep',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
      productionBatches.push(afternoonBatch)

      // Add production items to batches
      const dayOfWeek = productionDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const productionMultiplier = isWeekend ? 1.3 : 1.0

      // Morning batch items (fresh daily items)
      const morningProducts = [
        { name: 'Artisan Sourdough Bread', baseQuantity: 20 },
        { name: 'Croissants', baseQuantity: 40 },
        { name: 'Blueberry Muffins', baseQuantity: 30 }
      ]

      for (const item of morningProducts) {
        const product = products.find(p => p.name === item.name)
        if (product) {
          const quantity = Math.round(item.baseQuantity * productionMultiplier)
          const unitCost = Math.floor(Math.random() * 5000) + 8000 // 8k-13k IDR per unit
          const totalCost = quantity * unitCost

          productionItems.push({
            id: uuidv4(),
            productionBatchId: morningBatch.id,
            ingredientName: product.name,
            quantity,
            unit: 'pieces',
            businessId: this.businessId!,
            createdAt: now,
            updatedAt: now
          })
        }
      }

      // Afternoon batch items (prep items)
      const afternoonProducts = [
        { name: 'Chocolate Chip Cookies', baseQuantity: 35 },
        { name: 'Vanilla Cupcakes', baseQuantity: 25 },
        { name: 'Cinnamon Rolls', baseQuantity: 20 },
        { name: 'Chocolate Brownies', baseQuantity: 18 }
      ]

      for (const item of afternoonProducts) {
        const product = products.find(p => p.name === item.name)
        if (product) {
          const quantity = Math.round(item.baseQuantity * productionMultiplier)
          const unitCost = Math.floor(Math.random() * 4000) + 6000 // 6k-10k IDR per unit
          const totalCost = quantity * unitCost

          productionItems.push({
            id: uuidv4(),
            productionBatchId: afternoonBatch.id,
            ingredientName: product.name,
            quantity,
            unit: 'pieces',
            businessId: this.businessId!,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

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
        name: `Production Cost: Batch ${batch.batchNumber}`,
        value: totalCost,
        category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
        note: `Production costs for batch ${batch.batchNumber}`,
        businessId: this.businessId!,
        createdAt: batch.dateCreated + 'T00:00:00.000Z',
        updatedAt: now
      }
    })

    await db.financialItems.bulkAdd(productionCostItems)
  }

  private async seedPlanningData(): Promise<void> {
    this.currentStep++
    this.updateProgress('Planning Data', 'Creating bakery planning and operational data...')

    const now = new Date().toISOString()
    
    // Create plan templates
    const planTemplates: PlanTemplate[] = [
      {
        id: uuidv4(),
        name: 'Monthly Bakery Operations',
        description: 'Standard monthly operational plan for bakery business',
        type: 'operational',
        category: 'operations',
        isDefault: true,
        estimatedDuration: 30,
        difficulty: 'medium',
        tags: ['operations', 'monthly'],
        note: 'Standard template for monthly operations',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Seasonal Menu Planning',
        description: 'Quarterly menu updates and seasonal product planning',
        type: 'strategic',
        category: 'production',
        isDefault: false,
        estimatedDuration: 90,
        difficulty: 'high',
        tags: ['menu', 'seasonal'],
        note: 'Template for seasonal menu changes',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.planTemplates.bulkAdd(planTemplates)

    // Create operational plans
    const operationalPlans: OperationalPlan[] = [
      {
        id: uuidv4(),
        name: 'February 2024 Operations',
        description: 'Monthly operational plan for February 2024',
        type: 'operational',
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        branchId: null,
        templateId: planTemplates[0].id,
        note: 'February monthly operations plan',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Spring 2024 Menu Launch',
        description: 'Spring seasonal menu planning and launch',
        type: 'strategic',
        status: 'draft',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        branchId: null,
        templateId: planTemplates[1].id,
        note: 'Spring menu launch plan',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.operationalPlans.bulkAdd(operationalPlans)

    // Create plan goals
    const planGoals: PlanGoal[] = [
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        title: 'Increase Daily Sales',
        description: 'Achieve 15% increase in daily sales revenue',
        targetValue: 15,
        currentValue: 8,
        unit: 'percentage',
        category: 'financial',
        priority: 'high',
        dueDate: '2024-02-29',
        completed: false,
        branchId: null,
        linkedTaskIds: [],
        note: 'Focus on increasing daily sales through promotions',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        title: 'Reduce Food Waste',
        description: 'Minimize daily food waste to under 5%',
        targetValue: 5,
        currentValue: 8,
        unit: 'percentage',
        category: 'operational',
        priority: 'medium',
        dueDate: '2024-02-29',
        completed: false,
        branchId: null,
        linkedTaskIds: [],
        note: 'Implement better inventory management',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.planGoals.bulkAdd(planGoals)

    // Create plan tasks
    const planTasks: PlanTask[] = [
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        title: 'Launch Valentine\'s Day Specials',
        description: 'Create and promote special Valentine\'s themed products',
        category: 'marketing',
        priority: 'high',
        status: 'completed',
        assignedTo: 'Head Baker',
        estimatedDuration: 7,
        actualDuration: 6,
        dependencies: [],
        dueDate: '2024-02-14',
        completedAt: '2024-02-13T10:00:00.000Z',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        title: 'Implement Inventory Tracking',
        description: 'Set up better inventory tracking system to reduce waste',
        category: 'operations',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: 'Manager',
        estimatedDuration: 14,
        actualDuration: null,
        dependencies: [],
        dueDate: '2024-02-25',
        completedAt: null,
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.planTasks.bulkAdd(planTasks)

    // Create plan metrics
    const planMetrics: PlanMetric[] = [
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        name: 'Daily Revenue',
        description: 'Track daily revenue performance',
        targetValue: 2500000, // 2.5M IDR daily target
        currentValue: 2200000, // 2.2M IDR current
        unit: 'IDR',
        category: 'financial',
        trackingFrequency: 'daily',
        lastUpdated: '2024-01-31T23:59:59.000Z',
        note: 'Daily revenue tracking metric',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        planId: operationalPlans[0].id,
        name: 'Waste Percentage',
        description: 'Track daily food waste percentage',
        targetValue: 5,
        currentValue: 8,
        unit: 'percentage',
        category: 'operational',
        trackingFrequency: 'daily',
        lastUpdated: '2024-01-31T23:59:59.000Z',
        note: 'Daily waste percentage tracking',
        businessId: this.businessId!,
        createdAt: now,
        updatedAt: now
      }
    ]

    await db.planMetrics.bulkAdd(planMetrics)
  }

  // Bakery-specific business hours and sales patterns
  private getBranchBusinessHours(branch: Branch): { open: number; close: number } {
    // Bakery hours: 6 AM - 8 PM (different from coffee shop)
    switch (branch.name) {
      case 'Main Bakery': return { open: 6, close: 20 }
      case 'Mall Kiosk': return { open: 8, close: 22 }
      default: return { open: 7, close: 19 }
    }
  }

  private getMenuOperatingHours(menu: Menu, businessHours: { open: number; close: number }): { start: number; end: number } | null {
    // Bakery menus operate during full business hours
    switch (menu.name) {
      case 'Main Bakery Menu': return { start: businessHours.open, end: businessHours.close }
      case 'Express Menu': return { start: businessHours.open, end: businessHours.close }
      default: return { start: businessHours.open, end: businessHours.close }
    }
  }

  private generateBakerySpecificSalesTimes(
    date: Date,
    branch: Branch,
    menu: Menu,
    menuHours: { start: number; end: number },
    isWeekend: boolean
  ): string[] {
    const times: string[] = []
    const dayOfWeek = date.getDay()

    // Bakery peak hours: 7-10 AM (morning rush), 3-6 PM (afternoon/evening)
    const morningRushStart = 7
    const morningRushEnd = 10
    const afternoonRushStart = 15
    const afternoonRushEnd = 18

    // Generate sales throughout the day with realistic bakery patterns
    for (let hour = menuHours.start; hour < menuHours.end; hour++) {
      let salesInHour = 0

      // Determine sales frequency based on time and day
      if (hour >= morningRushStart && hour <= morningRushEnd) {
        // Morning rush - fresh bread and pastries
        salesInHour = isWeekend ? 4 : 6
      } else if (hour >= afternoonRushStart && hour <= afternoonRushEnd) {
        // Afternoon rush - desserts and treats
        salesInHour = isWeekend ? 5 : 4
      } else if (hour >= 11 && hour <= 14) {
        // Lunch time - moderate sales
        salesInHour = 2
      } else {
        // Off-peak hours
        salesInHour = 1
      }

      // Weekend adjustment
      if (isWeekend) {
        salesInHour = Math.round(salesInHour * 1.3)
      }

      // Branch-specific multipliers
      switch (branch.name) {
        case 'Main Bakery': salesInHour = Math.round(salesInHour * 1.5); break
        case 'Mall Kiosk': salesInHour = Math.round(salesInHour * 1.2); break
      }

      // Generate random times within the hour
      for (let i = 0; i < salesInHour; i++) {
        const minute = Math.floor(Math.random() * 60)
        const second = Math.floor(Math.random() * 60)
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`)
      }
    }

    return times
  }

  private selectBakeryProductsForTimeSlot(
    menuProducts: MenuProduct[],
    saleTime: string,
    menuName: string
  ): Array<{ menuProduct: MenuProduct; quantity: number }> {
    const hour = parseInt(saleTime.split(':')[0])
    const selections: Array<{ menuProduct: MenuProduct; quantity: number }> = []

    // Number of products in this sale (usually 1-2 for bakery)
    const numProducts = Math.random() < 0.8 ? 1 : 2

    for (let i = 0; i < numProducts; i++) {
      // Select product based on time and menu for bakery
      const selectedMenuProduct = this.selectBakeryProductForTimeAndMenu(menuProducts, hour, menuName)
      if (selectedMenuProduct) {
        const quantity = Math.random() < 0.9 ? 1 : Math.random() < 0.8 ? 2 : 3
        selections.push({ menuProduct: selectedMenuProduct, quantity })
      }
    }

    return selections
  }

  private selectBakeryProductForTimeAndMenu(menuProducts: MenuProduct[], hour: number, menuName: string): MenuProduct | null {
    if (menuProducts.length === 0) return null

    // Time-based product preferences for bakery
    const timePreferences: { [key: string]: number } = {}

    if (hour >= 6 && hour <= 10) {
      // Morning preferences - fresh bread and breakfast items
      timePreferences['Artisan Sourdough Bread'] = 4
      timePreferences['Croissants'] = 4
      timePreferences['Cinnamon Rolls'] = 3
      timePreferences['Blueberry Muffins'] = 3
      timePreferences['Vanilla Cupcakes'] = 1
    } else if (hour >= 11 && hour <= 14) {
      // Lunch preferences - light items
      timePreferences['Croissants'] = 2
      timePreferences['Artisan Sourdough Bread'] = 2
      timePreferences['Chocolate Chip Cookies'] = 2
      timePreferences['Apple Pie Slice'] = 1
    } else if (hour >= 15 && hour <= 18) {
      // Afternoon/evening preferences - desserts and treats
      timePreferences['Chocolate Chip Cookies'] = 4
      timePreferences['Vanilla Cupcakes'] = 4
      timePreferences['Chocolate Brownies'] = 3
      timePreferences['Apple Pie Slice'] = 3
      timePreferences['Cinnamon Rolls'] = 2
    } else {
      // Off-peak preferences
      timePreferences['Chocolate Chip Cookies'] = 2
      timePreferences['Vanilla Cupcakes'] = 2
      timePreferences['Artisan Sourdough Bread'] = 1
    }

    // Create weighted array of menu products
    const weightedProducts: MenuProduct[] = []

    menuProducts.forEach(mp => {
      // Find the product to get its name
      const productName = this.getBakeryProductNameById(mp.productId)
      const weight = timePreferences[productName] || 1

      for (let w = 0; w < weight; w++) {
        weightedProducts.push(mp)
      }
    })

    return weightedProducts[Math.floor(Math.random() * weightedProducts.length)]
  }

  private getBakeryProductNameById(productId: string): string {
    // This is a simplified lookup - in a real implementation, you'd cache the products
    // For now, we'll use a simple mapping based on common bakery product names
    const productNames = [
      'Artisan Sourdough Bread', 'Chocolate Chip Cookies', 'Vanilla Cupcakes',
      'Cinnamon Rolls', 'Blueberry Muffins', 'Croissants', 'Chocolate Brownies', 'Apple Pie Slice'
    ]
    return productNames[Math.floor(Math.random() * productNames.length)]
  }
}

/**
 * Export function to seed a comprehensive bakery business
 */
export async function seedComprehensiveBakeryBusiness(progressCallback?: ProgressCallback): Promise<string> {
  const seeder = new ComprehensiveBakerySeeder(progressCallback)
  return await seeder.seedBakeryBusiness()
}