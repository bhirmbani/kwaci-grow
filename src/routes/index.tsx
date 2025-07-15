import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SalesAnalyticsSection } from '../components/dashboard/SalesAnalyticsSection'
import { FinancialOverviewSection } from '../components/dashboard/FinancialOverviewSection'
import { OperationsStatusSection } from '../components/dashboard/OperationsStatusSection'
import { InventoryAlertsSection } from '../components/dashboard/InventoryAlertsSection'
import { BranchPerformanceSection } from '../components/dashboard/BranchPerformanceSection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { RefreshCw, BarChart3, Building2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useCurrentBusinessId } from '../lib/stores/businessStore'
import type { TimePeriod } from '../lib/services/dashboardService'

function Dashboard() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Handle period change from sales analytics
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period)
  }, [])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date())
    // Force re-render of all components by updating the key
    window.location.reload()
  }, [])

  if (!currentBusinessId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>{t('dashboard.welcome.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.welcome.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('dashboard.welcome.selectBusiness')}
            </p>
            <Badge variant="outline" className="text-xs">
              {t('dashboard.welcome.multiBusinessEnabled')}
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {t('dashboard.lastUpdated')}: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('dashboard.refresh')}
          </Button>
        </div>
      </div>

      {/* Sales Analytics Section */}
      <SalesAnalyticsSection
        onPeriodChange={handlePeriodChange}
        initialPeriod={selectedPeriod}
      />

      {/* Financial Overview Section */}
      <FinancialOverviewSection />

      {/* Operations and Inventory Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="h-full">
          <OperationsStatusSection />
        </div>
        <div className="h-full">
          <InventoryAlertsSection />
        </div>
      </div>

      {/* Branch Performance Section */}
      <BranchPerformanceSection selectedPeriod={selectedPeriod} />

      {/* Dashboard Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('dashboard.dataUpdatesAutomatically')}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {t('dashboard.realTimeData')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Dashboard,
})
