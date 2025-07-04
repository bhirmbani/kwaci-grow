import { useState, useEffect, useCallback, useMemo } from 'react'
import { useFinancialItems } from './useFinancialItems'
import { DepreciationService } from '../lib/services/depreciationService'
import { FINANCIAL_ITEM_CATEGORIES } from '../lib/db/schema'
import type { FinancialItem as AppFinancialItem } from '../types'
import type { FinancialItem as DbFinancialItem } from '../lib/db/schema'

interface UseInitialCapitalItemsResult {
  items: AppFinancialItem[]
  loading: boolean
  error: string | null
  updateItems: (items: AppFinancialItem[]) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Convert AppFinancialItem to DbFinancialItem for depreciation service
 * Note: This is used for depreciation service calls, not for database persistence
 */
function appToDbItem(appItem: AppFinancialItem): DbFinancialItem {
  const now = new Date().toISOString()
  return {
    id: appItem.id,
    name: appItem.name,
    value: appItem.value,
    category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
    note: appItem.note || '',
    // For depreciation service, we need valid timestamps but they don't affect the actual DB
    createdAt: now,
    updatedAt: now,
    baseUnitCost: appItem.baseUnitCost,
    baseUnitQuantity: appItem.baseUnitQuantity,
    usagePerCup: appItem.usagePerCup,
    unit: appItem.unit,
    isFixedAsset: appItem.isFixedAsset,
    estimatedUsefulLifeYears: appItem.estimatedUsefulLifeYears,
    sourceAssetId: appItem.sourceAssetId
  }
}

export function useInitialCapitalItems(): UseInitialCapitalItemsResult {
  const {
    items,
    loading,
    error: baseError,
    updateItems: baseUpdateItems,
    refetch: baseRefetch
  } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL)

  const [error, setError] = useState<string | null>(null)
  const [previousItems, setPreviousItems] = useState<AppFinancialItem[]>([])

  // Track previous items for comparison
  useEffect(() => {
    setPreviousItems(items)
  }, [items])

  const updateItems = useCallback(async (newItems: AppFinancialItem[]) => {
    console.log('🔄 useInitialCapitalItems: Starting update with items:', newItems)

    try {
      setError(null)

      // STEP 1: First update the base items to ensure data persistence
      console.log('📝 Step 1: Updating base items in database...')
      await baseUpdateItems(newItems)
      console.log('✅ Step 1: Base items updated successfully')

      // STEP 2: Handle depreciation logic after items are saved
      console.log('🏭 Step 2: Processing depreciation logic...')

      // Handle deleted items first
      const deletedItems = previousItems.filter(
        prevItem => !newItems.find(newItem => newItem.id === prevItem.id)
      )

      for (const deletedItem of deletedItems) {
        // Skip if this is a depreciation entry
        if (deletedItem.sourceAssetId) {
          continue
        }

        if (deletedItem.isFixedAsset) {
          console.log(`🗑️ Handling deletion of fixed asset: ${deletedItem.name}`)
          await DepreciationService.handleFixedAssetDeletion(deletedItem.id, deletedItem.name)
        }
      }

      // Handle updated/new items
      for (const newItem of newItems) {
        const previousItem = previousItems.find(item => item.id === newItem.id)

        // Skip if this is a depreciation entry (has sourceAssetId)
        if (newItem.sourceAssetId) {
          continue
        }

        // Handle fixed asset changes
        if (hasFixedAssetChanges(previousItem, newItem)) {
          console.log(`🔧 Processing fixed asset changes for: ${newItem.name}`, {
            isFixedAsset: newItem.isFixedAsset,
            usefulLife: newItem.estimatedUsefulLifeYears,
            value: newItem.value
          })

          const dbPreviousItem = previousItem ? appToDbItem(previousItem) : null
          const dbNewItem = appToDbItem(newItem)
          await DepreciationService.handleFixedAssetChange(dbPreviousItem, dbNewItem)
          console.log(`✅ Fixed asset processing completed for: ${newItem.name}`)
        }
      }

      console.log('✅ Step 2: Depreciation logic completed successfully')

      // STEP 3: Trigger Fixed Costs refresh (for real-time UI updates)
      console.log('🔄 Step 3: Triggering Fixed Costs refresh...')
      // We'll implement this next

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update initial capital items'
      setError(errorMessage)
      console.error('❌ Error updating initial capital items:', err)
      throw err
    }
  }, [previousItems, baseUpdateItems])

  const refetch = useCallback(async () => {
    try {
      setError(null)
      await baseRefetch()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refetch initial capital items'
      setError(errorMessage)
      console.error('Error refetching initial capital items:', err)
      throw err
    }
  }, [baseRefetch])

  // Combine errors from base hook and depreciation logic
  const combinedError = error || baseError

  return useMemo(() => ({
    items,
    loading,
    error: combinedError,
    updateItems,
    refetch
  }), [items, loading, combinedError, updateItems, refetch])
}

/**
 * Check if there are changes that affect fixed asset depreciation
 */
function hasFixedAssetChanges(
  previousItem: AppFinancialItem | undefined,
  currentItem: AppFinancialItem
): boolean {
  if (!previousItem) {
    // New item - check if it's a fixed asset
    return currentItem.isFixedAsset === true
  }

  // Check for changes in fixed asset status
  const wasFixedAsset = previousItem.isFixedAsset === true
  const isFixedAsset = currentItem.isFixedAsset === true

  if (wasFixedAsset !== isFixedAsset) {
    return true
  }

  // If it's a fixed asset, check for changes in value or useful life
  if (isFixedAsset) {
    return (
      previousItem.value !== currentItem.value ||
      previousItem.estimatedUsefulLifeYears !== currentItem.estimatedUsefulLifeYears ||
      previousItem.name !== currentItem.name
    )
  }

  return false
}
