import { db } from './index'
import { v4 as uuidv4 } from 'uuid'
import type {
  Business, Branch, Ingredient, IngredientCategory, Product, ProductIngredient,
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
 * Bakery business seeder that creates realistic test data
 * for a bakery business with proper multi-business support
 */
export class BakerySeeder {
  private progressCallback?: ProgressCallback
  private currentStep = 0
  private totalSteps = 8 // Starting with products only, will expand later
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
   * Seed the bakery business data
   */
  async seedBakeryBusiness(): Promise<string> {
    try {
      this.currentStep = 0

      // Seed in dependency order
      await this.seedBusiness()
      await this.seedIngredientCategories()
      await this.seedIngredients()
      await this.seedProducts()
      await this.seedProductIngredients()
      await this.seedBranches()
      await this.seedMenus()
      await this.seedMenuProducts()

      this.updateProgress('Complete', 'Bakery business seeding completed successfully!', true)
      return this.businessId
    } catch (error) {
      this.updateProgress('Error', `Bakery seeding failed: ${error.message}`, true, error.message)
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
      createdAt: now,
      updatedAt: now
    }

    await db.businesses.add(business)
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
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dairy & Eggs',
        description: 'Milk, butter, eggs, and other dairy products',
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Sweeteners & Sugars',
        description: 'Various types of sugar and sweetening agents',
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Fats & Oils',
        description: 'Butter, oils, and other fats for baking',
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Leavening Agents',
        description: 'Yeast, baking powder, and other rising agents',
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Flavorings & Extracts',
        description: 'Vanilla, chocolate, spices, and flavor extracts',
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Packaging & Containers',
        description: 'Boxes, bags, and packaging materials',
        businessId: this.businessId,
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
    const fatsCat = categories.find(c => c.name === 'Fats & Oils')?.id
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Fats & Oils
      {
        id: uuidv4(),
        name: 'Vegetable Oil',
        baseUnitCost: 20000, // 20k IDR per liter
        baseUnitQuantity: 1000, // 1000ml
        unit: 'ml',
        category: fatsCat,
        supplierInfo: 'Cooking Oils Ltd.',
        note: 'Neutral vegetable oil for baking',
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Baking Soda',
        baseUnitCost: 8000, // 8k IDR per 200g
        baseUnitQuantity: 200, // 200g
        unit: 'g',
        category: leavenCat,
        supplierInfo: 'Baking Essentials',
        note: 'Sodium bicarbonate for leavening',
        businessId: this.businessId,
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
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Dark Chocolate Chips',
        baseUnitCost: 60000, // 60k IDR per kg
        baseUnitQuantity: 1000, // 1000g
        unit: 'g',
        category: flavorCat,
        supplierInfo: 'Premium Chocolate Co.',
        note: 'High-quality dark chocolate chips',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cinnamon Powder',
        baseUnitCost: 35000, // 35k IDR per 200g
        baseUnitQuantity: 200, // 200g
        unit: 'g',
        category: flavorCat,
        supplierInfo: 'Spice World',
        note: 'Ground cinnamon for flavoring',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      // Packaging & Containers
      {
        id: uuidv4(),
        name: 'Bakery Boxes (Small)',
        baseUnitCost: 200000, // 200k IDR per 100 boxes
        baseUnitQuantity: 100, // 100 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'EcoPack Solutions',
        note: 'Small bakery boxes for pastries and cupcakes',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Bakery Boxes (Large)',
        baseUnitCost: 300000, // 300k IDR per 100 boxes
        baseUnitQuantity: 100, // 100 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'EcoPack Solutions',
        note: 'Large bakery boxes for cakes and bread',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Paper Bags',
        baseUnitCost: 150000, // 150k IDR per 500 bags
        baseUnitQuantity: 500, // 500 pieces
        unit: 'piece',
        category: packagingCat,
        supplierInfo: 'EcoPack Solutions',
        note: 'Brown paper bags with bakery logo',
        businessId: this.businessId,
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
        note: 'Made with our signature sourdough starter, 24-hour fermentation',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Chocolate Chip Cookies',
        description: 'Classic chocolate chip cookies with premium chocolate',
        note: 'Soft and chewy texture with dark chocolate chips',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Vanilla Cupcakes',
        description: 'Fluffy vanilla cupcakes with buttercream frosting',
        note: 'Made with pure vanilla extract and topped with vanilla buttercream',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cinnamon Rolls',
        description: 'Warm cinnamon rolls with cream cheese glaze',
        note: 'Soft yeast dough rolled with cinnamon sugar filling',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Blueberry Muffins',
        description: 'Fresh blueberry muffins with streusel topping',
        note: 'Bursting with fresh blueberries and a crunchy top',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Croissants',
        description: 'Buttery, flaky French croissants',
        note: 'Laminated dough with multiple butter layers for perfect flakiness',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Chocolate Brownies',
        description: 'Rich, fudgy chocolate brownies',
        note: 'Dense and chocolatey with a perfect chewy texture',
        businessId: this.businessId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Apple Pie Slice',
        description: 'Classic apple pie with cinnamon and flaky crust',
        note: 'Made with fresh apples and our signature pie crust',
        businessId: this.businessId,
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

    const breadFlour = ingredients.find(i => i.name === 'Bread Flour')
    const allPurposeFlour = ingredients.find(i => i.name === 'All-Purpose Flour')
    const cakeFlour = ingredients.find(i => i.name === 'Cake Flour')
    const eggs = ingredients.find(i => i.name === 'Fresh Eggs')
    const butter = ingredients.find(i => i.name === 'Unsalted Butter')
    const milk = ingredients.find(i => i.name === 'Whole Milk')
    const sugar = ingredients.find(i => i.name === 'Granulated Sugar')
    const brownSugar = ingredients.find(i => i.name === 'Brown Sugar')
    const powderedSugar = ingredients.find(i => i.name === 'Powdered Sugar')
    const yeast = ingredients.find(i => i.name === 'Active Dry Yeast')
    const bakingPowder = ingredients.find(i => i.name === 'Baking Powder')
    const vanilla = ingredients.find(i => i.name === 'Pure Vanilla Extract')
    const chocolateChips = ingredients.find(i => i.name === 'Dark Chocolate Chips')
    const cinnamon = ingredients.find(i => i.name === 'Cinnamon Powder')
    const smallBoxes = ingredients.find(i => i.name === 'Bakery Boxes (Small)')
    const largeBoxes = ingredients.find(i => i.name === 'Bakery Boxes (Large)')
    const paperBags = ingredients.find(i => i.name === 'Paper Bags')

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
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: sourdoughBread.id,
          ingredientId: yeast.id,
          usagePerCup: 5, // 5g yeast per loaf
          note: 'Active dry yeast for fermentation',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: sourdoughBread.id,
          ingredientId: largeBoxes.id,
          usagePerCup: 1, // 1 box per loaf
          note: 'Large bakery box for packaging',
          businessId: this.businessId,
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
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: butter.id,
          usagePerCup: 150, // 150g butter per dozen
          note: 'Unsalted butter for rich flavor',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: eggs.id,
          usagePerCup: 2, // 2 eggs per dozen
          note: 'Fresh eggs for binding',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: sugar.id,
          usagePerCup: 100, // 100g granulated sugar
          note: 'Granulated sugar for sweetness',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: brownSugar.id,
          usagePerCup: 100, // 100g brown sugar
          note: 'Brown sugar for moisture and flavor',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: chocolateChips.id,
          usagePerCup: 200, // 200g chocolate chips
          note: 'Dark chocolate chips for rich flavor',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: chocolateChipCookies.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per dozen
          note: 'Small bakery box for packaging',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Vanilla Cupcakes ingredients (per dozen)
    if (vanillaCupcakes && cakeFlour && butter && eggs && sugar && milk && vanilla && powderedSugar && bakingPowder && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: cakeFlour.id,
          usagePerCup: 200, // 200g cake flour per dozen
          note: 'Cake flour for tender texture',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: butter.id,
          usagePerCup: 120, // 120g butter per dozen
          note: 'Unsalted butter for cake and frosting',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: eggs.id,
          usagePerCup: 3, // 3 eggs per dozen
          note: 'Fresh eggs for structure',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: sugar.id,
          usagePerCup: 150, // 150g sugar for cake
          note: 'Granulated sugar for sweetness',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: powderedSugar.id,
          usagePerCup: 200, // 200g powdered sugar for frosting
          note: 'Powdered sugar for buttercream frosting',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: milk.id,
          usagePerCup: 120, // 120ml milk
          note: 'Whole milk for moisture',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: vanilla.id,
          usagePerCup: 10, // 10ml vanilla extract
          note: 'Pure vanilla extract for flavor',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: bakingPowder.id,
          usagePerCup: 8, // 8g baking powder
          note: 'Baking powder for leavening',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: vanillaCupcakes.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per dozen
          note: 'Small bakery box for packaging',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        }
      )
    }

    // Cinnamon Rolls ingredients (per 6 rolls)
    if (cinnamonRolls && allPurposeFlour && butter && eggs && sugar && brownSugar && milk && yeast && cinnamon && smallBoxes) {
      productIngredients.push(
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: allPurposeFlour.id,
          usagePerCup: 300, // 300g flour per 6 rolls
          note: 'All-purpose flour for yeast dough',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: butter.id,
          usagePerCup: 100, // 100g butter for dough and filling
          note: 'Unsalted butter for rich dough',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: eggs.id,
          usagePerCup: 1, // 1 egg per 6 rolls
          note: 'Fresh egg for enriched dough',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: sugar.id,
          usagePerCup: 50, // 50g sugar for dough
          note: 'Granulated sugar for dough sweetness',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: brownSugar.id,
          usagePerCup: 80, // 80g brown sugar for filling
          note: 'Brown sugar for cinnamon filling',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: milk.id,
          usagePerCup: 150, // 150ml milk
          note: 'Warm milk for yeast activation',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: yeast.id,
          usagePerCup: 7, // 7g yeast
          note: 'Active dry yeast for rising',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: cinnamon.id,
          usagePerCup: 15, // 15g cinnamon powder
          note: 'Ground cinnamon for filling',
          businessId: this.businessId,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          productId: cinnamonRolls.id,
          ingredientId: smallBoxes.id,
          usagePerCup: 1, // 1 small box per 6 rolls
          note: 'Small bakery box for packaging',
          businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
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
        businessId: this.businessId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Express Menu',
        description: 'Limited menu for mall kiosk location',
        status: 'active',
        note: 'Quick grab-and-go items for busy shoppers',
        businessId: this.businessId,
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
            businessId: this.businessId,
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
            businessId: this.businessId,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

    await db.menuProducts.bulkAdd(menuProducts)
  }
}