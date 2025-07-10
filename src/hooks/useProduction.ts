import { useState, useEffect, useCallback } from 'react'
import { ProductionService } from '@/lib/services/productionService'
import type { ProductionBatch, ProductionBatchWithItems, ProductionBatchStatus } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

export function useProduction() {
  const [batches, setBatches] = useState<ProductionBatchWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const batchesWithItems = await ProductionService.getAllBatchesWithItems()
      setBatches(batchesWithItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load production batches')
      console.error('Error loading production batches:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const createBatchWithItems = useCallback(async (
    batchData: { dateCreated: string; status?: ProductionBatchStatus; note?: string },
    items: Array<{ ingredientName: string; quantity: number; unit: string; note?: string }>
  ): Promise<{ success: boolean; error?: string; batch?: ProductionBatchWithItems }> => {
    try {
      setError(null)
      const batch = await ProductionService.createBatchWithItems(batchData, items)
      
      // Reload batches to reflect the new addition
      await loadBatches()
      
      return { success: true, batch }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create production batch'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const updateBatchStatus = useCallback(async (
    batchId: string,
    status: ProductionBatchStatus,
    onStockLevelsChanged?: () => void,
    outputData?: {
      productName: string
      outputQuantity: number
      outputUnit: string
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductionService.updateBatchStatus(batchId, status, outputData)

      // Reload batches to reflect the status change
      await loadBatches()

      // If batch was completed and callback provided, trigger stock levels refresh
      if (status === 'Completed' && onStockLevelsChanged) {
        onStockLevelsChanged()
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update batch status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const deleteBatch = useCallback(async (
    batchId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductionService.deleteBatch(batchId)
      
      // Reload batches to reflect the deletion
      await loadBatches()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete production batch'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const updateBatch = useCallback(async (
    batchId: string,
    updates: { note?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductionService.updateBatch(batchId, updates)
      
      // Reload batches to reflect the update
      await loadBatches()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update production batch'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  // Load batches on mount
  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  return {
    batches,
    loading,
    error,
    loadBatches,
    createBatchWithItems,
    updateBatchStatus,
    deleteBatch,
    updateBatch
  }
}

export function useProductionStats() {
  const [stats, setStats] = useState<{
    totalBatches: number
    pendingBatches: number
    inProgressBatches: number
    completedBatches: number
    totalItems: number
    latestBatch?: ProductionBatch
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const productionStats = await ProductionService.getProductionStats()
      setStats(productionStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load production statistics')
      console.error('Error loading production statistics:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    error,
    loadStats
  }
}

export function useProductionBatch(batchId: string) {
  const [batch, setBatch] = useState<ProductionBatchWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadBatch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const batchData = await ProductionService.getBatchWithItems(batchId)
      setBatch(batchData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load production batch')
      console.error('Error loading production batch:', err)
    } finally {
      setLoading(false)
    }
  }, [batchId, currentBusinessId])

  const updateStatus = useCallback(async (
    status: ProductionBatchStatus,
    onStockLevelsChanged?: () => void,
    outputData?: {
      productName: string
      outputQuantity: number
      outputUnit: string
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductionService.updateBatchStatus(batchId, status, outputData)

      // Reload batch to reflect the status change
      await loadBatch()

      // If batch was completed and callback provided, trigger stock levels refresh
      if (status === 'Completed' && onStockLevelsChanged) {
        onStockLevelsChanged()
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update batch status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [batchId, loadBatch])

  useEffect(() => {
    if (batchId) {
      loadBatch()
    }
  }, [loadBatch, batchId])

  return {
    batch,
    loading,
    error,
    loadBatch,
    updateStatus
  }
}
