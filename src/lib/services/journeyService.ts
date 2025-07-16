import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { JourneyProgress } from '../db/schema'
import { getCurrentBusinessId, requireBusinessId } from './businessContext'
import i18next from '../i18n'

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
  RECORD_SALES: 'record-sales',
  CREATE_SALES_TARGET: 'create-sales-target'
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
    title: 'plan.planningDashboard.journey.createIngredient.title',
    description: 'plan.planningDashboard.journey.createIngredient.description',
    instructions: 'plan.planningDashboard.journey.createIngredient.instructions',
    order: 1,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const ingredients = await db.ingredients.where('businessId').equals(businessId).toArray()
      return ingredients.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_PRODUCT]: {
    id: JOURNEY_STEPS.CREATE_PRODUCT,
    title: 'plan.planningDashboard.journey.createProduct.title',
    description: 'plan.planningDashboard.journey.createProduct.description',
    instructions: 'plan.planningDashboard.journey.createProduct.instructions',
    order: 2,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const products = await db.products.where('businessId').equals(businessId).toArray()
      return products.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_MENU]: {
    id: JOURNEY_STEPS.CREATE_MENU,
    title: 'plan.planningDashboard.journey.createMenu.title',
    description: 'plan.planningDashboard.journey.createMenu.description',
    instructions: 'plan.planningDashboard.journey.createMenu.instructions',
    order: 3,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const menus = await db.menus.where('businessId').equals(businessId).toArray()
      return menus.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_BRANCH]: {
    id: JOURNEY_STEPS.CREATE_BRANCH,
    title: 'plan.planningDashboard.journey.createBranch.title',
    description: 'plan.planningDashboard.journey.createBranch.description',
    instructions: 'plan.planningDashboard.journey.createBranch.instructions',
    order: 4,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const branches = await db.branches.where('businessId').equals(businessId).toArray()
      return branches.length > 0
    }
  },
  [JOURNEY_STEPS.ADD_PRODUCT_TO_MENU]: {
    id: JOURNEY_STEPS.ADD_PRODUCT_TO_MENU,
    title: 'plan.planningDashboard.journey.addProductToMenu.title',
    description: 'plan.planningDashboard.journey.addProductToMenu.description',
    instructions: 'plan.planningDashboard.journey.addProductToMenu.instructions',
    order: 5,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const menuProducts = await db.menuProducts.where('businessId').equals(businessId).toArray()
      return menuProducts.length > 0
    }
  },
  [JOURNEY_STEPS.ADD_ITEM_TO_WAREHOUSE]: {
    id: JOURNEY_STEPS.ADD_ITEM_TO_WAREHOUSE,
    title: 'plan.planningDashboard.journey.addItemToWarehouse.title',
    description: 'plan.planningDashboard.journey.addItemToWarehouse.description',
    instructions: 'plan.planningDashboard.journey.addItemToWarehouse.instructions',
    order: 6,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const warehouseItems = await db.warehouseItems.where('businessId').equals(businessId).toArray()
      return warehouseItems.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_PRODUCTION_ALLOCATION]: {
    id: JOURNEY_STEPS.CREATE_PRODUCTION_ALLOCATION,
    title: 'plan.planningDashboard.journey.createProductionAllocation.title',
    description: 'plan.planningDashboard.journey.createProductionAllocation.description',
    instructions: 'plan.planningDashboard.journey.createProductionAllocation.instructions',
    order: 7,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const productionBatches = await db.productionBatches.where('businessId').equals(businessId).toArray()
      return productionBatches.length > 0
    }
  },
  [JOURNEY_STEPS.CHANGE_PRODUCTION_BATCH_STATUS]: {
    id: JOURNEY_STEPS.CHANGE_PRODUCTION_BATCH_STATUS,
    title: 'plan.planningDashboard.journey.changeProductionBatchStatus.title',
    description: 'plan.planningDashboard.journey.changeProductionBatchStatus.description',
    instructions: 'plan.planningDashboard.journey.changeProductionBatchStatus.instructions',
    order: 8,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const completedBatches = await db.productionBatches
        .where('businessId').equals(businessId)
        .and(batch => batch.status === 'Completed')
        .toArray()
      return completedBatches.length > 0
    }
  },
  [JOURNEY_STEPS.RECORD_SALES]: {
    id: JOURNEY_STEPS.RECORD_SALES,
    title: 'plan.planningDashboard.journey.recordSales.title',
    description: 'plan.planningDashboard.journey.recordSales.description',
    instructions: 'plan.planningDashboard.journey.recordSales.instructions',
    order: 9,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const salesRecords = await db.salesRecords.where('businessId').equals(businessId).toArray()
      return salesRecords.length > 0
    }
  },
  [JOURNEY_STEPS.CREATE_SALES_TARGET]: {
    id: JOURNEY_STEPS.CREATE_SALES_TARGET,
    title: 'plan.planningDashboard.journey.createSalesTarget.title',
    description: 'plan.planningDashboard.journey.createSalesTarget.description',
    instructions: 'plan.planningDashboard.journey.createSalesTarget.instructions',
    order: 10,
    validationFn: async () => {
      const businessId = getCurrentBusinessId()
      if (!businessId) return false
      const salesTargets = await db.dailyProductSalesTargets.where('businessId').equals(businessId).toArray()
      return salesTargets.length > 0
    }
  }
}

export class JourneyService {
  /**
   * Get all journey progress for current business
   */
  static async getAllProgress(userId?: string): Promise<JourneyProgress[]> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) return []

      let query = db.journeyProgress.where('businessId').equals(businessId)
      if (userId) {
        query = query.and(p => p.userId === userId)
      }

      return await query.toArray()
    } catch (error) {
      console.error('Error getting journey progress:', error)
      throw error
    }
  }

  /**
   * Get progress for a specific step in current business
   */
  static async getStepProgress(stepId: JourneyStepId, userId?: string): Promise<JourneyProgress | null> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) return null

      let query = db.journeyProgress
        .where('stepId').equals(stepId)
        .and(p => p.businessId === businessId)

      if (userId) {
        query = query.and(p => p.userId === userId)
      }

      return await query.first() || null
    } catch (error) {
      console.error('Error getting step progress:', error)
      throw error
    }
  }

  /**
   * Mark a step as completed for current business
   */
  static async completeStep(stepId: JourneyStepId, userId?: string): Promise<JourneyProgress> {
    try {
      const businessId = requireBusinessId()
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
          businessId,
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
   * Reset all journey progress for current business (for testing/demo purposes)
   */
  static async resetProgress(userId?: string): Promise<void> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) return

      let query = db.journeyProgress.where('businessId').equals(businessId)
      if (userId) {
        query = query.and(p => p.userId === userId)
      }

      const progressToDelete = await query.toArray()
      const ids = progressToDelete.map(p => p.id)
      if (ids.length > 0) {
        await db.journeyProgress.bulkDelete(ids)
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
