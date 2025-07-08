import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Factory, List, BarChart3, Package, Clock } from 'lucide-react'
import { useProduction, useProductionStats } from '@/hooks/useProduction'
import { formatCurrency } from '@/utils/formatters'
import { ProductionBatchList } from './ProductionBatchList'
import { ReservedOperationsList } from './ReservedOperationsList'
import { useStockLevels } from '@/hooks/useStock'

export function ProductionManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'reservations'>('overview')
  const { batches, loading, error } = useProduction()
  const { stats, loading: statsLoading } = useProductionStats()
  const { loadStockLevels } = useStockLevels()

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading production data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-muted-foreground">Error loading production data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Management</h1>
          <p className="text-muted-foreground">
            Manage production batches and track ingredient allocations
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Production Batches
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Reserved Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Production batches created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting production start
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Factory className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.inProgressBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently in production
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.completedBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Production finished
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Batch Info */}
          {stats?.latestBatch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Latest Production Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Batch Number:</span>
                    <span className="text-sm">#{stats.latestBatch.batchNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats.latestBatch.status === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : stats.latestBatch.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {stats.latestBatch.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">
                      {new Date(stats.latestBatch.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                  {stats.latestBatch.note && (
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium">Note:</span>
                      <span className="text-sm text-right max-w-xs">{stats.latestBatch.note}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Common production management tasks
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveTab('batches')}
              >
                <List className="h-4 w-4 mr-2" />
                View All Production Batches
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveTab('reservations')}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Stock Reservations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <ProductionBatchList batches={batches} onStockLevelsChanged={loadStockLevels} />
        </TabsContent>

        <TabsContent value="reservations">
          <ReservedOperationsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
