import { db } from './index'
import { FINANCIAL_ITEM_CATEGORIES, APP_SETTING_KEYS, type FinancialItem, type BonusScheme, type AppSetting, type Product, type Ingredient, type ProductIngredient } from './schema'
import { v4 as uuidv4 } from 'uuid'

// Default data matching the current hardcoded values in App.tsx
const createDefaultFinancialItems = (): FinancialItem[] => {
  const now = new Date().toISOString()
  return [
    // Initial Capital
    {
      id: '1',
      name: 'Electric Cargo Bike',
      value: 19500000,
      category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
      note: '',
      createdAt: now,
      updatedAt: now,
    },
    // Fixed Costs
    {
      id: '2',
      name: 'Depreciation (2-year)',
      value: 812500,
      category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
      note: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '3',
      name: 'Warehouse Rent',
      value: 1000000,
      category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
      note: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '4',
      name: 'Barista Salary',
      value: 2000000,
      category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
      note: '',
      createdAt: now,
      updatedAt: now,
    },
    // Variable COGS with calculation parameters
    {
      id: '5',
      name: 'Milk (100ml)',
      value: 2000, // Calculated: (20000 / 1000) * 100 = 2000
      category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
      note: '',
      createdAt: now,
      updatedAt: now,
      baseUnitCost: 20000, // 20,000 IDR per liter
      baseUnitQuantity: 1000, // 1000 ml
      usagePerCup: 100, // 100 ml per cup
      unit: 'ml',
    },
    {
      id: '6',
      name: 'Coffee Beans (5g)',
      value: 1000, // Calculated: (200000 / 1000) * 5 = 1000
      category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
      note: '',
      createdAt: now,
      updatedAt: now,
      baseUnitCost: 200000, // 200,000 IDR per kg
      baseUnitQuantity: 1000, // 1000 g
      usagePerCup: 5, // 5 g per cup
      unit: 'g',
    },
    {
      id: '7',
      name: 'Palm Sugar (10ml)',
      value: 485, // Calculated: (48500 / 1000) * 10 = 485
      category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
      note: '',
      createdAt: now,
      updatedAt: now,
      baseUnitCost: 48500, // 48,500 IDR per liter
      baseUnitQuantity: 1000, // 1000 ml
      usagePerCup: 10, // 10 ml per cup
      unit: 'ml',
    },
    {
      id: '8',
      name: 'Cup + Lid',
      value: 850, // Calculated: (850 / 1) * 1 = 850
      category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
      note: '',
      createdAt: now,
      updatedAt: now,
      baseUnitCost: 850, // 850 IDR per piece
      baseUnitQuantity: 1, // 1 piece
      usagePerCup: 1, // 1 piece per cup
      unit: 'piece',
    },
    {
      id: '9',
      name: 'Ice Cubes (100g)',
      value: 292, // Calculated: (2920 / 1000) * 100 = 292
      category: FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS,
      note: '',
      createdAt: now,
      updatedAt: now,
      baseUnitCost: 2920, // 2,920 IDR per kg
      baseUnitQuantity: 1000, // 1000 g
      usagePerCup: 100, // 100 g per cup
      unit: 'g',
    },
  ]
}

const createDefaultBonusScheme = (): BonusScheme => {
  const now = new Date().toISOString()
  return {
    target: 1320,
    perCup: 500,
    baristaCount: 1,
    note: '',
    createdAt: now,
    updatedAt: now,
  }
}

const createDefaultAppSettings = (): AppSetting[] => {
  const now = new Date().toISOString()
  return [
    {
      key: APP_SETTING_KEYS.DAYS_PER_MONTH,
      value: '22',
      createdAt: now,
      updatedAt: now,
    },
    {
      key: APP_SETTING_KEYS.PRICE_PER_CUP,
      value: '8000',
      createdAt: now,
      updatedAt: now,
    },
    {
      key: APP_SETTING_KEYS.DAILY_TARGET_CUPS,
      value: '60', // Default target of 60 cups per day
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// Create realistic coffee shop ingredients
const createDefaultIngredients = (): Ingredient[] => {
  const now = new Date().toISOString()
  return [
    {
      id: 'ingredient-coffee-beans',
      name: 'Coffee Beans',
      baseUnitCost: 150000, // 150,000 IDR per kg
      baseUnitQuantity: 1000, // 1000 g
      unit: 'g',
      supplierInfo: 'Local coffee roaster',
      category: 'Coffee',
      note: 'Premium arabica coffee beans',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ingredient-milk',
      name: 'Milk',
      baseUnitCost: 20000, // 20,000 IDR per liter
      baseUnitQuantity: 1000, // 1000 ml
      unit: 'ml',
      supplierInfo: 'Local dairy supplier',
      category: 'Dairy',
      note: 'Fresh whole milk',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ingredient-palm-sugar',
      name: 'Palm Sugar',
      baseUnitCost: 25000, // 25,000 IDR per kg
      baseUnitQuantity: 1000, // 1000 g
      unit: 'g',
      supplierInfo: 'Traditional palm sugar producer',
      category: 'Sweetener',
      note: 'Natural palm sugar syrup',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ingredient-ice-cubes',
      name: 'Ice Cubes',
      baseUnitCost: 5000, // 5,000 IDR per kg
      baseUnitQuantity: 1000, // 1000 g
      unit: 'g',
      supplierInfo: 'Ice supplier',
      category: 'Cooling',
      note: 'Clean ice cubes',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ingredient-cup-lid',
      name: 'Cup + Lid',
      baseUnitCost: 1000, // 1,000 IDR per piece
      baseUnitQuantity: 1, // 1 piece
      unit: 'piece',
      supplierInfo: 'Packaging supplier',
      category: 'Packaging',
      note: 'Disposable cup with lid',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ingredient-amidis',
      name: 'Amidis (Flavor Enhancer)',
      baseUnitCost: 15000, // 15,000 IDR per 100ml
      baseUnitQuantity: 100, // 100 ml
      unit: 'ml',
      supplierInfo: 'Flavor supplier',
      category: 'Additive',
      note: 'Coffee flavor enhancer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// Create realistic coffee shop products
const createDefaultProducts = (): Product[] => {
  const now = new Date().toISOString()
  return [
    {
      id: 'product-espresso',
      name: 'Espresso',
      description: 'Strong black coffee shot',
      note: 'Classic espresso made with premium coffee beans',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'product-latte',
      name: 'Latte',
      description: 'Espresso with steamed milk',
      note: 'Smooth and creamy coffee with milk',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'product-iced-coffee',
      name: 'Iced Coffee',
      description: 'Cold coffee with ice and palm sugar',
      note: 'Refreshing iced coffee with natural sweetener',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'product-coffee-special',
      name: 'Coffee Special',
      description: 'Premium coffee with flavor enhancer',
      note: 'Special blend with amidis for enhanced flavor',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// Create product-ingredient relationships
const createDefaultProductIngredients = (): ProductIngredient[] => {
  const now = new Date().toISOString()
  return [
    // Espresso ingredients
    {
      id: 'pi-espresso-coffee',
      productId: 'product-espresso',
      ingredientId: 'ingredient-coffee-beans',
      usagePerCup: 7, // 7g coffee beans per espresso
      note: 'Standard espresso shot',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-espresso-cup',
      productId: 'product-espresso',
      ingredientId: 'ingredient-cup-lid',
      usagePerCup: 1, // 1 cup per serving
      note: 'Serving cup',
      createdAt: now,
      updatedAt: now,
    },

    // Latte ingredients
    {
      id: 'pi-latte-coffee',
      productId: 'product-latte',
      ingredientId: 'ingredient-coffee-beans',
      usagePerCup: 7, // 7g coffee beans
      note: 'Espresso base for latte',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-latte-milk',
      productId: 'product-latte',
      ingredientId: 'ingredient-milk',
      usagePerCup: 150, // 150ml steamed milk
      note: 'Steamed milk for latte',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-latte-cup',
      productId: 'product-latte',
      ingredientId: 'ingredient-cup-lid',
      usagePerCup: 1, // 1 cup per serving
      note: 'Serving cup',
      createdAt: now,
      updatedAt: now,
    },

    // Iced Coffee ingredients
    {
      id: 'pi-iced-coffee-coffee',
      productId: 'product-iced-coffee',
      ingredientId: 'ingredient-coffee-beans',
      usagePerCup: 5, // 5g coffee beans for iced coffee
      note: 'Coffee base for iced coffee',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-iced-coffee-ice',
      productId: 'product-iced-coffee',
      ingredientId: 'ingredient-ice-cubes',
      usagePerCup: 100, // 100g ice cubes
      note: 'Ice for cooling',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-iced-coffee-sugar',
      productId: 'product-iced-coffee',
      ingredientId: 'ingredient-palm-sugar',
      usagePerCup: 10, // 10g palm sugar
      note: 'Natural sweetener',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-iced-coffee-cup',
      productId: 'product-iced-coffee',
      ingredientId: 'ingredient-cup-lid',
      usagePerCup: 1, // 1 cup per serving
      note: 'Serving cup',
      createdAt: now,
      updatedAt: now,
    },

    // Coffee Special ingredients
    {
      id: 'pi-special-coffee',
      productId: 'product-coffee-special',
      ingredientId: 'ingredient-coffee-beans',
      usagePerCup: 6, // 6g coffee beans
      note: 'Premium coffee base',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-special-milk',
      productId: 'product-coffee-special',
      ingredientId: 'ingredient-milk',
      usagePerCup: 100, // 100ml milk
      note: 'Milk for creaminess',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-special-amidis',
      productId: 'product-coffee-special',
      ingredientId: 'ingredient-amidis',
      usagePerCup: 2, // 2ml amidis
      note: 'Flavor enhancer',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pi-special-cup',
      productId: 'product-coffee-special',
      ingredientId: 'ingredient-cup-lid',
      usagePerCup: 1, // 1 cup per serving
      note: 'Serving cup',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

async function seedProductManagement() {
  try {
    console.log('Starting product management seeding...')

    // Check if ingredients already exist
    const ingredientsCount = await db.ingredients.count()
    if (ingredientsCount === 0) {
      console.log('Seeding ingredients...')
      const defaultIngredients = createDefaultIngredients()
      await db.ingredients.bulkAdd(defaultIngredients)
      console.log(`Inserted ${defaultIngredients.length} ingredients`)
    } else {
      console.log('Ingredients already exist, skipping...')
    }

    // Check if products already exist
    const productsCount = await db.products.count()
    if (productsCount === 0) {
      console.log('Seeding products...')
      const defaultProducts = createDefaultProducts()
      await db.products.bulkAdd(defaultProducts)
      console.log(`Inserted ${defaultProducts.length} products`)
    } else {
      console.log('Products already exist, skipping...')
    }

    // Check if product-ingredient relationships already exist
    const productIngredientsCount = await db.productIngredients.count()
    if (productIngredientsCount === 0) {
      console.log('Seeding product-ingredient relationships...')
      const defaultProductIngredients = createDefaultProductIngredients()
      await db.productIngredients.bulkAdd(defaultProductIngredients)
      console.log(`Inserted ${defaultProductIngredients.length} product-ingredient relationships`)
    } else {
      console.log('Product-ingredient relationships already exist, skipping...')
    }

    console.log('Product management seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding product management:', error)
    throw error
  }
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')

    // Check if financial items already exist
    const financialItemsCount = await db.financialItems.count()

    if (financialItemsCount === 0) {
      console.log('Seeding financial items...')
      const defaultFinancialItems = createDefaultFinancialItems()
      await db.financialItems.bulkAdd(defaultFinancialItems)
      console.log(`Inserted ${defaultFinancialItems.length} financial items`)
    } else {
      console.log('Financial items already exist, skipping...')
    }

    // Check if bonus scheme already exists
    const bonusSchemeCount = await db.bonusSchemes.count()

    if (bonusSchemeCount === 0) {
      console.log('Seeding bonus scheme...')
      const defaultBonusScheme = createDefaultBonusScheme()
      await db.bonusSchemes.add(defaultBonusScheme)
      console.log('Inserted default bonus scheme')
    } else {
      console.log('Bonus scheme already exists, skipping...')
    }

    // Check if app settings already exist
    const appSettingsCount = await db.appSettings.count()

    if (appSettingsCount === 0) {
      console.log('Seeding app settings...')
      const defaultAppSettings = createDefaultAppSettings()
      await db.appSettings.bulkAdd(defaultAppSettings)
      console.log(`Inserted ${defaultAppSettings.length} app settings`)
    } else {
      console.log('App settings already exist, skipping...')
    }

    // Seed product management data
    await seedProductManagement()

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Export the seed functions for use in other files
export { seedDatabase, seedProductManagement }
