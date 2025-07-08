import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JourneyMap } from '@/components/plan/JourneyMap'
import { PlanningDashboard } from '@/components/plan/PlanningDashboard'

function PlanPage() {
  const [activeTab, setActiveTab] = useState<'journey' | 'planning'>('journey')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Plan</h1>
        <p className="text-muted-foreground">
          Guided onboarding and operational planning for your coffee shop
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'journey' | 'planning')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="journey">Journey Map</TabsTrigger>
          <TabsTrigger value="planning">Planning Dashboard</TabsTrigger>
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
