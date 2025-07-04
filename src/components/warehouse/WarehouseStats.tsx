import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, TrendingUp, Calendar } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import type { WarehouseBatch } from '@/lib/db/schema'

interface WarehouseStatsProps {
  stats: {
    totalBatches: number
    totalItems: number
    totalValue: number
    latestBatch?: WarehouseBatch
  } | null
}

export function WarehouseStats({ stats }: WarehouseStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Batches */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
              <p className="text-2xl font-bold">{stats.totalBatches}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Items */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Latest Batch */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Latest Batch</p>
              <p className="text-2xl font-bold">
                {stats.latestBatch ? `#${stats.latestBatch.batchNumber}` : 'None'}
              </p>
              {stats.latestBatch && (
                <p className="text-xs text-muted-foreground">
                  {new Date(stats.latestBatch.dateAdded).toLocaleDateString()}
                </p>
              )}
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
