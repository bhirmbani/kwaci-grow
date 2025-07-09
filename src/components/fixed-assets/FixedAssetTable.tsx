import { useState, memo } from 'react'
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
  const { categories, loading: categoriesLoading } = useAssetCategories()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getCategoryName = (categoryId: string) => {
    if (categoriesLoading) return 'Loading...'
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  const getDepreciationStatus = (asset: FixedAsset) => {
    const purchase = new Date(asset.purchaseDate)
    const now = new Date()
    const monthsElapsed = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth())
    const progress = Math.min(100, (monthsElapsed / asset.depreciationMonths) * 100)
    
    if (progress >= 100) {
      return { label: 'Fully Depreciated', variant: 'secondary' as const, progress: 100 }
    } else if (progress >= 75) {
      return { label: 'Mostly Depreciated', variant: 'destructive' as const, progress }
    } else if (progress >= 50) {
      return { label: 'Half Depreciated', variant: 'default' as const, progress }
    } else {
      return { label: 'Recently Purchased', variant: 'default' as const, progress }
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
        <p className="text-muted-foreground">No fixed assets found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the + button to add your first asset.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead className="text-right">Purchase Cost</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead>Status</TableHead>
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
                  <Badge variant="outline">
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
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(status.progress)}% depreciated
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(asset)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{asset.name}"? 
                              This will also remove the corresponding depreciation entry from Fixed Costs.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(asset.id)}
                              disabled={deletingId === asset.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === asset.id ? 'Deleting...' : 'Delete'}
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
