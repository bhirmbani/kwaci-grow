import { db } from '../db'
import type { ProductTargetDefault, NewProductTargetDefault } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'

export class ProductTargetDefaultService {
  /**
   * Get the default target quantity for a specific product
   */
  static async getDefaultTargetQuantity(productId: string): Promise<number> {
    try {
      const targetDefault = await db.productTargetDefaults
        .where({ productId })
        .first()
      
      return targetDefault?.defaultTargetQuantityPerDay || 10 // Default to 10 if not set
    } catch (error) {
      console.error('Error fetching default target quantity:', error)
      return 10 // Fallback to default
    }
  }

  /**
   * Get all default target quantities as a Map
   */
  static async getAllDefaultTargetQuantities(): Promise<Map<string, number>> {
    try {
      const targetDefaults = await db.productTargetDefaults.toArray()
      const targetMap = new Map<string, number>()
      
      targetDefaults.forEach(target => {
        targetMap.set(target.productId, target.defaultTargetQuantityPerDay)
      })
      
      return targetMap
    } catch (error) {
      console.error('Error fetching all default target quantities:', error)
      return new Map() // Return empty map on error
    }
  }

  /**
   * Set the default target quantity for a specific product
   */
  static async setDefaultTargetQuantity(
    productId: string, 
    defaultTargetQuantityPerDay: number,
    note: string = ''
  ): Promise<ProductTargetDefault> {
    try {
      const now = new Date().toISOString()

      // Check if a default already exists for this product
      const existingDefault = await db.productTargetDefaults
        .where({ productId })
        .first()

      if (existingDefault) {
        // Update existing default
        const updatedDefault: ProductTargetDefault = {
          ...existingDefault,
          defaultTargetQuantityPerDay,
          note,
          updatedAt: now
        }

        await db.productTargetDefaults.put(updatedDefault)
        return updatedDefault
      } else {
        // Create new default
        const newDefault: ProductTargetDefault = {
          id: uuidv4(),
          productId,
          defaultTargetQuantityPerDay,
          note,
          createdAt: now,
          updatedAt: now
        }

        await db.productTargetDefaults.add(newDefault)
        return newDefault
      }
    } catch (error) {
      console.error('Error setting default target quantity:', error)
      throw error
    }
  }

  /**
   * Delete the default target quantity for a specific product
   */
  static async deleteDefaultTargetQuantity(productId: string): Promise<void> {
    try {
      const existingDefault = await db.productTargetDefaults
        .where({ productId })
        .first()

      if (existingDefault) {
        await db.productTargetDefaults.delete(existingDefault.id)
      }
    } catch (error) {
      console.error('Error deleting default target quantity:', error)
      throw error
    }
  }

  /**
   * Get all product target defaults with product details
   */
  static async getAllWithProductDetails(): Promise<Array<ProductTargetDefault & { productName: string }>> {
    try {
      const targetDefaults = await db.productTargetDefaults.toArray()
      const results = []

      for (const targetDefault of targetDefaults) {
        const product = await db.products.get(targetDefault.productId)
        if (product) {
          results.push({
            ...targetDefault,
            productName: product.name
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching target defaults with product details:', error)
      throw error
    }
  }

  /**
   * Batch update multiple product target defaults
   */
  static async batchUpdateDefaults(
    updates: Array<{ productId: string; defaultTargetQuantityPerDay: number; note?: string }>
  ): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      for (const update of updates) {
        await this.setDefaultTargetQuantity(
          update.productId,
          update.defaultTargetQuantityPerDay,
          update.note || ''
        )
      }
    } catch (error) {
      console.error('Error batch updating target defaults:', error)
      throw error
    }
  }
}
