import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FixedAssetSummary, DepreciationExplanation } from '@/components/fixed-assets/FixedAssetSummary'
import { FixedAssetTable } from '@/components/fixed-assets/FixedAssetTable'
import { FixedAssetForm } from '@/components/fixed-assets/FixedAssetForm'
import { useFixedAssets } from '@/hooks/useFixedAssets'
import type { FixedAsset, NewFixedAsset } from '@/lib/db/schema'

function FixedAssets() {
  const { assets, loading, error, summary, addAsset, updateAsset, deleteAsset } = useFixedAssets()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null)

  const handleCreateAsset = useCallback(() => {
    setEditingAsset(null)
    setIsFormOpen(true)
  }, [])

  const handleEditAsset = useCallback((asset: FixedAsset) => {
    setEditingAsset(asset)
    setIsFormOpen(true)
  }, [])

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false)
    setEditingAsset(null)
  }, [])

  const handleFormCancel = useCallback(() => {
    setIsFormOpen(false)
    setEditingAsset(null)
  }, [])

  const handleFormSubmit = useCallback(async (data: NewFixedAsset) => {
    if (editingAsset) {
      // Update existing asset
      await updateAsset(editingAsset.id, {
        name: data.name,
        categoryId: data.categoryId,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        depreciationMonths: data.depreciationMonths,
        note: data.note,
      })
    } else {
      // Create new asset
      await addAsset(data)
    }
  }, [editingAsset, updateAsset, addAsset])

  // Memoize components for performance
  const memoizedSummary = useMemo(() => (
    <FixedAssetSummary summary={summary} loading={loading} />
  ), [summary, loading])

  const memoizedTable = useMemo(() => (
    <FixedAssetTable
      assets={assets}
      onEdit={handleEditAsset}
      onDelete={deleteAsset}
      loading={loading}
    />
  ), [assets, handleEditAsset, deleteAsset, loading])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fixed Assets</h1>
        <p className="text-muted-foreground">
          Manage fixed assets and automatic depreciation calculations.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {memoizedSummary}

      {/* Explanatory Information */}
      <DepreciationExplanation />

      {/* Assets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Asset Inventory</h2>
        </div>
        {memoizedTable}
      </div>

      {/* Asset Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingAsset ? 'Edit Fixed Asset' : 'Add New Fixed Asset'}
            </SheetTitle>
            <SheetDescription>
              {editingAsset
                ? 'Update the asset information and depreciation settings.'
                : 'Add a new fixed asset with automatic depreciation tracking.'
              }
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FixedAssetForm
              asset={editingAsset || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              onSubmit={handleFormSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleCreateAsset}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Fixed Asset</span>
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/fixed-assets')({
  component: FixedAssets,
})
