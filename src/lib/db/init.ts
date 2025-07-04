import { initializeDatabase } from './index'
import { AppSettingsService } from '../services/appSettingsService'
import { seedDatabase } from './seed'

let isInitialized = false

export async function ensureDatabaseInitialized(): Promise<void> {
  if (isInitialized) {
    return
  }

  try {
    await initializeDatabase()
    await seedDatabase() // Seed the database with default data
    await AppSettingsService.ensureDefaults()
    isInitialized = true
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
