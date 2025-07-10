import { useState, useEffect, useCallback } from 'react'
import { FixedAssetService } from '../lib/services/fixedAssetService'
import { type FixedAsset, type NewFixedAsset } from '../lib/db/schema'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

interface UseFixedAssetsResult {
  assets: FixedAsset[]
  loading: boolean
  error: string | null
  summary: {
    totalAssets: number
    totalPurchaseCost: number
    totalCurrentValue: number
    totalDepreciation: number
  }
  addAsset: (asset: NewFixedAsset) => Promise<void>
  updateAsset: (id: string, updates: Partial<Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useFixedAssets(): UseFixedAssetsResult {
  const [assets, setAssets] = useState<FixedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalPurchaseCost: 0,
    totalCurrentValue: 0,
    totalDepreciation: 0
  })
  const currentBusinessId = useCurrentBusinessId()

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [assetsData, summaryData] = await Promise.all([
        FixedAssetService.getAll(),
        FixedAssetService.getSummary()
      ])
      
      setAssets(assetsData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fixed assets')
      console.error('Error fetching fixed assets:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const addAsset = useCallback(async (asset: NewFixedAsset) => {
    try {
      setError(null)
      
      // Optimistic update - add to UI immediately
      const tempAsset: FixedAsset = {
        ...asset,
        currentValue: FixedAssetService.calculateCurrentValue(asset.purchaseCost, asset.purchaseDate, asset.depreciationMonths),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setAssets(prevAssets => [...prevAssets, tempAsset])
      
      // Update summary optimistically
      setSummary(prevSummary => ({
        totalAssets: prevSummary.totalAssets + 1,
        totalPurchaseCost: prevSummary.totalPurchaseCost + asset.purchaseCost,
        totalCurrentValue: prevSummary.totalCurrentValue + tempAsset.currentValue,
        totalDepreciation: prevSummary.totalDepreciation + (asset.purchaseCost - tempAsset.currentValue)
      }))

      // Create in database in background
      await FixedAssetService.create(asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fixed asset')
      console.error('Error adding fixed asset:', err)
      // Revert optimistic update by refetching
      await fetchAssets()
      throw err
    }
  }, [fetchAssets])

  const updateAsset = useCallback(async (id: string, updates: Partial<Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>>) => {
    // Store previous assets for potential rollback
    const previousAssets = assets
    const previousSummary = summary

    try {
      setError(null)

      // Optimistic update - update UI immediately
      const updatedAssets = assets.map(asset => {
        if (asset.id === id) {
          const updated = { ...asset, ...updates }
          return {
            ...updated,
            currentValue: FixedAssetService.calculateCurrentValue(updated.purchaseCost, updated.purchaseDate, updated.depreciationMonths),
            updatedAt: new Date().toISOString()
          }
        }
        return asset
      })
      setAssets(updatedAssets)

      // Calculate new summary from updated assets
      const newSummary = {
        totalAssets: updatedAssets.length,
        totalPurchaseCost: updatedAssets.reduce((sum, asset) => sum + asset.purchaseCost, 0),
        totalCurrentValue: updatedAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
        totalDepreciation: 0
      }
      newSummary.totalDepreciation = newSummary.totalPurchaseCost - newSummary.totalCurrentValue
      setSummary(newSummary)

      // Update database in background
      await FixedAssetService.update(id, updates)

      // Fetch fresh summary from database to ensure accuracy
      const freshSummary = await FixedAssetService.getSummary()
      setSummary(freshSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fixed asset')
      console.error('Error updating fixed asset:', err)
      // Revert optimistic update
      setAssets(previousAssets)
      setSummary(previousSummary)
      throw err
    }
  }, [assets, summary])

  const deleteAsset = useCallback(async (id: string) => {
    // Store previous state for potential rollback
    const previousAssets = assets
    const previousSummary = summary

    try {
      setError(null)

      // Optimistic update - remove from UI immediately
      const assetToDelete = assets.find(asset => asset.id === id)
      if (assetToDelete) {
        const updatedAssets = assets.filter(asset => asset.id !== id)
        setAssets(updatedAssets)

        // Update summary optimistically
        setSummary(prevSummary => ({
          totalAssets: prevSummary.totalAssets - 1,
          totalPurchaseCost: prevSummary.totalPurchaseCost - assetToDelete.purchaseCost,
          totalCurrentValue: prevSummary.totalCurrentValue - assetToDelete.currentValue,
          totalDepreciation: prevSummary.totalDepreciation - (assetToDelete.purchaseCost - assetToDelete.currentValue)
        }))
      }

      // Delete from database in background
      await FixedAssetService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fixed asset')
      console.error('Error deleting fixed asset:', err)
      // Revert optimistic update
      setAssets(previousAssets)
      setSummary(previousSummary)
      throw err
    }
  }, [assets, summary])

  const refetch = useCallback(async () => {
    await fetchAssets()
  }, [fetchAssets])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  return {
    assets,
    loading,
    error,
    summary,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch
  }
}
