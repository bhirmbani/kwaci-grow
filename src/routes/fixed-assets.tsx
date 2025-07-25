import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
        <h1 className="text-2xl font-bold">{t('fixedAssets.title')}</h1>
        <p className="text-muted-foreground">
          {t('fixedAssets.description')}
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
          <h2 className="text-lg font-semibold">{t('fixedAssets.assetInventory')}</h2>
      </div>
        {memoizedTable}
      </div>



      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6">
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label={t('fixedAssets.sheet.addTitle')}
            onClick={handleCreateAsset}
          >
            <Plus className="text-primary-foreground m-auto flex h-8 w-8" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingAsset ? t('fixedAssets.sheet.editTitle') : t('fixedAssets.sheet.addTitle')}
              </SheetTitle>
              <SheetDescription>
                {editingAsset
                  ? t('fixedAssets.sheet.editDescription')
                  : t('fixedAssets.sheet.addDescription')}
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
      </div>
    </div>
  )
}

export const Route = createFileRoute('/fixed-assets')({
  component: FixedAssets,
})
