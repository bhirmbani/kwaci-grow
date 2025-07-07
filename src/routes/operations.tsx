import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesRecordingInterface } from '@/components/operations/SalesRecordingInterface'
import { TargetVsActualAnalysis } from '@/components/operations/TargetVsActualAnalysis'
import { AnalyticsDashboard } from '@/components/operations/AnalyticsDashboard'
import { EnhancedProjectionTable } from '@/components/operations/EnhancedProjectionTable'

// TargetVsActualAnalysis component is now imported from components/operations

// AnalyticsDashboard component is now imported from components/operations

// EnhancedProjectionTable component is now imported from components/operations

function OperationsPage() {
  const [activeTab, setActiveTab] = useState('recording')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground">
          Transform daily sales targets into operational pipeline with real-time tracking and analytics
        </p>
      </div>

      {/* Operations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recording">Sales Recording</TabsTrigger>
          <TabsTrigger value="analysis">Target Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="recording" className="space-y-6">
          <SalesRecordingInterface />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <TargetVsActualAnalysis />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <EnhancedProjectionTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/operations')({
  component: OperationsPage,
})
