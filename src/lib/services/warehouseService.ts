import { db } from '../db'
import type { WarehouseBatch, WarehouseItem, NewWarehouseBatch, NewWarehouseItem } from '../db/schema'
import type { ShoppingListItem } from '@/utils/cogsCalculations'
import { StockService } from './stockService'
import { v4 as uuidv4 } from 'uuid'
import { withBusinessId, requireBusinessId } from './businessContext'

/**
 * Set the business ID provider function
 * This allows the service to get the current business ID without direct store dependency
 */
export function setBusinessIdProvider(_provider: () => string | null) {
  // This function is required for business context initialization
  // The provider is not used directly in this service since we use requireBusinessId()
}

export class WarehouseService {
  /**
   * Get the next batch number by counting existing batches and adding 1
   */
  static async getNextBatchNumber(): Promise<number> {
    try {
      const businessId = requireBusinessId()
      const count = await db.warehouseBatches.where('businessId').equals(businessId).count()
      return count + 1
    } catch (error) {
      console.error('Error getting next batch number:', error)
      throw error
    }
  }

  /**
   * Create a new warehouse batch
   */
  static async createBatch(batchData: Omit<NewWarehouseBatch, 'id' | 'batchNumber' | 'businessId'>): Promise<WarehouseBatch> {
    try {
      const batchNumber = await this.getNextBatchNumber()
      const now = new Date().toISOString()

      const newBatch: WarehouseBatch = withBusinessId({
        id: uuidv4(),
        batchNumber,
        dateAdded: batchData.dateAdded,
        note: batchData.note || '',
        createdAt: now,
        updatedAt: now
      })

      await db.warehouseBatches.add(newBatch)
      return newBatch
    } catch (error) {
      console.error('Error creating warehouse batch:', error)
      throw error
    }
  }

  /**
   * Add items to a warehouse batch and update stock levels
   */
  static async addItemsToBatch(batchId: string, items: Omit<NewWarehouseItem, 'id' | 'batchId' | 'businessId'>[]): Promise<WarehouseItem[]> {
    try {
      const now = new Date().toISOString()

      const warehouseItems: WarehouseItem[] = items.map(item => withBusinessId({
        id: uuidv4(),
        batchId,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        totalCost: item.totalCost,
        note: item.note || '',
        createdAt: now,
        updatedAt: now
      }))

      // Use transaction to ensure both warehouse items and stock are updated together
      await db.transaction('rw', [db.warehouseItems, db.stockLevels, db.stockTransactions], async () => {
        // Add warehouse items
        await db.warehouseItems.bulkAdd(warehouseItems)

        // Update stock levels for each item
        for (const item of warehouseItems) {
          await StockService.addStock(
            item.ingredientName,
            item.unit,
            item.quantity,
            `Warehouse addition - Batch #${batchId}`,
            batchId
          )
        }
      })

      return warehouseItems
    } catch (error) {
      console.error('Error adding items to warehouse batch:', error)
      throw error
    }
  }

  /**
   * Convert shopping list items to warehouse items format
   */
  static convertShoppingListToWarehouseItems(shoppingListItems: ShoppingListItem[]): Omit<NewWarehouseItem, 'id' | 'batchId' | 'businessId'>[] {
    return shoppingListItems.map(item => ({
      ingredientName: item.name,
      quantity: item.totalNeeded, // For True Shopping List, this is already the purchased quantity in base units
      unit: item.unit,
      costPerUnit: item.unitCost,
      totalCost: item.totalCost,
      note: `Added from shopping list - ${item.formattedQuantity}`
    }))
  }

  /**
   * Create a complete warehouse entry from shopping list
   */
  static async createWarehouseEntryFromShoppingList(
    shoppingListItems: ShoppingListItem[],
    note: string = ''
  ): Promise<{ batch: WarehouseBatch; items: WarehouseItem[] }> {
    try {
      // Create the batch
      const batch = await this.createBatch({
        dateAdded: new Date().toISOString(),
        note: note || `Batch created from shopping list on ${new Date().toLocaleDateString()}`
      })

      // Convert shopping list items to warehouse items
      const warehouseItemsData = this.convertShoppingListToWarehouseItems(shoppingListItems)

      // Add items to the batch
      const items = await this.addItemsToBatch(batch.id, warehouseItemsData)

      return { batch, items }
    } catch (error) {
      console.error('Error creating warehouse entry from shopping list:', error)
      throw error
    }
  }

  /**
   * Get all warehouse batches with their items
   */
  static async getAllBatchesWithItems(): Promise<(WarehouseBatch & { items: WarehouseItem[] })[]> {
    try {
      const businessId = requireBusinessId()
      const batches = await db.warehouseBatches.where('businessId').equals(businessId).reverse().sortBy('batchNumber')

      const batchesWithItems = await Promise.all(
        batches.map(async (batch: WarehouseBatch) => {
          const items = await db.warehouseItems.where(['businessId', 'batchId']).equals([businessId, batch.id]).toArray()
          return { ...batch, items }
        })
      )

      return batchesWithItems
    } catch (error) {
      console.error('Error getting batches with items:', error)
      throw error
    }
  }

  /**
   * Get warehouse batches by date range
   */
  static async getBatchesByDateRange(startDate: string, endDate: string): Promise<WarehouseBatch[]> {
    try {
      const businessId = requireBusinessId()
      const allBatches = await db.warehouseBatches.where('businessId').equals(businessId).toArray()
      return allBatches.filter(batch =>
        batch.dateAdded >= startDate && batch.dateAdded <= endDate
      )
    } catch (error) {
      console.error('Error getting batches by date range:', error)
      throw error
    }
  }

  /**
   * Get a specific batch with its items
   */
  static async getBatchWithItems(batchId: string): Promise<(WarehouseBatch & { items: WarehouseItem[] }) | null> {
    try {
      const businessId = requireBusinessId()
      const batch = await db.warehouseBatches.get(batchId)
      if (!batch || batch.businessId !== businessId) return null

      const items = await db.warehouseItems.where(['businessId', 'batchId']).equals([businessId, batchId]).toArray()
      return { ...batch, items }
    } catch (error) {
      console.error('Error getting batch with items:', error)
      throw error
    }
  }

  /**
   * Delete a warehouse batch and all its items
   */
  static async deleteBatch(batchId: string): Promise<void> {
    try {
      const businessId = requireBusinessId()
      // Verify batch belongs to current business before deleting
      const batch = await db.warehouseBatches.get(batchId)
      if (!batch || batch.businessId !== businessId) {
        throw new Error('Warehouse batch not found or access denied')
      }

      await db.transaction('rw', [db.warehouseBatches, db.warehouseItems], async () => {
        await db.warehouseItems.where(['businessId', 'batchId']).equals([businessId, batchId]).delete()
        await db.warehouseBatches.delete(batchId)
      })
    } catch (error) {
      console.error('Error deleting warehouse batch:', error)
      throw error
    }
  }

  /**
   * Update warehouse batch
   */
  static async updateBatch(batchId: string, updates: Partial<Omit<WarehouseBatch, 'id' | 'batchNumber' | 'createdAt'>>): Promise<void> {
    try {
      const businessId = requireBusinessId()
      // Verify batch belongs to current business before updating
      const batch = await db.warehouseBatches.get(batchId)
      if (!batch || batch.businessId !== businessId) {
        throw new Error('Warehouse batch not found or access denied')
      }

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await db.warehouseBatches.update(batchId, updateData)
    } catch (error) {
      console.error('Error updating warehouse batch:', error)
      throw error
    }
  }

  /**
   * Update warehouse item
   */
  static async updateItem(itemId: string, updates: Partial<Omit<WarehouseItem, 'id' | 'batchId' | 'createdAt'>>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await db.warehouseItems.update(itemId, updateData)
    } catch (error) {
      console.error('Error updating warehouse item:', error)
      throw error
    }
  }

  /**
   * Get warehouse statistics
   */
  static async getWarehouseStats(): Promise<{
    totalBatches: number
    totalItems: number
    totalValue: number
    latestBatch?: WarehouseBatch
  }> {
    try {
      const businessId = requireBusinessId()
      const totalBatches = await db.warehouseBatches.where('businessId').equals(businessId).count()
      const totalItems = await db.warehouseItems.where('businessId').equals(businessId).count()

      const allItems = await db.warehouseItems.where('businessId').equals(businessId).toArray()
      const totalValue = allItems.reduce((sum: number, item: WarehouseItem) => {
        const cost = typeof item.totalCost === 'number' && !isNaN(item.totalCost) ? item.totalCost : 0
        return sum + cost
      }, 0)

      const batches = await db.warehouseBatches.where('businessId').equals(businessId).reverse().sortBy('batchNumber')
      const latestBatch = batches[0]

      return {
        totalBatches,
        totalItems,
        totalValue,
        latestBatch
      }
    } catch (error) {
      console.error('Error getting warehouse statistics:', error)
      throw error
    }
  }
}
