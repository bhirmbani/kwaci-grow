import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'reservations'>('overview')
  const { batches, loading, error } = useProduction()
  const { stats, loading: statsLoading } = useProductionStats()
  const { loadStockLevels } = useStockLevels()

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-muted-foreground">{t('common.error')} {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('production.management.title')}</h1>
          <p className="text-muted-foreground">
            {t('production.management.description')}
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('production.management.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            {t('production.management.tabs.batches')}
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('production.management.tabs.reservations')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('production.management.stats.totalBatches')}</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('production.management.stats.totalBatchesDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('production.management.stats.pending')}</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('production.management.stats.pendingDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('production.management.stats.inProgress')}</CardTitle>
                <Factory className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.inProgressBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('production.management.stats.inProgressDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('production.management.stats.completed')}</CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.completedBatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('production.management.stats.completedDesc')}
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
                  {t('production.management.stats.latestBatch')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('production.management.stats.batchNumber')}</span>
                    <span className="text-sm">#{stats.latestBatch.batchNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('production.management.stats.status')}</span>
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
                    <span className="text-sm font-medium">{t('production.management.stats.created')}</span>
                    <span className="text-sm">
                      {new Date(stats.latestBatch.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                  {stats.latestBatch.note && (
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium">{t('production.management.stats.note')}</span>
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
              <CardTitle>{t('production.management.quickActions.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('production.management.quickActions.description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('batches')}
              >
                <List className="h-4 w-4 mr-2" />
                {t('production.management.quickActions.viewAllBatches')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('reservations')}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('production.management.quickActions.manageReservations')}
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
