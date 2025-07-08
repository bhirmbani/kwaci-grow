import { v4 as uuidv4 } from 'uuid'
import db from '../db'
import type { JourneyProgress, NewJourneyProgress } from '../db/schema'

// Journey step definitions
export const JOURNEY_STEPS = {
  CREATE_INGREDIENT: 'create-ingredient',
  CREATE_PRODUCT: 'create-product', 
  CREATE_MENU: 'create-menu',
  CREATE_BRANCH: 'create-branch',
  ADD_PRODUCT_TO_MENU: 'add-product-to-menu',
  ADD_ITEM_TO_WAREHOUSE: 'add-item-to-warehouse',
  CREATE_PRODUCTION_ALLOCATION: 'create-production-allocation',
  CHANGE_PRODUCTION_BATCH_STATUS: 'change-production-batch-status',
  RECORD_SALES: 'record-sales'
} as const

export type JourneyStepId = typeof JOURNEY_STEPS[keyof typeof JOURNEY_STEPS]

// Journey step metadata
export interface JourneyStepInfo {
  id: JourneyStepId
  title: string
  description: string
  instructions: string
  order: number
  validationFn?: () => Promise<boolean>
}

export const JOURNEY_STEP_INFO: Record<JourneyStepId, JourneyStepInfo> = {
  [JOURNEY_STEPS.CREATE_INGREDIENT]: {
    id: JOURNEY_STEPS.CREATE_INGREDIENT,
    title: 'Create Ingredient',
    description: 'Set up your first ingredient for coffee production',
    instructions: 'Navigate to the Ingredients page and create at least one ingredient (e.g., Coffee Beans, Milk, Sugar)',
    order: 1,
    validationFn: async () => {
      const ingredients = await db.ingredients.toArray()
      return ingredients.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_PRODUCT]: {
    id: JOURNEY_STEPS.CREATE_PRODUCT,
    title: 'Create Product',
    description: 'Create a coffee product with COGS calculation',
    instructions: 'Go to Products page and create a product using your ingredients with proper COGS calculation',
    order: 2,
    validationFn: async () => {
      const products = await db.products.toArray()
      return products.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_MENU]: {
    id: JOURNEY_STEPS.CREATE_MENU,
    title: 'Create Menu',
    description: 'Set up your coffee shop menu',
    instructions: 'Create a menu in the Menus section to organize your products',
    order: 3,
    validationFn: async () => {
      const menus = await db.menus.toArray()
      return menus.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_BRANCH]: {
    id: JOURNEY_STEPS.CREATE_BRANCH,
    title: 'Create Branch',
    description: 'Set up your coffee shop branch location',
    instructions: 'Create a branch location for your coffee shop operations',
    order: 4,
    validationFn: async () => {
      const branches = await db.branches.toArray()
      return branches.length > 0
    }
  },
  [JOURNEY_STEPS.ADD_PRODUCT_TO_MENU]: {
    id: JOURNEY_STEPS.ADD_PRODUCT_TO_MENU,
    title: 'Add Product to Menu',
    description: 'Associate your product with the menu',
    instructions: 'Add your created product to the menu with pricing information',
    order: 5,
    validationFn: async () => {
      const menuProducts = await db.menuProducts.toArray()
      return menuProducts.length > 0
    }
  },
  [JOURNEY_STEPS.ADD_ITEM_TO_WAREHOUSE]: {
    id: JOURNEY_STEPS.ADD_ITEM_TO_WAREHOUSE,
    title: 'Add Item to Warehouse',
    description: 'Stock your warehouse with ingredients',
    instructions: 'Go to Warehouse and add ingredients to your inventory using the COGS calculator',
    order: 6,
    validationFn: async () => {
      const warehouseItems = await db.warehouseItems.toArray()
      return warehouseItems.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_PRODUCTION_ALLOCATION]: {
    id: JOURNEY_STEPS.CREATE_PRODUCTION_ALLOCATION,
    title: 'Create Production Allocation',
    description: 'Allocate ingredients for production',
    instructions: 'Use the Quick Production Allocation feature to reserve ingredients for production',
    order: 7,
    validationFn: async () => {
      const productionBatches = await db.productionBatches.toArray()
      return productionBatches.length > 0
    }
  },
  [JOURNEY_STEPS.CHANGE_PRODUCTION_BATCH_STATUS]: {
    id: JOURNEY_STEPS.CHANGE_PRODUCTION_BATCH_STATUS,
    title: 'Complete Production Batch',
    description: 'Mark production batch as completed',
    instructions: 'Change a production batch status from Pending → In Progress → Completed',
    order: 8,
    validationFn: async () => {
      const completedBatches = await db.productionBatches.where('status').equals('Completed').toArray()
      return completedBatches.length > 0
    }
  },
  [JOURNEY_STEPS.RECORD_SALES]: {
    id: JOURNEY_STEPS.RECORD_SALES,
    title: 'Record Sales',
    description: 'Record your first sales transaction',
    instructions: 'Go to Operations and record a sales transaction for your products',
    order: 9,
    validationFn: async () => {
      const salesRecords = await db.salesRecords.toArray()
      return salesRecords.length > 0
    }
  }
}

export class JourneyService {
  /**
   * Get all journey progress for current user
   */
  static async getAllProgress(userId?: string): Promise<JourneyProgress[]> {
    try {
      const progress = await db.journeyProgress.toArray()
      return userId ? progress.filter(p => p.userId === userId) : progress
    } catch (error) {
      console.error('Error getting journey progress:', error)
      throw error
    }
  }

  /**
   * Get progress for a specific step
   */
  static async getStepProgress(stepId: JourneyStepId, userId?: string): Promise<JourneyProgress | null> {
    try {
      const progress = await db.journeyProgress
        .where('stepId')
        .equals(stepId)
        .first()
      
      return progress || null
    } catch (error) {
      console.error('Error getting step progress:', error)
      throw error
    }
  }

  /**
   * Mark a step as completed
   */
  static async completeStep(stepId: JourneyStepId, userId?: string): Promise<JourneyProgress> {
    try {
      const now = new Date().toISOString()
      const existing = await this.getStepProgress(stepId, userId)

      if (existing) {
        // Update existing progress
        const updated: JourneyProgress = {
          ...existing,
          completed: true,
          completedAt: now,
          updatedAt: now
        }
        await db.journeyProgress.update(existing.id, updated)
        return updated
      } else {
        // Create new progress entry
        const newProgress: JourneyProgress = {
          id: uuidv4(),
          stepId,
          completed: true,
          completedAt: now,
          userId,
          createdAt: now,
          updatedAt: now
        }
        await db.journeyProgress.add(newProgress)
        return newProgress
      }
    } catch (error) {
      console.error('Error completing step:', error)
      throw error
    }
  }

  /**
   * Check if a step is completed
   */
  static async isStepCompleted(stepId: JourneyStepId, userId?: string): Promise<boolean> {
    try {
      const progress = await this.getStepProgress(stepId, userId)
      return progress?.completed || false
    } catch (error) {
      console.error('Error checking step completion:', error)
      return false
    }
  }

  /**
   * Get the next unlocked step
   */
  static async getNextUnlockedStep(userId?: string): Promise<JourneyStepInfo | null> {
    try {
      const allProgress = await this.getAllProgress(userId)
      const completedSteps = new Set(
        allProgress.filter(p => p.completed).map(p => p.stepId)
      )

      // Find the first incomplete step in order
      const orderedSteps = Object.values(JOURNEY_STEP_INFO).sort((a, b) => a.order - b.order)
      
      for (const step of orderedSteps) {
        if (!completedSteps.has(step.id)) {
          return step
        }
      }

      return null // All steps completed
    } catch (error) {
      console.error('Error getting next unlocked step:', error)
      return null
    }
  }

  /**
   * Get journey completion percentage
   */
  static async getCompletionPercentage(userId?: string): Promise<number> {
    try {
      const allProgress = await this.getAllProgress(userId)
      const completedCount = allProgress.filter(p => p.completed).length
      const totalSteps = Object.keys(JOURNEY_STEP_INFO).length
      
      return Math.round((completedCount / totalSteps) * 100)
    } catch (error) {
      console.error('Error calculating completion percentage:', error)
      return 0
    }
  }

  /**
   * Reset all journey progress (for testing/demo purposes)
   */
  static async resetProgress(userId?: string): Promise<void> {
    try {
      if (userId) {
        await db.journeyProgress.where('userId').equals(userId).delete()
      } else {
        await db.journeyProgress.clear()
      }
    } catch (error) {
      console.error('Error resetting journey progress:', error)
      throw error
    }
  }

  /**
   * Auto-check and complete steps based on current data
   */
  static async autoCheckStepCompletion(userId?: string): Promise<void> {
    try {
      // Check each step's validation function and auto-complete if criteria met
      for (const stepInfo of Object.values(JOURNEY_STEP_INFO)) {
        const isCompleted = await this.isStepCompleted(stepInfo.id, userId)
        
        if (!isCompleted && stepInfo.validationFn) {
          const shouldComplete = await stepInfo.validationFn()
          if (shouldComplete) {
            await this.completeStep(stepInfo.id, userId)
          }
        }
      }
    } catch (error) {
      console.error('Error auto-checking step completion:', error)
    }
  }
}
