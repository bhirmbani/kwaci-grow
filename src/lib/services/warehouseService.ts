import { db } from '../db'
import type { WarehouseBatch, WarehouseItem, NewWarehouseBatch, NewWarehouseItem } from '../db/schema'
import type { ShoppingListItem } from '@/utils/cogsCalculations'
import { v4 as uuidv4 } from 'uuid'

export class WarehouseService {
  /**
   * Get the next batch number by counting existing batches and adding 1
   */
  static async getNextBatchNumber(): Promise<number> {
    try {
      const count = await db.warehouseBatches.count()
      return count + 1
    } catch (error) {
      console.error('Error getting next batch number:', error)
      throw error
    }
  }

  /**
   * Create a new warehouse batch
   */
  static async createBatch(batchData: Omit<NewWarehouseBatch, 'id' | 'batchNumber'>): Promise<WarehouseBatch> {
    try {
      const batchNumber = await this.getNextBatchNumber()
      const now = new Date().toISOString()
      
      const newBatch: WarehouseBatch = {
        id: uuidv4(),
        batchNumber,
        dateAdded: batchData.dateAdded,
        note: batchData.note || '',
        createdAt: now,
        updatedAt: now
      }

      await db.warehouseBatches.add(newBatch)
      return newBatch
    } catch (error) {
      console.error('Error creating warehouse batch:', error)
      throw error
    }
  }

  /**
   * Add items to a warehouse batch
   */
  static async addItemsToBatch(batchId: string, items: Omit<NewWarehouseItem, 'id' | 'batchId'>[]): Promise<WarehouseItem[]> {
    try {
      const now = new Date().toISOString()
      
      const warehouseItems: WarehouseItem[] = items.map(item => ({
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

      await db.warehouseItems.bulkAdd(warehouseItems)
      return warehouseItems
    } catch (error) {
      console.error('Error adding items to warehouse batch:', error)
      throw error
    }
  }

  /**
   * Convert shopping list items to warehouse items format
   */
  static convertShoppingListToWarehouseItems(shoppingListItems: ShoppingListItem[]): Omit<NewWarehouseItem, 'id' | 'batchId'>[] {
    return shoppingListItems.map(item => ({
      ingredientName: item.name,
      quantity: item.totalNeeded,
      unit: item.unit,
      costPerUnit: item.unitCost,
      totalCost: item.totalCost,
      note: `Added from COGS calculator - ${item.formattedQuantity} needed`
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
        note: note || `Batch created from COGS calculator on ${new Date().toLocaleDateString()}`
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
      const batches = await db.warehouseBatches.orderBy('batchNumber').reverse().toArray()
      
      const batchesWithItems = await Promise.all(
        batches.map(async (batch) => {
          const items = await db.warehouseItems.where('batchId').equals(batch.id).toArray()
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
      return await db.warehouseBatches
        .where('dateAdded')
        .between(startDate, endDate, true, true)
        .toArray()
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
      const batch = await db.warehouseBatches.get(batchId)
      if (!batch) return null

      const items = await db.warehouseItems.where('batchId').equals(batchId).toArray()
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
      await db.transaction('rw', [db.warehouseBatches, db.warehouseItems], async () => {
        await db.warehouseItems.where('batchId').equals(batchId).delete()
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
      const totalBatches = await db.warehouseBatches.count()
      const totalItems = await db.warehouseItems.count()
      
      const allItems = await db.warehouseItems.toArray()
      const totalValue = allItems.reduce((sum, item) => sum + item.totalCost, 0)
      
      const latestBatch = await db.warehouseBatches
        .orderBy('batchNumber')
        .reverse()
        .first()

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
