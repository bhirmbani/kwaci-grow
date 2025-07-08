import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, TrendingUp, Users, Coffee, Target, Plus, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react'
import { PlanningService } from '@/lib/services/planningService'
import { PlanTemplateService } from '@/lib/services/planTemplateService'
import { useJourney } from '@/hooks/useJourney'
import { CreatePlanSheet } from './CreatePlanSheet'
import type { PlanAnalytics, PlanTemplate, OperationalPlan } from '@/lib/db/planningSchema'

export function PlanningDashboard() {
  const [analytics, setAnalytics] = useState<PlanAnalytics | null>(null)
  const [templates, setTemplates] = useState<PlanTemplate[]>([])
  const [recentPlans, setRecentPlans] = useState<OperationalPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { getCompletionPercentage } = useJourney()

  const journeyCompletion = getCompletionPercentage()

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Initialize default templates if needed
      await PlanTemplateService.initializeDefaultTemplates()

      const [analyticsData, templatesData, plansData] = await Promise.all([
        PlanningService.getPlanAnalytics(),
        PlanTemplateService.getDefaultTemplates(),
        PlanningService.getAllPlans()
      ])

      setAnalytics(analyticsData)
      setTemplates(templatesData)
      setRecentPlans(plansData.slice(0, 5)) // Show only 5 most recent
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Planning Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Planning Dashboard</h2>
        <p className="text-muted-foreground">
          Create and manage daily, weekly, and monthly operational plans for your coffee shop
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{analytics?.activePlans || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Achieved</p>
                <p className="text-2xl font-bold">{analytics?.totalGoalsAchieved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{analytics?.totalTasksCompleted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics?.averageCompletionRate.toFixed(0) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planning Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick start templates for different planning scenarios
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const getTemplateIcon = () => {
                switch (template.type) {
                  case 'daily': return <Clock className="h-5 w-5 text-blue-500" />
                  case 'weekly': return <Calendar className="h-5 w-5 text-green-500" />
                  case 'monthly': return <TrendingUp className="h-5 w-5 text-purple-500" />
                  default: return <Calendar className="h-5 w-5 text-gray-500" />
                }
              }

              const getDifficultyColor = () => {
                switch (template.difficulty) {
                  case 'beginner': return 'text-green-600'
                  case 'intermediate': return 'text-yellow-600'
                  case 'advanced': return 'text-red-600'
                  default: return 'text-gray-600'
                }
              }

              return (
                <Card key={template.id} className="border-dashed border-2 hover:border-solid transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon()}
                        <h3 className="font-semibold">{template.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor()}`}>
                          {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                        </Badge>
                        {template.isDefault && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Est. {Math.round(template.estimatedDuration / 60)}h duration
                      </div>
                      <Button size="sm" className="w-full">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Journey Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Setup Journey Progress
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete your coffee shop setup journey to unlock advanced planning features
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{journeyCompletion}% Complete</span>
            </div>
            <Progress value={journeyCompletion} className="h-2" />

            {journeyCompletion < 100 ? (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Complete Setup Journey
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Finish setting up your coffee shop to unlock all planning features and templates.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      🎉 Setup Complete!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your coffee shop is fully set up. You can now create comprehensive operational plans.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Plans</CardTitle>
            <CreatePlanSheet onPlanCreated={loadDashboardData} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPlans.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plans Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first operational plan to get started with structured planning.
                </p>
                <CreatePlanSheet
                  onPlanCreated={loadDashboardData}
                  triggerText="Create Your First Plan"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                        <Badge variant="outline">
                          {plan.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {plan.startDate} - {plan.endDate}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Plan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Planning Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Overview of your planning performance and insights
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Plan Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.plansByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type} Plans</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>

                <h4 className="font-medium mt-4">Status Overview</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.plansByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Average Task Duration</span>
                      <span>{Math.round(analytics.averageTaskDuration)} min</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Most Used Template</span>
                      <span>{analytics.mostUsedTemplate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Plans Created</span>
                      <span>{analytics.totalPlans}</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium mt-4">Goal Categories</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.goalsByCategory).slice(0, 3).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
