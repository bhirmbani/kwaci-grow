import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuAnalyticsTable } from '../components/MenuAnalyticsTable'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAppSetting } from '../hooks/useAppSetting'
import { APP_SETTING_KEYS } from '../lib/db/schema'

function Analytics() {
  const { t } = useTranslation()
  // App settings
  const {
    value: daysPerMonth,
    loading: daysLoading,
    updateValue: setDaysPerMonth
  } = useAppSetting(APP_SETTING_KEYS.DAYS_PER_MONTH, 30)

  // Loading state
  const isLoading = daysLoading

  // Memoized analytics table to prevent unnecessary re-renders
  const memoizedAnalyticsTable = useMemo(() => (
    <MenuAnalyticsTable
      daysPerMonth={daysPerMonth}
    />
  ), [daysPerMonth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">{t('analytics.loading')}</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('analytics.page.title')}</h1>
          <p className="text-muted-foreground">
            {t('analytics.page.description')}
          </p>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="days-per-month">{t('analytics.controls.daysPerMonth')}</Label>
            <Input
              id="days-per-month"
              type="number"
              min="1"
              max="31"
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Analytics Table */}
      {memoizedAnalyticsTable}
    </>
  )
}

export const Route = createFileRoute('/analytics')({
  component: Analytics,
})
