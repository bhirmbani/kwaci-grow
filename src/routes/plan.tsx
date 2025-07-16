import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JourneyMap } from '@/components/plan/JourneyMap'
import { PlanningDashboard } from '@/components/plan/PlanningDashboard'

function PlanPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'journey' | 'planning'>('journey')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('plan.title')}</h1>
        <p className="text-muted-foreground">
          {t('plan.description')}
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'journey' | 'planning')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="journey">{t('plan.tabs.journey')}</TabsTrigger>
          <TabsTrigger value="planning">{t('plan.tabs.planningDashboard')}</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-6">
          <JourneyMap />
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <PlanningDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/plan')({
  component: PlanPage,
})
