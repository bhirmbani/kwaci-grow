import Dexie, { type EntityTable } from 'dexie'
import type { FinancialItem, BonusScheme, AppSetting } from './schema'

// Define the database class
export class FinancialDashboardDB extends Dexie {
  // Define table types
  financialItems!: EntityTable<FinancialItem, 'id'>
  bonusSchemes!: EntityTable<BonusScheme, 'id'>
  appSettings!: EntityTable<AppSetting, 'id'>

  constructor() {
    super('FinancialDashboardDB')

    // Define schemas
    this.version(1).stores({
      financialItems: 'id, name, category, value, note, createdAt, updatedAt',
      bonusSchemes: '++id, target, perCup, baristaCount, note, createdAt, updatedAt',
      appSettings: '++id, &key, value, createdAt, updatedAt'
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
