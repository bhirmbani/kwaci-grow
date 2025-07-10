import { useState, useEffect, useCallback, useMemo } from 'react'
import { FinancialItemsService } from '../lib/services/financialItemsService'
import { type FinancialItem, type FinancialItemCategory } from '../lib/db/schema'
import type { FinancialItem as AppFinancialItem } from '../types'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

interface UseFinancialItemsResult {
  items: AppFinancialItem[]
  loading: boolean
  error: string | null
  addItem: (item: Omit<AppFinancialItem, 'id'>) => Promise<void>
  updateItem: (id: string, updates: Partial<AppFinancialItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  updateItems: (items: AppFinancialItem[]) => Promise<void>
  refetch: () => Promise<void>
}

// Convert database FinancialItem to app FinancialItem
function dbToAppItem(dbItem: FinancialItem): AppFinancialItem {
  console.log('🔄 dbToAppItem: Converting DB item to App item:', {
    id: dbItem.id,
    name: dbItem.name,
    isFixedAsset: dbItem.isFixedAsset,
    estimatedUsefulLifeYears: dbItem.estimatedUsefulLifeYears,
    sourceAssetId: dbItem.sourceAssetId
  })

  const appItem = {
    id: dbItem.id,
    name: dbItem.name,
    value: dbItem.value,
    note: dbItem.note || '',
    // Include COGS calculation fields
    baseUnitCost: dbItem.baseUnitCost,
    baseUnitQuantity: dbItem.baseUnitQuantity,
    usagePerCup: dbItem.usagePerCup,
    unit: dbItem.unit,
    // Include fixed asset management fields
    isFixedAsset: dbItem.isFixedAsset,
    estimatedUsefulLifeYears: dbItem.estimatedUsefulLifeYears,
    sourceAssetId: dbItem.sourceAssetId,
  }

  console.log('✅ dbToAppItem: Converted to App item:', appItem)
  return appItem
}

// Convert app FinancialItem to database format
function appToDbItem(appItem: AppFinancialItem, category: FinancialItemCategory): Omit<FinancialItem, 'createdAt' | 'updatedAt'> {
  console.log('🔄 appToDbItem: Converting App item to DB item:', {
    id: appItem.id,
    name: appItem.name,
    isFixedAsset: appItem.isFixedAsset,
    estimatedUsefulLifeYears: appItem.estimatedUsefulLifeYears,
    sourceAssetId: appItem.sourceAssetId
  })

  const dbItem = {
    id: appItem.id,
    name: appItem.name,
    value: appItem.value,
    category,
    note: appItem.note || '',
    // Include COGS calculation fields
    baseUnitCost: appItem.baseUnitCost,
    baseUnitQuantity: appItem.baseUnitQuantity,
    usagePerCup: appItem.usagePerCup,
    unit: appItem.unit,
    // Include fixed asset management fields
    isFixedAsset: appItem.isFixedAsset,
    estimatedUsefulLifeYears: appItem.estimatedUsefulLifeYears,
    sourceAssetId: appItem.sourceAssetId,
  }

  console.log('✅ appToDbItem: Converted to DB item:', dbItem)
  return dbItem
}

export function useFinancialItems(category: FinancialItemCategory): UseFinancialItemsResult {
  const [items, setItems] = useState<AppFinancialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dbItems = await FinancialItemsService.getByCategory(category)
      const appItems = dbItems.map(dbToAppItem)
      setItems(appItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial items')
      console.error('Error fetching financial items:', err)
    } finally {
      setLoading(false)
    }
  }, [category, currentBusinessId])

  const addItem = useCallback(async (item: Omit<AppFinancialItem, 'id'>) => {
    try {
      setError(null)
      const id = Date.now().toString() // Generate simple ID
      const newItem = { ...item, id }

      // Optimistic update - add to UI immediately
      setItems(prevItems => [...prevItems, newItem])

      // Create in database in background
      const dbItem = appToDbItem(newItem, category)
      await FinancialItemsService.create(dbItem)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add financial item')
      console.error('Error adding financial item:', err)
      // Revert optimistic update by refetching
      await fetchItems()
      throw err
    }
  }, [category, fetchItems])

  const updateItem = useCallback(async (id: string, updates: Partial<AppFinancialItem>) => {
    try {
      setError(null)

      // Optimistic update - update UI immediately
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      )

      // Update database in background
      await FinancialItemsService.update(id, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update financial item')
      console.error('Error updating financial item:', err)
      // Revert optimistic update by refetching
      await fetchItems()
      throw err
    }
  }, [fetchItems])

  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null)

      // Optimistic update - remove from UI immediately
      setItems(prevItems => prevItems.filter(item => item.id !== id))

      // Delete from database in background
      await FinancialItemsService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete financial item')
      console.error('Error deleting financial item:', err)
      // Revert optimistic update by refetching
      await fetchItems()
      throw err
    }
  }, [fetchItems])

  const updateItems = useCallback(async (newItems: AppFinancialItem[]) => {
    // Store previous items for potential rollback
    const previousItems = items

    try {
      setError(null)

      // Optimistic update - update UI immediately
      setItems(newItems)

      // Update database in background
      const dbItems = newItems.map(item => appToDbItem(item, category))
      await FinancialItemsService.updateCategory(category, dbItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update financial items')
      console.error('Error updating financial items:', err)
      // Revert optimistic update
      setItems(previousItems)
      throw err
    }
  }, [category, items])

  const refetch = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    updateItems,
    refetch,
  }), [items, loading, error, addItem, updateItem, deleteItem, updateItems, refetch])
}
