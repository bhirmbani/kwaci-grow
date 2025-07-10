import { useState, useEffect, useCallback } from 'react'
import { StockService } from '@/lib/services/stockService'
import type { StockLevel, StockTransaction } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

export function useStockLevels() {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadStockLevels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const levels = await StockService.getAllStockLevels()
      setStockLevels(levels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock levels')
      console.error('Error loading stock levels:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const processSale = useCallback(async (
    cupsSold: number,
    ingredients: { name: string; unit: string; usagePerCup: number }[]
  ): Promise<{ success: boolean; errors: string[] }> => {
    try {
      setError(null)
      const result = await StockService.processSale(cupsSold, ingredients)
      
      if (result.success) {
        // Reload stock levels to reflect changes
        await loadStockLevels()
      }
      
      return { success: result.success, errors: result.errors }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process sale'
      setError(errorMessage)
      return { success: false, errors: [errorMessage] }
    }
  }, [loadStockLevels])

  const updateLowStockThreshold = useCallback(async (
    ingredientName: string,
    unit: string,
    threshold: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await StockService.updateLowStockThreshold(ingredientName, unit, threshold)
      await loadStockLevels() // Reload to reflect changes
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update threshold'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadStockLevels])

  const reserveStock = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setError(null)
      const result = await StockService.reserveStock(ingredientName, unit, quantity, reason, reservationId)

      if (result.success) {
        // Reload stock levels to reflect changes
        await loadStockLevels()
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve stock'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadStockLevels])

  const unreserveStock = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setError(null)
      const result = await StockService.unreserveStock(ingredientName, unit, quantity, reason, reservationId)

      if (result.success) {
        // Reload stock levels to reflect changes
        await loadStockLevels()
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unreserve stock'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadStockLevels])

  const updateReservation = useCallback(async (
    ingredientName: string,
    unit: string,
    newQuantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setError(null)
      const result = await StockService.updateReservation(ingredientName, unit, newQuantity, reason, reservationId)

      if (result.success) {
        // Reload stock levels to reflect changes
        await loadStockLevels()
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reservation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadStockLevels])

  useEffect(() => {
    loadStockLevels()
  }, [loadStockLevels])

  return {
    stockLevels,
    loading,
    error,
    loadStockLevels,
    processSale,
    updateLowStockThreshold,
    reserveStock,
    unreserveStock,
    updateReservation
  }
}

export function useStockTransactions(ingredientName?: string, unit?: string) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const txns = await StockService.getStockTransactions(ingredientName, unit)
      setTransactions(txns)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock transactions')
      console.error('Error loading stock transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [ingredientName, unit, currentBusinessId])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    error,
    loadTransactions
  }
}

export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const lowStockItems = await StockService.getLowStockAlerts()
      setAlerts(lowStockItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load low stock alerts')
      console.error('Error loading low stock alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  return {
    alerts,
    loading,
    error,
    loadAlerts
  }
}

export function useStockLevel(ingredientName: string, unit: string) {
  const [stockLevel, setStockLevel] = useState<StockLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadStockLevel = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const level = await StockService.getStockLevel(ingredientName, unit)
      setStockLevel(level)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock level')
      console.error('Error loading stock level:', err)
    } finally {
      setLoading(false)
    }
  }, [ingredientName, unit, currentBusinessId])

  const deductStock = useCallback(async (
    quantity: number,
    reason: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setError(null)
      const result = await StockService.deductStock(ingredientName, unit, quantity, reason)
      
      if (result.success) {
        await loadStockLevel() // Reload to reflect changes
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deduct stock'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [ingredientName, unit, loadStockLevel])

  useEffect(() => {
    if (ingredientName && unit) {
      loadStockLevel()
    }
  }, [loadStockLevel, ingredientName, unit])

  return {
    stockLevel,
    loading,
    error,
    loadStockLevel,
    deductStock
  }
}

/**
 * Hook for managing stock reservations
 */
export function useStockReservations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reserveStock = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setLoading(true)
      setError(null)
      const result = await StockService.reserveStock(ingredientName, unit, quantity, reason, reservationId)

      if (!result.success && result.error) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve stock'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const unreserveStock = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setLoading(true)
      setError(null)
      const result = await StockService.unreserveStock(ingredientName, unit, quantity, reason, reservationId)

      if (!result.success && result.error) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unreserve stock'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReservation = useCallback(async (
    ingredientName: string,
    unit: string,
    newQuantity: number,
    reason: string,
    reservationId?: string
  ): Promise<{ success: boolean; error?: string; availableStock?: number }> => {
    try {
      setLoading(true)
      setError(null)
      const result = await StockService.updateReservation(ingredientName, unit, newQuantity, reason, reservationId)

      if (!result.success && result.error) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reservation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    reserveStock,
    unreserveStock,
    updateReservation
  }
}
