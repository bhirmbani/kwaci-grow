import { useCallback, useMemo } from 'react'
import { useFinancialItems } from './useFinancialItems'
import { useDepreciationEvents } from '../lib/events/depreciationEvents'
import { FINANCIAL_ITEM_CATEGORIES } from '../lib/db/schema'
import type { FinancialItem } from '../types'

// Import the event type from the events module
type DepreciationEvent = {
  type: 'depreciation-changed'
  assetId: string
  assetName: string
  action: 'created' | 'updated' | 'deleted'
}

interface UseFixedCostsItemsResult {
  items: FinancialItem[]
  loading: boolean
  error: string | null
  updateItems: (items: FinancialItem[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useFixedCostsItems(): UseFixedCostsItemsResult {
  const {
    items,
    loading,
    error,
    updateItems,
    refetch
  } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS)

  // Listen for depreciation events and refresh when they occur
  const handleDepreciationEvent = useCallback((event: DepreciationEvent) => {
    console.log('🔄 Fixed Costs: Received depreciation event, refreshing...', event)
    // Refresh the Fixed Costs data to show the new/updated/deleted depreciation entry
    refetch().catch(console.error)
  }, [refetch])

  // Subscribe to depreciation events
  useDepreciationEvents(handleDepreciationEvent)

  return useMemo(() => ({
    items,
    loading,
    error,
    updateItems,
    refetch
  }), [items, loading, error, updateItems, refetch])
}
