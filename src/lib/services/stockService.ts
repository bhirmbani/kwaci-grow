import { db } from '../db'
import type { StockLevel, StockTransaction, NewStockLevel, NewStockTransaction } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'
import { requireBusinessId, withBusinessId } from './businessContext'

/**
 * Set the business ID provider function
 * This allows the service to get the current business ID without direct store dependency
 */
export function setBusinessIdProvider(_provider: () => string | null) {
  // This function is required for business context initialization
  // The provider is not used directly in this service since we use requireBusinessId()
}

export class StockService {
  /**
   * Get current stock level for an ingredient
   */
  static async getStockLevel(ingredientName: string, unit: string): Promise<StockLevel | null> {
    try {
      // Validate parameters to prevent IDBKeyRange errors
      if (!ingredientName || typeof ingredientName !== 'string') {
        throw new Error('Invalid ingredientName parameter')
      }
      if (!unit || typeof unit !== 'string') {
        throw new Error('Invalid unit parameter')
      }

      const businessId = requireBusinessId()

      // Filter by business ID, ingredient name, and unit
      return await db.stockLevels
        .where('businessId')
        .equals(businessId)
        .and(stock => stock.ingredientName === ingredientName && stock.unit === unit)
        .first() || null
    } catch (error) {
      console.error('Error getting stock level:', error)
      throw error
    }
  }

  /**
   * Get all stock levels
   */
  static async getAllStockLevels(): Promise<StockLevel[]> {
    try {
      const businessId = requireBusinessId()
      return await db.stockLevels
        .where('businessId')
        .equals(businessId)
        .sortBy('ingredientName')
    } catch (error) {
      console.error('Error getting all stock levels:', error)
      throw error
    }
  }

  /**
   * Create or update stock level
   */
  static async upsertStockLevel(stockData: Omit<NewStockLevel, 'id'>): Promise<StockLevel> {
    try {
      const now = new Date().toISOString()
      const existing = await this.getStockLevel(stockData.ingredientName, stockData.unit)

      if (existing) {
        const updatedStock: StockLevel = {
          ...existing,
          ...stockData,
          lastUpdated: now,
          updatedAt: now
        }
        await db.stockLevels.update(existing.id, updatedStock)
        return updatedStock
      } else {
        const newStock: StockLevel = withBusinessId({
          id: uuidv4(),
          ...stockData,
          lastUpdated: now,
          createdAt: now,
          updatedAt: now
        })
        await db.stockLevels.add(newStock)
        return newStock
      }
    } catch (error) {
      console.error('Error upserting stock level:', error)
      throw error
    }
  }

  /**
   * Add stock (from warehouse additions)
   */
  static async addStock(
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    batchId?: string
  ): Promise<void> {
    try {
      await db.transaction('rw', [db.stockLevels, db.stockTransactions], async () => {
        // Get current stock level
        const currentStock = await this.getStockLevel(ingredientName, unit)
        const newCurrentStock = (currentStock?.currentStock || 0) + quantity

        // Update stock level
        await this.upsertStockLevel({
          ingredientName,
          unit,
          currentStock: newCurrentStock,
          reservedStock: currentStock?.reservedStock || 0,
          lowStockThreshold: currentStock?.lowStockThreshold || 10 // Default threshold
        })

        // Record transaction
        await this.recordTransaction({
          ingredientName,
          unit,
          transactionType: 'ADD',
          quantity,
          reason,
          batchId,
          transactionDate: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error adding stock:', error)
      throw error
    }
  }

  /**
   * Deduct stock (for sales)
   */
  static async deductStock(
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string
  ): Promise<{ success: boolean; availableStock?: number }> {
    try {
      let result = { success: false, availableStock: 0 }

      await db.transaction('rw', [db.stockLevels, db.stockTransactions], async () => {
        // Get current stock level
        const currentStock = await this.getStockLevel(ingredientName, unit)
        
        if (!currentStock) {
          result = { success: false, availableStock: 0 }
          return
        }

        const availableStock = currentStock.currentStock - currentStock.reservedStock
        
        if (availableStock < quantity) {
          result = { success: false, availableStock }
          return
        }

        // Update stock level
        await this.upsertStockLevel({
          ...currentStock,
          currentStock: currentStock.currentStock - quantity
        })

        // Record transaction
        await this.recordTransaction({
          ingredientName,
          unit,
          transactionType: 'DEDUCT',
          quantity: -quantity, // Negative for deduction
          reason,
          transactionDate: new Date().toISOString()
        })

        result = { success: true, availableStock: availableStock - quantity }
      })

      return result
    } catch (error) {
      console.error('Error deducting stock:', error)
      throw error
    }
  }

  /**
   * Record a stock transaction
   */
  static async recordTransaction(transactionData: Omit<NewStockTransaction, 'id'>): Promise<StockTransaction> {
    try {
      const now = new Date().toISOString()
      const transaction: StockTransaction = withBusinessId({
        id: uuidv4(),
        ...transactionData,
        createdAt: now,
        updatedAt: now
      })

      await db.stockTransactions.add(transaction)
      return transaction
    } catch (error) {
      console.error('Error recording stock transaction:', error)
      throw error
    }
  }

  /**
   * Get stock transactions for an ingredient
   */
  static async getStockTransactions(
    ingredientName?: string,
    unit?: string,
    limit: number = 50
  ): Promise<StockTransaction[]> {
    try {
      const businessId = requireBusinessId()
      let query = db.stockTransactions
        .where('businessId')
        .equals(businessId)
        .reverse()
        .sortBy('transactionDate')

      // Apply additional filters after getting business-specific transactions
      const transactions = await query
      let filtered = transactions

      if (ingredientName && unit) {
        filtered = transactions.filter(t => t.ingredientName === ingredientName && t.unit === unit)
      } else if (ingredientName) {
        filtered = transactions.filter(t => t.ingredientName === ingredientName)
      }

      return filtered.slice(0, limit)
    } catch (error) {
      console.error('Error getting stock transactions:', error)
      throw error
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(): Promise<StockLevel[]> {
    try {
      const businessId = requireBusinessId()
      return await db.stockLevels
        .where('businessId')
        .equals(businessId)
        .filter(stock => stock.currentStock <= stock.lowStockThreshold)
        .toArray()
    } catch (error) {
      console.error('Error getting low stock alerts:', error)
      throw error
    }
  }

  /**
   * Process sales and deduct ingredients automatically
   */
  static async processSale(cupsSold: number, ingredients: { name: string; unit: string; usagePerCup: number }[]): Promise<{
    success: boolean
    errors: string[]
    deductions: { ingredient: string; quantity: number; newStock: number }[]
  }> {
    const errors: string[] = []
    const deductions: { ingredient: string; quantity: number; newStock: number }[] = []

    try {
      // First, check if we have enough stock for all ingredients
      for (const ingredient of ingredients) {
        const requiredQuantity = ingredient.usagePerCup * cupsSold
        const stockLevel = await this.getStockLevel(ingredient.name, ingredient.unit)
        
        if (!stockLevel) {
          errors.push(`No stock record found for ${ingredient.name}`)
          continue
        }

        const availableStock = stockLevel.currentStock - stockLevel.reservedStock
        if (availableStock < requiredQuantity) {
          errors.push(`Insufficient stock for ${ingredient.name}: need ${requiredQuantity}, have ${availableStock}`)
        }
      }

      // If there are errors, don't process the sale
      if (errors.length > 0) {
        return { success: false, errors, deductions: [] }
      }

      // Process deductions
      for (const ingredient of ingredients) {
        const requiredQuantity = ingredient.usagePerCup * cupsSold
        const result = await this.deductStock(
          ingredient.name,
          ingredient.unit,
          requiredQuantity,
          `Sale: ${cupsSold} cups sold`
        )

        if (result.success) {
          deductions.push({
            ingredient: ingredient.name,
            quantity: requiredQuantity,
            newStock: result.availableStock || 0
          })
        } else {
          errors.push(`Failed to deduct stock for ${ingredient.name}`)
        }
      }

      return { success: errors.length === 0, errors, deductions }
    } catch (error) {
      console.error('Error processing sale:', error)
      return { success: false, errors: ['Unexpected error processing sale'], deductions: [] }
    }
  }

  /**
   * Update low stock threshold
   */
  static async updateLowStockThreshold(
    ingredientName: string,
    unit: string,
    threshold: number
  ): Promise<void> {
    try {
      const stockLevel = await this.getStockLevel(ingredientName, unit)
      if (stockLevel) {
        await this.upsertStockLevel({
          ...stockLevel,
          lowStockThreshold: threshold
        })
      }
    } catch (error) {
      console.error('Error updating low stock threshold:', error)
      throw error
    }
  }

  /**
   * Reserve stock for pending orders or commitments
   */
  static async reserveStock(
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string,
    reservationPurpose?: string,
    productionBatchId?: string
  ): Promise<{ success: boolean; availableStock?: number; error?: string }> {
    try {
      if (quantity <= 0) {
        return { success: false, error: 'Reservation quantity must be positive' }
      }

      let result = { success: false, availableStock: 0 }

      await db.transaction('rw', [db.stockLevels, db.stockTransactions], async () => {
        // Get current stock level
        const currentStock = await this.getStockLevel(ingredientName, unit)

        if (!currentStock) {
          result = { success: false, availableStock: 0, error: 'Stock record not found' }
          return
        }

        const availableStock = currentStock.currentStock - currentStock.reservedStock

        if (availableStock < quantity) {
          result = {
            success: false,
            availableStock,
            error: `Insufficient available stock: need ${quantity}, have ${availableStock}`
          }
          return
        }

        // Update stock level with new reservation
        await this.upsertStockLevel({
          ...currentStock,
          reservedStock: currentStock.reservedStock + quantity
        })

        // Record transaction
        await this.recordTransaction({
          ingredientName,
          unit,
          transactionType: 'RESERVE',
          quantity,
          reason,
          reservationId,
          reservationPurpose,
          productionBatchId,
          transactionDate: new Date().toISOString()
        })

        result = { success: true, availableStock: availableStock - quantity }
      })

      return result
    } catch (error) {
      console.error('Error reserving stock:', error)
      return { success: false, error: 'Unexpected error reserving stock' }
    }
  }

  /**
   * Unreserve stock (release reservation)
   */
  static async unreserveStock(
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string,
    reservationPurpose?: string,
    productionBatchId?: string
  ): Promise<{ success: boolean; availableStock?: number; error?: string }> {
    try {
      if (quantity <= 0) {
        return { success: false, error: 'Unreservation quantity must be positive' }
      }

      let result = { success: false, availableStock: 0 }

      await db.transaction('rw', [db.stockLevels, db.stockTransactions], async () => {
        // Get current stock level
        const currentStock = await this.getStockLevel(ingredientName, unit)

        if (!currentStock) {
          result = { success: false, availableStock: 0, error: 'Stock record not found' }
          return
        }

        if (currentStock.reservedStock < quantity) {
          result = {
            success: false,
            availableStock: currentStock.currentStock - currentStock.reservedStock,
            error: `Cannot unreserve more than reserved: trying to unreserve ${quantity}, have ${currentStock.reservedStock} reserved`
          }
          return
        }

        // Update stock level with reduced reservation
        const newReservedStock = currentStock.reservedStock - quantity
        await this.upsertStockLevel({
          ...currentStock,
          reservedStock: newReservedStock
        })

        // Record transaction
        await this.recordTransaction({
          ingredientName,
          unit,
          transactionType: 'UNRESERVE',
          quantity: -quantity, // Negative for unreservation
          reason,
          reservationId,
          reservationPurpose,
          productionBatchId,
          transactionDate: new Date().toISOString()
        })

        result = { success: true, availableStock: currentStock.currentStock - newReservedStock }
      })

      return result
    } catch (error) {
      console.error('Error unreserving stock:', error)
      return { success: false, error: 'Unexpected error unreserving stock' }
    }
  }

  /**
   * Update existing reservation quantity
   */
  static async updateReservation(
    ingredientName: string,
    unit: string,
    newQuantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; availableStock?: number; error?: string }> {
    try {
      if (newQuantity < 0) {
        return { success: false, error: 'Reservation quantity cannot be negative' }
      }

      let result = { success: false, availableStock: 0 }

      await db.transaction('rw', [db.stockLevels, db.stockTransactions], async () => {
        // Get current stock level
        const currentStock = await this.getStockLevel(ingredientName, unit)

        if (!currentStock) {
          result = { success: false, availableStock: 0, error: 'Stock record not found' }
          return
        }

        const currentReserved = currentStock.reservedStock
        const availableStock = currentStock.currentStock - currentReserved
        const reservationDifference = newQuantity - currentReserved

        // If increasing reservation, check if we have enough available stock
        if (reservationDifference > 0 && availableStock < reservationDifference) {
          result = {
            success: false,
            availableStock,
            error: `Insufficient available stock for reservation increase: need ${reservationDifference} more, have ${availableStock}`
          }
          return
        }

        // Update stock level with new reservation amount
        await this.upsertStockLevel({
          ...currentStock,
          reservedStock: newQuantity
        })

        // Record transaction for the change
        if (reservationDifference !== 0) {
          await this.recordTransaction({
            ingredientName,
            unit,
            transactionType: reservationDifference > 0 ? 'RESERVE' : 'UNRESERVE',
            quantity: Math.abs(reservationDifference) * (reservationDifference > 0 ? 1 : -1),
            reason: `${reason} (Updated reservation from ${currentReserved} to ${newQuantity})`,
            reservationId,
            transactionDate: new Date().toISOString()
          })
        }

        result = { success: true, availableStock: currentStock.currentStock - newQuantity }
      })

      return result
    } catch (error) {
      console.error('Error updating reservation:', error)
      return { success: false, error: 'Unexpected error updating reservation' }
    }
  }

  /**
   * Allocate stock for production (reserve with production purpose)
   */
  static async allocateForProduction(
    ingredientName: string,
    unit: string,
    quantity: number,
    productionBatchId: string,
    batchNumber: number
  ): Promise<{ success: boolean; availableStock?: number; error?: string }> {
    const reservationPurpose = `Production Batch #${batchNumber}`
    const reason = `Allocated for ${reservationPurpose}`

    return this.reserveStock(
      ingredientName,
      unit,
      quantity,
      reason,
      productionBatchId,
      reservationPurpose,
      productionBatchId
    )
  }

  /**
   * Complete production and convert allocation to actual deduction
   */
  static async completeProduction(
    ingredientName: string,
    unit: string,
    quantity: number,
    productionBatchId: string,
    batchNumber: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const reservationPurpose = `Production Batch #${batchNumber}`

      // First unreserve the stock
      const unreserveResult = await this.unreserveStock(
        ingredientName,
        unit,
        quantity,
        `${reservationPurpose} completed`,
        productionBatchId,
        reservationPurpose,
        productionBatchId
      )

      if (!unreserveResult.success) {
        return { success: false, error: unreserveResult.error }
      }

      // Then deduct the stock permanently
      const deductResult = await this.deductStock(
        ingredientName,
        unit,
        quantity,
        `${reservationPurpose} completed`
      )

      if (!deductResult.success) {
        return { success: false, error: 'Failed to deduct stock after unreserving' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error completing production:', error)
      return { success: false, error: 'Unexpected error completing production' }
    }
  }

  /**
   * Get all reservations with their purposes
   */
  static async getReservationsWithPurpose(): Promise<Array<{
    ingredientName: string
    unit: string
    quantity: number
    purpose: string
    reservationId?: string
    productionBatchId?: string
    transactionDate: string
  }>> {
    try {
      const reserveTransactions = await db.stockTransactions
        .where('transactionType')
        .equals('RESERVE')
        .toArray()

      return reserveTransactions.map(tx => ({
        ingredientName: tx.ingredientName,
        unit: tx.unit,
        quantity: tx.quantity,
        purpose: tx.reservationPurpose || 'Manual Reservation',
        reservationId: tx.reservationId,
        productionBatchId: tx.productionBatchId,
        transactionDate: tx.transactionDate
      }))
    } catch (error) {
      console.error('Error getting reservations with purpose:', error)
      throw error
    }
  }
}
