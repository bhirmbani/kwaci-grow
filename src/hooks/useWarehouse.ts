import { useState, useEffect, useCallback } from 'react'
import { WarehouseService } from '@/lib/services/warehouseService'
import type { WarehouseBatch, WarehouseItem } from '@/lib/db/schema'
import type { ShoppingListItem } from '@/utils/cogsCalculations'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

export interface WarehouseBatchWithItems extends WarehouseBatch {
  items: WarehouseItem[]
}

export function useWarehouse() {
  const [batches, setBatches] = useState<WarehouseBatchWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const batchesWithItems = await WarehouseService.getAllBatchesWithItems()
      setBatches(batchesWithItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouse batches')
      console.error('Error loading warehouse batches:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const addFromShoppingList = useCallback(async (
    shoppingListItems: ShoppingListItem[],
    note?: string
  ): Promise<{ success: boolean; batch?: WarehouseBatch; error?: string }> => {
    try {
      setError(null)
      const result = await WarehouseService.createWarehouseEntryFromShoppingList(shoppingListItems, note)
      
      // Reload batches to include the new one
      await loadBatches()
      
      return { success: true, batch: result.batch }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add items to warehouse'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const deleteBatch = useCallback(async (batchId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await WarehouseService.deleteBatch(batchId)
      
      // Reload batches to reflect the deletion
      await loadBatches()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete warehouse batch'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const updateBatch = useCallback(async (
    batchId: string,
    updates: Partial<Pick<WarehouseBatch, 'note' | 'dateAdded'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await WarehouseService.updateBatch(batchId, updates)
      
      // Reload batches to reflect the update
      await loadBatches()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warehouse batch'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadBatches])

  const updateItem = useCallback(async (
    itemId: string,
    updates: Partial<Pick<WarehouseItem, 'ingredientName' | 'quantity' | 'unit' | 'costPerUnit' | 'totalCost' | 'note'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await WarehouseService.updateItem(itemId, updates)
      
      // Reload batches to reflect the update
      await loadBatches()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warehouse item'
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
    addFromShoppingList,
    deleteBatch,
    updateBatch,
    updateItem
  }
}

export function useWarehouseStats() {
  const [stats, setStats] = useState<{
    totalBatches: number
    totalItems: number
    totalValue: number
    latestBatch?: WarehouseBatch
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const warehouseStats = await WarehouseService.getWarehouseStats()
      setStats(warehouseStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouse statistics')
      console.error('Error loading warehouse statistics:', err)
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
