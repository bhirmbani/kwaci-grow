import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  TrendingUp,
  Target,
  CheckSquare,
  BarChart3,
  ArrowLeft,
  Edit,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { PlanningService } from '@/lib/services/planningService'
import { TaskManagement } from './TaskManagement'
import type { OperationalPlanWithDetails } from '@/lib/db/planningSchema'

interface PlanDetailViewProps {
  planId: string
  onBack?: () => void
}

export function PlanDetailView({ planId, onBack }: PlanDetailViewProps) {
  const [plan, setPlan] = useState<OperationalPlanWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlanDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const planDetails = await PlanningService.getPlanWithDetails(planId)
      if (!planDetails) {
        setError('Plan not found')
        return
      }
      setPlan(planDetails)
    } catch (err) {
      console.error('Failed to load plan details:', err)
      setError('Failed to load plan details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanDetails()
  }, [planId])

  const getStatusIcon = () => {
    if (!plan) return null
    switch (plan.status) {
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />
      case 'active': return <Play className="h-4 w-4 text-green-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'archived': return <Pause className="h-4 w-4 text-gray-500" />
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    if (!plan) return 'secondary'
    switch (plan.status) {
      case 'draft': return 'secondary'
      case 'active': return 'default'
      case 'completed': return 'default'
      case 'archived': return 'outline'
      default: return 'destructive'
    }
  }

  const getTypeIcon = () => {
    if (!plan) return null
    switch (plan.type) {
      case 'daily': return <Clock className="h-4 w-4 text-blue-500" />
      case 'weekly': return <Calendar className="h-4 w-4 text-green-500" />
      case 'monthly': return <TrendingUp className="h-4 w-4 text-purple-500" />
      default: return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plan details...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Plan</h3>
          <p className="text-muted-foreground mb-4">{error || 'Plan not found'}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getTypeIcon()}
              <h1 className="text-2xl font-bold">{plan.name}</h1>
            </div>
            <p className="text-muted-foreground">{plan.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
          <Badge variant="outline">
            {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Duration</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </p>
            </div>
            {plan.branch && (
              <div>
                <h4 className="font-medium mb-2">Branch</h4>
                <p className="text-sm text-muted-foreground">{plan.branch.name}</p>
              </div>
            )}
            {plan.template && (
              <div>
                <h4 className="font-medium mb-2">Template</h4>
                <p className="text-sm text-muted-foreground">{plan.template.name}</p>
              </div>
            )}
          </div>
          {plan.note && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{plan.note}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan Content Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals ({plan.goalsWithProgress.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({plan.tasksWithStatus.length})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics ({plan.metricsWithProgress.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <div className="space-y-4">
            {plan.goalsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Goals</h3>
                  <p className="text-muted-foreground">This plan doesn't have any goals yet.</p>
                </CardContent>
              </Card>
            ) : (
              plan.goalsWithProgress.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{goal.category}</Badge>
                        <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                          {goal.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      </div>
                      <Progress value={goal.progressPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(goal.progressPercentage)}% complete
                      </div>
                    </div>
                    {goal.note && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{goal.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManagement
            planId={planId}
            tasks={plan.tasksWithStatus || []}
            onTasksChange={loadPlanDetails}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-4">
            {plan.metricsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Metrics</h3>
                  <p className="text-muted-foreground">This plan doesn't have any metrics yet.</p>
                </CardContent>
              </Card>
            ) : (
              plan.metricsWithProgress.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{metric.category}</Badge>
                        <Badge variant="secondary">{metric.trackingFrequency}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{metric.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{metric.currentValue} / {metric.targetValue} {metric.unit}</span>
                      </div>
                      <Progress value={metric.progressPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(metric.progressPercentage)}% of target
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Last updated: {formatDate(metric.lastUpdated)}
                    </div>
                    {metric.note && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{metric.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
