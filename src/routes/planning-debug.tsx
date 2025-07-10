import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

export default function PlanningDebugPage() {
  const [planTemplates, setPlanTemplates] = useState<any[]>([])
  const [operationalPlans, setOperationalPlans] = useState<any[]>([])
  const [planGoals, setPlanGoals] = useState<any[]>([])
  const [planTasks, setPlanTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const currentBusinessId = useCurrentBusinessId()

  const loadData = async () => {
    setLoading(true)
    try {
      const [templates, plans, goals, tasks] = await Promise.all([
        db.planTemplates.toArray(),
        db.operationalPlans.toArray(),
        db.planGoals.toArray(),
        db.planTasks.toArray()
      ])

      setPlanTemplates(templates)
      setOperationalPlans(plans)
      setPlanGoals(goals)
      setPlanTasks(tasks)
    } catch (error) {
      console.error('Error loading planning data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filterByBusinessId = (items: any[]) => {
    return items.filter(item => item.businessId === currentBusinessId)
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Planning Debug</h1>
        <Button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Plan Templates</span>
              <span className="text-sm font-normal">
                Total: {planTemplates.length} | Current Business: {filterByBusinessId(planTemplates).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-semibold">All Templates:</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(planTemplates, null, 2)}
              </pre>
              
              <h3 className="font-semibold mt-6">Current Business Templates:</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(filterByBusinessId(planTemplates), null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Operational Plans</span>
              <span className="text-sm font-normal">
                Total: {operationalPlans.length} | Current Business: {filterByBusinessId(operationalPlans).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-semibold">All Plans:</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(operationalPlans, null, 2)}
              </pre>
              
              <h3 className="font-semibold mt-6">Current Business Plans:</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(filterByBusinessId(operationalPlans), null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Plan Goals</span>
              <span className="text-sm font-normal">
                Total: {planGoals.length} | Current Business: {filterByBusinessId(planGoals).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(filterByBusinessId(planGoals), null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Plan Tasks</span>
              <span className="text-sm font-normal">
                Total: {planTasks.length} | Current Business: {filterByBusinessId(planTasks).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(filterByBusinessId(planTasks), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
