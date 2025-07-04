import { db } from './index'
import { FINANCIAL_ITEM_CATEGORIES, APP_SETTING_KEYS, type FinancialItem, type BonusScheme, type AppSetting } from './schema'

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

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Export the seed function for use in other files
export { seedDatabase }
