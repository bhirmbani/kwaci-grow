import { db } from './index'
import { v4 as uuidv4 } from 'uuid'
import { ComprehensiveSeeder } from './comprehensiveSeeder'
import { seedComprehensiveBakeryBusiness } from './comprehensiveBakerySeeder'
import type { Business } from './schema'
import type { SeedingProgress, ProgressCallback } from './comprehensiveSeeder'

export interface BusinessSeedingResult {
  businessId: string
  businessName: string
  businessType: string
  success: boolean
  error?: string
}

export interface MultiBusinessSeedingProgress extends SeedingProgress {
  currentBusiness?: string
  businessesCompleted: number
  totalBusinesses: number
}

export type MultiBusinessProgressCallback = (progress: MultiBusinessSeedingProgress) => void

/**
 * Multi-business seeder that supports creating multiple business types
 * with proper data isolation and business-specific content
 */
export class MultiBusinessSeeder {
  private progressCallback?: MultiBusinessProgressCallback
  private businessesCompleted = 0
  private totalBusinesses = 0
  private currentBusinessName = ''

  constructor(progressCallback?: MultiBusinessProgressCallback) {
    this.progressCallback = progressCallback
  }

  private updateProgress(
    step: string,
    message: string,
    progress: number,
    total: number,
    completed = false,
    error?: string
  ) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        progress,
        total,
        message,
        completed,
        error,
        currentBusiness: this.currentBusinessName,
        businessesCompleted: this.businessesCompleted,
        totalBusinesses: this.totalBusinesses
      })
    }
  }

  /**
   * Seed multiple businesses with different types
   */
  async seedMultipleBusinesses(
    businessTypes: Array<'coffee' | 'bakery'>,
    clearFirst = true
  ): Promise<BusinessSeedingResult[]> {
    const results: BusinessSeedingResult[] = []
    this.totalBusinesses = businessTypes.length
    this.businessesCompleted = 0

    try {
      // Clear all data if requested
      if (clearFirst) {
        this.updateProgress('Clearing', 'Clearing existing data...', 0, 1)
        await this.clearAllData()
      }

      // Seed each business type
      for (let i = 0; i < businessTypes.length; i++) {
        const businessType = businessTypes[i]
        this.currentBusinessName = this.getBusinessName(businessType)
        
        try {
          this.updateProgress(
            'Business Setup',
            `Starting ${this.currentBusinessName} setup (${i + 1}/${businessTypes.length})...`,
            i,
            businessTypes.length
          )

          let businessId: string
          
          if (businessType === 'coffee') {
            businessId = await this.seedCoffeeBusiness()
          } else if (businessType === 'bakery') {
            businessId = await this.seedBakeryBusiness()
          } else {
            throw new Error(`Unsupported business type: ${businessType}`)
          }

          results.push({
            businessId,
            businessName: this.currentBusinessName,
            businessType,
            success: true
          })

          this.businessesCompleted++
          
          this.updateProgress(
            'Business Complete',
            `${this.currentBusinessName} completed successfully (${this.businessesCompleted}/${businessTypes.length})`,
            i + 1,
            businessTypes.length
          )
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          results.push({
            businessId: '',
            businessName: this.currentBusinessName,
            businessType,
            success: false,
            error: errorMessage
          })
          
          this.updateProgress(
            'Business Error',
            `${this.currentBusinessName} failed: ${errorMessage}`,
            i + 1,
            businessTypes.length,
            false,
            errorMessage
          )
          
          // Continue with next business instead of stopping
          console.error(`Failed to seed ${this.currentBusinessName}:`, error)
        }
      }

      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length
      
      this.updateProgress(
        'Complete',
        `Multi-business seeding completed! ${successCount} succeeded, ${failureCount} failed`,
        this.totalBusinesses,
        this.totalBusinesses,
        true
      )

      return results
      
    } catch (error) {
      this.updateProgress(
        'Error',
        `Multi-business seeding failed: ${error instanceof Error ? error.message : String(error)}`,
        this.businessesCompleted,
        this.totalBusinesses,
        true,
        error instanceof Error ? error.message : String(error)
      )
      throw error
    }
  }

  /**
   * Seed a single business by type
   */
  async seedSingleBusiness(
    businessType: 'coffee' | 'bakery',
    clearFirst = false
  ): Promise<BusinessSeedingResult> {
    this.totalBusinesses = 1
    this.businessesCompleted = 0
    this.currentBusinessName = this.getBusinessName(businessType)

    try {
      if (clearFirst) {
        this.updateProgress('Clearing', 'Clearing existing data...', 0, 1)
        await this.clearAllData()
      }

      this.updateProgress(
        'Business Setup',
        `Setting up ${this.currentBusinessName}...`,
        0,
        1
      )

      let businessId: string
      
      if (businessType === 'coffee') {
        businessId = await this.seedCoffeeBusiness()
      } else if (businessType === 'bakery') {
        businessId = await this.seedBakeryBusiness()
      } else {
        throw new Error(`Unsupported business type: ${businessType}`)
      }

      this.businessesCompleted = 1
      this.updateProgress(
        'Complete',
        `${this.currentBusinessName} seeding completed!`,
        1,
        1,
        true
      )

      return {
        businessId,
        businessName: this.currentBusinessName,
        businessType,
        success: true
      }
      
    } catch (error) {
      this.updateProgress(
        'Error',
        `${this.currentBusinessName} seeding failed: ${error instanceof Error ? error.message : String(error)}`,
        0,
        1,
        true,
        error instanceof Error ? error.message : String(error)
      )
      
      return {
        businessId: '',
        businessName: this.currentBusinessName,
        businessType,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async seedCoffeeBusiness(): Promise<string> {
    const businessId = uuidv4()
    
    try {
      // Step 1: Create business entity
      this.updateProgress(
        'Business Creation',
        'Creating coffee business entity...',
        1,
        20
      )
      
      const now = new Date().toISOString()
      const business: Business = {
        id: businessId,
        name: 'On The Go Coffee',
        description: 'Premium coffee shop serving artisan coffee and fresh pastries',
        note: 'Original coffee business with comprehensive menu and operations',
        createdAt: now,
        updatedAt: now
      }
      
      await db.businesses.add(business)
      
      // Step 2-19: Use comprehensive seeder with detailed progress tracking
      const progressWrapper: ProgressCallback = (progress) => {
        // Map comprehensive seeder progress to our multi-business progress
        // Add 1 to progress since we already completed business creation
        this.updateProgress(
          `Coffee: ${progress.step}`,
          `${this.currentBusinessName} - ${progress.message}`,
          progress.progress + 1,
          20, // Total steps including business creation
          progress.completed,
          progress.error
        )
      }
      
      const seeder = new ComprehensiveSeeder(progressWrapper, businessId)
      await seeder.seedDatabase(false) // Don't clear since we already handled it
      
      // Step 20: Update entities with businessId
      this.updateProgress(
        'Coffee: Business Association',
        `${this.currentBusinessName} - Associating data with business...`,
        19,
        20
      )
      
      await this.updateEntitiesWithBusinessId(businessId)
      
      this.updateProgress(
        'Coffee: Complete',
        `${this.currentBusinessName} - Coffee business seeding completed successfully!`,
        20,
        20,
        true
      )
      
      return businessId
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateProgress(
        'Coffee: Error',
        `${this.currentBusinessName} - Coffee business seeding failed: ${errorMessage}`,
        0,
        20,
        true,
        errorMessage
      )
      throw error
    }
  }

  private async seedBakeryBusiness(): Promise<string> {
    try {
      // Create a wrapper progress callback that forwards to our multi-business callback
      const progressWrapper: ProgressCallback = (progress) => {
        this.updateProgress(
          `Bakery: ${progress.step}`,
          `${this.currentBusinessName} - ${progress.message}`,
          progress.progress,
          progress.total,
          progress.completed,
          progress.error
        )
      }
      
      // Use comprehensive bakery seeder instead of basic bakery seeder
      const businessId = await seedComprehensiveBakeryBusiness(progressWrapper)
      
      this.updateProgress(
         'Bakery: Complete',
         `${this.currentBusinessName} - Comprehensive bakery business seeding completed successfully!`,
         18,
         18,
         true
       )
      
      return businessId
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateProgress(
         'Bakery: Error',
         `${this.currentBusinessName} - Comprehensive bakery business seeding failed: ${errorMessage}`,
         0,
         18,
         true,
         errorMessage
       )
      throw error
    }
  }

  private async updateEntitiesWithBusinessId(businessId: string): Promise<void> {
    // Update all entities that don't have businessId set to use the coffee business ID
    const tables = [
      'ingredientCategories',
      'ingredients', 
      'products',
      'productIngredients',
      'branches',
      'menus',
      'menuProducts',
      'menuBranches',
      'dailySalesTargets',
      'dailyProductSalesTargets',
      'salesRecords',
      'warehouseBatches',
      'warehouseItems',
      'stockLevels',
      'stockTransactions',
      'productionBatches',
      'productionItems',
      'fixedAssets',
      'assetCategories',
      'recurringExpenses',
      'operationalPlans',
      'planGoals',
      'planTasks',
      'planMetrics',
      'planTemplates',
      'planGoalTemplates',
      'planTaskTemplates',
      'planMetricTemplates',
      'journeyProgress',
      'financialItems',
      'bonusSchemes'
    ]

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i]
      
      try {
         const table = (db as unknown as Record<string, { where: (field: string) => { equals: (value: unknown) => { toArray: () => Promise<unknown[]> } }, update: (id: string | number | Date | Array<string | number | Date>, data: Record<string, unknown>) => Promise<void> }>)[tableName]
         if (table) {
           // Get all records without businessId
           const records = await table.where('businessId').equals(undefined).toArray() as Array<Record<string, unknown>>
           
           if (records.length > 0) {
             // Update each record with the businessId, but only if it has a valid ID
             for (const record of records) {
               // Check if record has a valid ID that can be used as a key
               const isValidId = record.id !== undefined && 
                                record.id !== null && 
                                (
                                  (typeof record.id === 'string' && record.id.trim() !== '') ||
                                  (typeof record.id === 'number' && !isNaN(record.id)) ||
                                  (record.id instanceof Date) ||
                                  (Array.isArray(record.id) && record.id.length > 0 && record.id.every((item: unknown) => 
                                    (typeof item === 'string' && item.trim() !== '') ||
                                    (typeof item === 'number' && !isNaN(item)) ||
                                    (item instanceof Date)
                                  ))
                                )
               
               if (isValidId) {
                 try {
                   await table.update(record.id as string | number | Date | Array<string | number | Date>, { businessId })
                 } catch (updateError) {
                   // Log individual record update failures but continue with others
                   console.warn(`Failed to update record with ID ${record.id} in ${tableName}:`, updateError)
                   // If this is a key-related error, skip this record entirely
                   if (updateError instanceof Error && updateError.message.includes('Invalid key provided')) {
                     console.warn(`Skipping record with invalid key in ${tableName}:`, record.id)
                     continue
                   }
                 }
               } else {
                 console.warn(`Skipping record with invalid ID in ${tableName}:`, record.id)
               }
             }
           }
         }
       } catch (error) {
         const errorMessage = error instanceof Error ? error.message : String(error)
         console.warn(`Failed to update ${tableName} with businessId: ${errorMessage}`)
         // Don't throw here - log the error and continue with other tables
         // This prevents the entire seeding process from failing due to individual table issues
       }
    }
  }

  private getBusinessName(businessType: 'coffee' | 'bakery'): string {
    switch (businessType) {
      case 'coffee':
        return 'On The Go Coffee'
      case 'bakery':
        return 'Sweet Dreams Bakery'
      default:
        return 'Unknown Business'
    }
  }

  private async clearAllData(): Promise<void> {
    this.updateProgress('Clearing Data', 'Clearing all existing data...', 0, 1)
    
    try {
      // Clear all tables in reverse dependency order
      const tables = [
        'journeyProgress',
        'planMetricTemplates',
        'planTaskTemplates', 
        'planGoalTemplates',
        'planTemplates',
        'planMetrics',
        'planTasks',
        'planGoals',
        'operationalPlans',
        'bonusSchemes',
        'recurringExpenses',
        'fixedAssets',
        'assetCategories',
        'productionItems',
        'productionBatches',
        'stockTransactions',
        'stockLevels',
        'warehouseItems',
        'warehouseBatches',
        'salesRecords',
        'dailyProductSalesTargets',
        'dailySalesTargets',
        'menuBranches',
        'menuProducts',
        'menus',
        'branches',
        'productIngredients',
        'products',
        'ingredients',
        'ingredientCategories',
        'financialItems',
        'appSettings',
        'businesses'
      ]

      for (let i = 0; i < tables.length; i++) {
        const tableName = tables[i]
        
        try {
           const table = (db as unknown as Record<string, { clear: () => Promise<void> }>)[tableName]
           if (table) {
             await table.clear()
           }
         } catch (error) {
           const errorMessage = error instanceof Error ? error.message : String(error)
           throw new Error(`Failed to clear table ${tableName}: ${errorMessage}`)
         }
      }
      
      this.updateProgress('Clearing Data', 'All data cleared successfully', 1, 1, true)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateProgress('Clearing Data', `Failed to clear data: ${errorMessage}`, 1, 1, true, errorMessage)
      throw error
    }
  }

  /**
   * Get all businesses in the database
   */
  async getAllBusinesses(): Promise<Business[]> {
    return await db.businesses.toArray()
  }

  /**
   * Seed products for a specific business (used for /products route)
   */
  async seedProductsForBusiness(businessId: string): Promise<void> {
    try {
      this.updateProgress(
        'Products',
        'Creating coffee products...',
        0,
        1
      )

      const now = new Date().toISOString()
      const products = [
        {
          id: uuidv4(),
          name: 'Espresso',
          description: 'Classic single shot espresso',
          note: 'Strong and bold coffee shot',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: 'Americano',
          description: 'Espresso with hot water',
          note: 'Simple black coffee',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: 'Latte',
          description: 'Espresso with steamed milk',
          note: 'Creamy and smooth coffee',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and foam',
          note: 'Traditional Italian coffee',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: 'Vanilla Latte',
          description: 'Latte with vanilla syrup',
          note: 'Sweet and aromatic coffee',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: 'Caramel Macchiato',
          description: 'Espresso with caramel and steamed milk',
          note: 'Sweet caramel flavored coffee',
          businessId,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ]

      await db.products.bulkAdd(products)

      this.updateProgress(
        'Products',
        'Coffee products created successfully',
        1,
        1,
        true
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateProgress(
        'Products',
        `Failed to create products: ${errorMessage}`,
        1,
        1,
        true,
        errorMessage
      )
      throw error
    }
  }

  /**
   * Get business statistics
   */
  async getBusinessStats(): Promise<{
    totalBusinesses: number
    businessTypes: { [key: string]: number }
    businesses: Array<{ id: string; name: string; description: string }>
  }> {
    const businesses = await this.getAllBusinesses()
    
    const businessTypes: { [key: string]: number } = {}
    
    // Categorize businesses by type based on name patterns
    businesses.forEach(business => {
      if (business.name.toLowerCase().includes('coffee')) {
        businessTypes['coffee'] = (businessTypes['coffee'] || 0) + 1
      } else if (business.name.toLowerCase().includes('bakery')) {
        businessTypes['bakery'] = (businessTypes['bakery'] || 0) + 1
      } else {
        businessTypes['other'] = (businessTypes['other'] || 0) + 1
      }
    })
    
    return {
      totalBusinesses: businesses.length,
      businessTypes,
      businesses: businesses.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description || ''
      }))
    }
  }
}

// Export convenience functions
export const seedMultipleBusinesses = async (
  businessTypes: Array<'coffee' | 'bakery'>,
  clearFirst = true,
  progressCallback?: MultiBusinessProgressCallback
): Promise<BusinessSeedingResult[]> => {
  const seeder = new MultiBusinessSeeder(progressCallback)
  return await seeder.seedMultipleBusinesses(businessTypes, clearFirst)
}

export const seedSingleBusiness = async (
  businessType: 'coffee' | 'bakery',
  clearFirst = false,
  progressCallback?: MultiBusinessProgressCallback
): Promise<BusinessSeedingResult> => {
  const seeder = new MultiBusinessSeeder(progressCallback)
  return await seeder.seedSingleBusiness(businessType, clearFirst)
}

export const seedProductsForBusiness = async (
  businessId: string,
  progressCallback?: MultiBusinessProgressCallback
): Promise<void> => {
  const seeder = new MultiBusinessSeeder(progressCallback)
  return await seeder.seedProductsForBusiness(businessId)
}