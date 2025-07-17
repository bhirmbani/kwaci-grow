import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Clock,
  TrendingUp,
  Coffee,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { PlanningService } from '@/lib/services/planningService'
import { PlanTemplateService } from '@/lib/services/planTemplateService'
import { useJourney } from '@/hooks/useJourney'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import { CreatePlanSheet } from './CreatePlanSheet'
import { TemplatePreviewSheet } from './TemplatePreviewSheet'
import type { PlanAnalytics, PlanTemplate, OperationalPlan } from '@/lib/db/planningSchema'
import i18n from '@/lib/i18n'

export function PlanningDashboard() {
  const [analytics, setAnalytics] = useState<PlanAnalytics | null>(null)
  const [templates, setTemplates] = useState<PlanTemplate[]>([])
  const [recentPlans, setRecentPlans] = useState<OperationalPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null)
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false)
  const { getCompletionPercentage } = useJourney()
  const navigate = useNavigate()
  const currentBusinessId = useCurrentBusinessId()
  const { t } = useTranslation()

  const journeyCompletion = useMemo(() => getCompletionPercentage(), [getCompletionPercentage])

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Don't load data if no business is selected
      if (!currentBusinessId) {
        setAnalytics(null)
        setTemplates([])
        setRecentPlans([])
        setLoading(false)
        return
      }

      // Initialize default templates if needed
      await PlanTemplateService.initializeDefaultTemplates()

      // Load data with error handling for each service
      const [analyticsResult, templatesResult, plansResult] = await Promise.allSettled([
        PlanningService.getPlanAnalytics(),
        PlanTemplateService.getDefaultTemplates(),
        PlanningService.getAllPlans(),
      ])

      // Handle analytics result
      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value)
      } else {
        console.error('Failed to load analytics:', analyticsResult.reason)
        // Set empty analytics as fallback
        setAnalytics({
          totalPlans: 0,
          activePlans: 0,
          completedPlans: 0,
          averageCompletionRate: 0,
          totalGoalsAchieved: 0,
          totalTasksCompleted: 0,
          averageTaskDuration: 0,
          mostUsedTemplate: 'None',
          plansByType: { daily: 0, weekly: 0, monthly: 0 },
          plansByStatus: { draft: 0, active: 0, completed: 0, archived: 0 },
          goalsByCategory: { sales: 0, production: 0, efficiency: 0, quality: 0, cost: 0 },
          tasksByCategory: {
            setup: 0,
            production: 0,
            sales: 0,
            inventory: 0,
            maintenance: 0,
            training: 0,
          },
        })
      }

      // Handle templates result
      if (templatesResult.status === 'fulfilled') {
        setTemplates(templatesResult.value)
      } else {
        console.error('Failed to load templates:', templatesResult.reason)
        setTemplates([])
      }

      // Handle plans result
      if (plansResult.status === 'fulfilled') {
        setRecentPlans(plansResult.value.slice(0, 5)) // Show only 5 most recent
      } else {
        console.error('Failed to load plans:', plansResult.reason)
        setRecentPlans([])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleUseTemplate = (template: PlanTemplate) => {
    setSelectedTemplate(template)
    setIsTemplatePreviewOpen(true)
  }

  const handleViewPlan = (plan: OperationalPlan) => {
    navigate({ to: `/plan-detail/${plan.id}` })
  }

  const handleTemplatePreviewClose = () => {
    setIsTemplatePreviewOpen(false)
    setSelectedTemplate(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{t('plan.planningDashboard.title')}</h2>
          <p className="text-muted-foreground">{t('plan.planningDashboard.loading')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="bg-muted mb-2 h-4 w-3/4 rounded"></div>
                  <div className="bg-muted h-8 w-1/2 rounded"></div>
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
        <h2 className="text-2xl font-bold tracking-tight">{t('plan.planningDashboard.title')}</h2>
        <p className="text-muted-foreground">{t('plan.planningDashboard.description')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t('plan.planningDashboard.stats.activePlans')}
                </p>
                <p className="text-2xl font-bold">{analytics?.activePlans || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t('plan.planningDashboard.stats.goalsAchieved')}
                </p>
                <p className="text-2xl font-bold">{analytics?.totalGoalsAchieved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t('plan.planningDashboard.stats.tasksCompleted')}
                </p>
                <p className="text-2xl font-bold">{analytics?.totalTasksCompleted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t('plan.planningDashboard.stats.completionRate')}
                </p>
                <p className="text-2xl font-bold">
                  {analytics?.averageCompletionRate.toFixed(0) || 0}%
                </p>
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
            {t('plan.planningDashboard.templates.title')}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t('plan.planningDashboard.templates.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const getTemplateIcon = () => {
                switch (template.type) {
                  case 'daily':
                    return <Clock className="h-5 w-5 text-blue-500" />
                  case 'weekly':
                    return <Calendar className="h-5 w-5 text-green-500" />
                  case 'monthly':
                    return <TrendingUp className="h-5 w-5 text-purple-500" />
                  default:
                    return <Calendar className="h-5 w-5 text-gray-500" />
                }
              }

              const getDifficultyColor = () => {
                switch (template.difficulty) {
                  case 'beginner':
                    return 'text-green-600'
                  case 'intermediate':
                    return 'text-yellow-600'
                  case 'advanced':
                    return 'text-red-600'
                  default:
                    return 'text-gray-600'
                }
              }

              return (
                <Card
                  key={template.id}
                  className="cursor-pointer border-2 border-dashed transition-all hover:border-solid"
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon()}
                        <h3 className="font-semibold">{template.name}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor()}`}>
                          {template.difficulty.charAt(0).toUpperCase() +
                            template.difficulty.slice(1)}
                        </Badge>
                        {template.isDefault && (
                          <Badge variant="default" className="text-xs">
                            {t('plan.planningDashboard.templates.default')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {t('plan.planningDashboard.templates.duration', {
                          hours: Math.round(template.estimatedDuration / 60),
                        })}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleUseTemplate(template)}
                      >
                        {t('plan.planningDashboard.templates.useTemplate')}
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
            {t('plan.planningDashboard.journey.title')}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t('plan.planningDashboard.journey.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('plan.planningDashboard.journey.overallProgress')}
              </span>
              <span className="text-muted-foreground text-sm">
                {t('plan.journeyMap.complete', { percentage: journeyCompletion })}
              </span>
            </div>
            <Progress value={journeyCompletion} className="h-2" />

            {journeyCompletion < 100 ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      {t('plan.planningDashboard.journey.incompleteTitle')}
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      {t('plan.planningDashboard.journey.incompleteDescription')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      {t('plan.planningDashboard.journey.completeTitle')}
                    </h4>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      {t('plan.planningDashboard.journey.completeDescription')}
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
            <CardTitle>{t('plan.planningDashboard.recentPlans.title')}</CardTitle>
            <CreatePlanSheet onPlanCreated={loadDashboardData} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPlans.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">
                  {t('plan.planningDashboard.recentPlans.noPlansTitle')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('plan.planningDashboard.recentPlans.noPlansDescription')}
                </p>
                <CreatePlanSheet
                  onPlanCreated={loadDashboardData}
                  triggerText={t('plan.planningDashboard.recentPlans.createFirst')}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                        <Badge variant="outline">{plan.type}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {plan.startDate} - {plan.endDate}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewPlan(plan)}>
                      {t('plan.planningDashboard.recentPlans.view')}
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
              {t('plan.planningDashboard.analytics.title')}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {t('plan.planningDashboard.analytics.description')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">
                  {t('plan.planningDashboard.analytics.planDistribution')}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.plansByType).map(([type, count]) => {
                    const PLAN_TYPE_LABELS = getPlanTypeLabels(t, i18n.language)
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {PLAN_TYPE_LABELS[type] || type}{' '}
                          {(i18n.language === 'en') && (
                            <span>
                              {t('plan.planningDashboard.analytics.plans')}
                            </span>
                          )}
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    )
                  })}
                </div>

                <h4 className="mt-4 font-medium">
                  {t('plan.planningDashboard.analytics.statusOverview')}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.plansByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {t(PLAN_STATUS_LABELS[status] || status.replace('-', ' '))}
                      </span>
                      <Badge variant={status === 'active' ? 'default' : 'secondary'}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">
                  {t('plan.planningDashboard.analytics.performanceMetrics')}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('plan.planningDashboard.analytics.averageTaskDuration')}</span>
                      <span>{Math.round(analytics.averageTaskDuration)} min</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('plan.planningDashboard.analytics.mostUsedTemplate')}</span>
                      <span>{analytics.mostUsedTemplate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('plan.planningDashboard.analytics.totalPlansCreated')}</span>
                      <span>{analytics.totalPlans}</span>
                    </div>
                  </div>
                </div>

                <h4 className="mt-4 font-medium">
                  {t('plan.planningDashboard.analytics.goalCategories')}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.goalsByCategory)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{t(`plan.category.${category}`)}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Sheet */}
      <TemplatePreviewSheet
        template={selectedTemplate}
        isOpen={isTemplatePreviewOpen}
        onClose={handleTemplatePreviewClose}
        onPlanCreated={loadDashboardData}
      />
    </div>
  )
}

// Add mapping for plan types and statuses at the top (after imports)
// Plan type labels with locale-based i18n mapping
function getPlanTypeLabels(t: (key: string) => string, locale: string): Record<string, string> {
  return {
    daily: t(locale === 'id' ? 'plan.type.daily_id' : 'plan.type.daily'),
    weekly: t(locale === 'id' ? 'plan.type.weekly_id' : 'plan.type.weekly'),
    monthly: t(locale === 'id' ? 'plan.type.monthly_id' : 'plan.type.monthly'),
  }
}

const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: 'plan.status.draft',
  active: 'plan.status.active',
  completed: 'plan.status.completed',
  archived: 'plan.status.archived',
}
