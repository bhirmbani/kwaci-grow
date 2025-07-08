import { db } from '../db'
import type { ProductionBatch, ProductionItem, NewProductionBatch, NewProductionItem, ProductionBatchWithItems, ProductionBatchStatus } from '../db/schema'
import { StockService } from './stockService'
import { v4 as uuidv4 } from 'uuid'

export class ProductionService {
  /**
   * Get the next production batch number by counting existing batches and adding 1
   */
  static async getNextBatchNumber(): Promise<number> {
    try {
      const count = await db.productionBatches.count()
      return count + 1
    } catch (error) {
      console.error('Error getting next production batch number:', error)
      throw error
    }
  }

  /**
   * Create a new production batch
   */
  static async createBatch(batchData: Omit<NewProductionBatch, 'id' | 'batchNumber'>): Promise<ProductionBatch> {
    try {
      const batchNumber = await this.getNextBatchNumber()
      const now = new Date().toISOString()
      
      const newBatch: ProductionBatch = {
        id: uuidv4(),
        batchNumber,
        dateCreated: batchData.dateCreated,
        status: batchData.status || 'Pending',
        note: batchData.note || '',
        createdAt: now,
        updatedAt: now
      }

      await db.productionBatches.add(newBatch)
      return newBatch
    } catch (error) {
      console.error('Error creating production batch:', error)
      throw error
    }
  }

  /**
   * Add items to a production batch and reserve stock
   */
  static async addItemsToBatch(batchId: string, items: Omit<NewProductionItem, 'id' | 'productionBatchId'>[]): Promise<ProductionItem[]> {
    try {
      const now = new Date().toISOString()
      const productionItems: ProductionItem[] = []

      // Get batch info for reservation purpose
      const batch = await db.productionBatches.get(batchId)
      if (!batch) {
        throw new Error('Production batch not found')
      }

      for (const item of items) {
        const productionItem: ProductionItem = {
          id: uuidv4(),
          productionBatchId: batchId,
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
          note: item.note || '',
          createdAt: now,
          updatedAt: now
        }

        await db.productionItems.add(productionItem)
        productionItems.push(productionItem)

        // Allocate stock for this production item
        await StockService.allocateForProduction(
          item.ingredientName,
          item.unit,
          item.quantity,
          batchId,
          batch.batchNumber
        )
      }

      return productionItems
    } catch (error) {
      console.error('Error adding items to production batch:', error)
      throw error
    }
  }

  /**
   * Create production batch with items and allocate stock
   */
  static async createBatchWithItems(
    batchData: Omit<NewProductionBatch, 'id' | 'batchNumber'>,
    items: Omit<NewProductionItem, 'id' | 'productionBatchId'>[]
  ): Promise<ProductionBatchWithItems> {
    try {
      const batch = await this.createBatch(batchData)
      const productionItems = await this.addItemsToBatch(batch.id, items)
      
      return {
        ...batch,
        items: productionItems
      }
    } catch (error) {
      console.error('Error creating production batch with items:', error)
      throw error
    }
  }

  /**
   * Get all production batches
   */
  static async getAllBatches(): Promise<ProductionBatch[]> {
    try {
      return await db.productionBatches.orderBy('batchNumber').reverse().toArray()
    } catch (error) {
      console.error('Error getting production batches:', error)
      throw error
    }
  }

  /**
   * Get all production batches with their items
   */
  static async getAllBatchesWithItems(): Promise<ProductionBatchWithItems[]> {
    try {
      const batches = await this.getAllBatches()
      const batchesWithItems: ProductionBatchWithItems[] = []

      for (const batch of batches) {
        const items = await db.productionItems.where('productionBatchId').equals(batch.id).toArray()
        batchesWithItems.push({
          ...batch,
          items
        })
      }

      return batchesWithItems
    } catch (error) {
      console.error('Error getting production batches with items:', error)
      throw error
    }
  }

  /**
   * Get a specific production batch with items
   */
  static async getBatchWithItems(batchId: string): Promise<ProductionBatchWithItems | null> {
    try {
      const batch = await db.productionBatches.get(batchId)
      if (!batch) return null

      const items = await db.productionItems.where('productionBatchId').equals(batchId).toArray()
      
      return {
        ...batch,
        items
      }
    } catch (error) {
      console.error('Error getting production batch with items:', error)
      throw error
    }
  }

  /**
   * Update production batch status
   */
  static async updateBatchStatus(
    batchId: string,
    status: ProductionBatchStatus,
    outputData?: {
      productName: string
      outputQuantity: number
      outputUnit: string
    }
  ): Promise<void> {
    try {
      const now = new Date().toISOString()

      // Prepare update data
      const updateData: any = {
        status,
        updatedAt: now
      }

      // If completing the batch and output data provided, add production output
      if (status === 'Completed' && outputData) {
        updateData.productName = outputData.productName
        updateData.outputQuantity = outputData.outputQuantity
        updateData.outputUnit = outputData.outputUnit
      }

      // Update batch status and output data
      await db.productionBatches.update(batchId, updateData)

      // If status is 'Completed', convert reservations to actual deductions
      if (status === 'Completed') {
        await this.completeProductionBatch(batchId)
      }
    } catch (error) {
      console.error('Error updating production batch status:', error)
      throw error
    }
  }

  /**
   * Complete production batch - convert reservations to actual stock deductions
   */
  private static async completeProductionBatch(batchId: string): Promise<void> {
    try {
      const batch = await db.productionBatches.get(batchId)
      if (!batch) {
        throw new Error('Production batch not found')
      }

      const items = await db.productionItems.where('productionBatchId').equals(batchId).toArray()

      for (const item of items) {
        // Complete production for this item (unreserve and deduct)
        await StockService.completeProduction(
          item.ingredientName,
          item.unit,
          item.quantity,
          batchId,
          batch.batchNumber
        )
      }
    } catch (error) {
      console.error('Error completing production batch:', error)
      throw error
    }
  }

  /**
   * Delete production batch and release reservations
   */
  static async deleteBatch(batchId: string): Promise<void> {
    try {
      const batch = await db.productionBatches.get(batchId)
      if (!batch) {
        throw new Error('Production batch not found')
      }

      // Get items to release reservations
      const items = await db.productionItems.where('productionBatchId').equals(batchId).toArray()

      // Release stock reservations for each item (only if not completed)
      if (batch.status !== 'Completed') {
        for (const item of items) {
          await StockService.unreserveStock(
            item.ingredientName,
            item.unit,
            item.quantity,
            `Production Batch #${batch.batchNumber} deleted`,
            batchId
          )
        }
      }

      // Delete items and batch
      await db.productionItems.where('productionBatchId').equals(batchId).delete()
      await db.productionBatches.delete(batchId)
    } catch (error) {
      console.error('Error deleting production batch:', error)
      throw error
    }
  }

  /**
   * Update production batch
   */
  static async updateBatch(batchId: string, updates: Partial<Pick<ProductionBatch, 'note'>>): Promise<void> {
    try {
      const now = new Date().toISOString()
      await db.productionBatches.update(batchId, {
        ...updates,
        updatedAt: now
      })
    } catch (error) {
      console.error('Error updating production batch:', error)
      throw error
    }
  }

  /**
   * Get production statistics
   */
  static async getProductionStats(): Promise<{
    totalBatches: number
    pendingBatches: number
    inProgressBatches: number
    completedBatches: number
    totalItems: number
    latestBatch?: ProductionBatch
  }> {
    try {
      const batches = await this.getAllBatches()
      const totalItems = await db.productionItems.count()
      
      const stats = {
        totalBatches: batches.length,
        pendingBatches: batches.filter(b => b.status === 'Pending').length,
        inProgressBatches: batches.filter(b => b.status === 'In Progress').length,
        completedBatches: batches.filter(b => b.status === 'Completed').length,
        totalItems,
        latestBatch: batches[0] // First item since ordered by batchNumber desc
      }

      return stats
    } catch (error) {
      console.error('Error getting production statistics:', error)
      throw error
    }
  }
}
