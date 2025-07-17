import { useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/formatters'
import { useAssetCategories } from '@/hooks/useAssetCategories'
import type { FixedAsset } from '@/lib/db/schema'

interface FixedAssetTableProps {
  assets: FixedAsset[]
  onEdit: (asset: FixedAsset) => void
  onDelete: (id: string) => Promise<void>
  loading?: boolean
}

export const FixedAssetTable = memo(function FixedAssetTable({
  assets,
  onEdit,
  onDelete,
  loading = false
}: FixedAssetTableProps) {
  const { t } = useTranslation()
  const { categories, loading: categoriesLoading } = useAssetCategories()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getCategoryName = (categoryId: string) => {
    if (categoriesLoading) return t('common.loading')
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || t('common.unknown')
  }

  const getDepreciationStatus = (asset: FixedAsset) => {
    const purchase = new Date(asset.purchaseDate)
    const now = new Date()
    const monthsElapsed = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth())
    const progress = Math.min(100, (monthsElapsed / asset.depreciationMonths) * 100)
    
    if (progress >= 100) {
      return { label: t('fixedAssets.table.status.fully'), variant: 'secondary' as const, progress: 100 }
    } else if (progress >= 75) {
      return { label: t('fixedAssets.table.status.mostly'), variant: 'destructive' as const, progress }
    } else if (progress >= 50) {
      return { label: t('fixedAssets.table.status.half'), variant: 'default' as const, progress }
    } else {
      return { label: t('fixedAssets.table.status.recent'), variant: 'default' as const, progress }
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Error deleting asset:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('fixedAssets.table.emptyTitle')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('fixedAssets.table.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('fixedAssets.table.columns.name')}</TableHead>
            <TableHead>{t('fixedAssets.table.columns.category')}</TableHead>
            <TableHead>{t('fixedAssets.table.columns.purchaseDate')}</TableHead>
            <TableHead className="text-right">{t('fixedAssets.table.columns.purchaseCost')}</TableHead>
            <TableHead className="text-right">{t('fixedAssets.table.columns.currentValue')}</TableHead>
            <TableHead className="text-center">{t('fixedAssets.table.columns.depreciation')}</TableHead>
            <TableHead>{t('fixedAssets.table.columns.status')}</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const status = getDepreciationStatus(asset)
            return (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    {asset.note && (
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {asset.note}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs px-2 py-1 whitespace-nowrap min-w-[80px] justify-center">
                    {getCategoryName(asset.categoryId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(asset.purchaseCost)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(asset.currentValue)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {asset.depreciationMonths} months
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(asset.depreciationMonths / 12 * 10) / 10} years
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 min-w-[140px]">
                    <Badge variant={status.variant} className="text-xs px-2 py-1 whitespace-nowrap">
                      {status.label}
                    </Badge>
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t('fixedAssets.table.status.percent', { percent: Math.round(status.progress) })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('fixedAssets.table.menu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(asset)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('fixedAssets.table.edit')}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('fixedAssets.table.delete')}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('fixedAssets.table.deleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('fixedAssets.table.deleteConfirm', { name: asset.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(asset.id)}
                              disabled={deletingId === asset.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === asset.id ? t('fixedAssets.categoryCombobox.deleting') : t('fixedAssets.table.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
})
