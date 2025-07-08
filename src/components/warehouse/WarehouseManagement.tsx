import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Calendar, List, TrendingUp, Factory, ShoppingCart, Plus } from 'lucide-react'
import { useWarehouse, useWarehouseStats } from '@/hooks/useWarehouse'
import { formatCurrency } from '@/utils/formatters'
import { WarehouseBatchList } from './WarehouseBatchList'
import { WarehouseCalendar } from './WarehouseCalendar'
import { WarehouseStats } from './WarehouseStats'
import { StockLevels } from './StockLevels'
import { ProductionAllocation } from '../production/ProductionAllocation'
import { AddToWarehouseSheet } from './AddToWarehouseSheet'
import { useStockLevels } from '@/hooks/useStock'

export function WarehouseManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'batches' | 'calendar' | 'production'>('overview')
  const { batches, loading, error, loadBatches } = useWarehouse()
  const { stats, loading: statsLoading, loadStats } = useWarehouseStats()
  const { loadStockLevels } = useStockLevels()

  // Handle successful warehouse addition
  const handleWarehouseSuccess = () => {
    // Refresh all warehouse data
    loadBatches?.()
    loadStats?.()
    loadStockLevels()
  }

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading warehouse data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading warehouse data: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track stock additions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Quick Stats */}
      <WarehouseStats stats={stats} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Quick Production Allocation
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Batches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No warehouse batches yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use the COGS Calculator to add your first batch
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {batches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Batch #{batch.batchNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(batch.dateAdded).toLocaleDateString()} • {batch.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(batch.items.reduce((sum, item) => sum + item.totalCost, 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                    {batches.length > 5 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab('batches')}
                      >
                        View All Batches ({batches.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No inventory data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top ingredients by quantity */}
                    <div>
                      <h4 className="font-medium mb-2">Most Stocked Ingredients</h4>
                      <div className="space-y-2">
                        {getTopIngredients(batches).slice(0, 5).map((ingredient, index) => (
                          <div key={ingredient.name} className="flex items-center justify-between text-sm">
                            <span>{ingredient.name}</span>
                            <span className="font-medium">
                              {ingredient.totalQuantity.toFixed(1)} {ingredient.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <StockLevels />
        </TabsContent>

        <TabsContent value="production">
          <ProductionAllocation onStockLevelsChanged={loadStockLevels} />
        </TabsContent>

        <TabsContent value="batches">
          <WarehouseBatchList batches={batches} />
        </TabsContent>

        <TabsContent value="calendar">
          <WarehouseCalendar batches={batches} />
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddToWarehouseSheet onSuccess={handleWarehouseSuccess} />
      </div>
    </div>
  )
}

// Helper function to aggregate ingredients across all batches
function getTopIngredients(batches: any[]) {
  const ingredientMap = new Map<string, { name: string; totalQuantity: number; unit: string }>()
  
  batches.forEach(batch => {
    batch.items.forEach((item: any) => {
      const key = `${item.ingredientName}-${item.unit}`
      const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        existing.totalQuantity += quantity
      } else {
        ingredientMap.set(key, {
          name: item.ingredientName,
          totalQuantity: quantity,
          unit: item.unit
        })
      }
    })
  })
  
  return Array.from(ingredientMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
}
