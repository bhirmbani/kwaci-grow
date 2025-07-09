import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, TrendingUp, Target, CheckSquare, BarChart3, Loader2 } from 'lucide-react'
import { PlanTemplateService } from '@/lib/services/planTemplateService'
import { CreatePlanForm } from './CreatePlanForm'
import type { PlanTemplate, PlanGoalTemplate, PlanTaskTemplate, PlanMetricTemplate } from '@/lib/db/planningSchema'

interface TemplatePreviewSheetProps {
  template: PlanTemplate | null
  isOpen: boolean
  onClose: () => void
  onPlanCreated?: () => void
}

interface TemplateDetails {
  goals: PlanGoalTemplate[]
  tasks: PlanTaskTemplate[]
  metrics: PlanMetricTemplate[]
}

export function TemplatePreviewSheet({ template, isOpen, onClose, onPlanCreated }: TemplatePreviewSheetProps) {
  const [templateDetails, setTemplateDetails] = useState<TemplateDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const navigate = useNavigate()

  const loadTemplateDetails = async () => {
    if (!template) return

    try {
      setLoading(true)
      const [goals, tasks, metrics] = await Promise.all([
        PlanTemplateService.getGoalTemplates(template.id),
        PlanTemplateService.getTaskTemplates(template.id),
        PlanTemplateService.getMetricTemplates(template.id)
      ])

      setTemplateDetails({ goals, tasks, metrics })
    } catch (error) {
      console.error('Failed to load template details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && template) {
      loadTemplateDetails()
      setShowCreateForm(false)
    }
  }, [isOpen, template])

  const getTemplateIcon = () => {
    if (!template) return null
    switch (template.type) {
      case 'daily': return <Clock className="h-5 w-5 text-blue-500" />
      case 'weekly': return <Calendar className="h-5 w-5 text-green-500" />
      case 'monthly': return <TrendingUp className="h-5 w-5 text-purple-500" />
      default: return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getDifficultyColor = () => {
    if (!template) return ''
    switch (template.difficulty) {
      case 'beginner': return 'text-green-600'
      case 'intermediate': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleCreatePlan = async (planData: any) => {
    if (!template) return

    try {
      const newPlan = await PlanTemplateService.createPlanFromTemplate(template.id, planData)
      onClose()
      onPlanCreated?.()
      // Navigate to the new plan detail view
      navigate({ to: `/plan-detail/${newPlan.id}` })
    } catch (error) {
      console.error('Failed to create plan from template:', error)
      throw error
    }
  }

  if (!template) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getTemplateIcon()}
            {template.name}
          </SheetTitle>
          <SheetDescription>
            Preview template details and create a new operational plan
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{template.description}</p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor()}>
                  {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                </Badge>
                {template.isDefault && (
                  <Badge variant="default">Default</Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Estimated Duration: {Math.round(template.estimatedDuration / 60)} hours
              </div>
            </CardContent>
          </Card>

          {/* Template Contents */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading template details...
              </CardContent>
            </Card>
          ) : templateDetails ? (
            <div className="space-y-4">
              {/* Goals */}
              {templateDetails.goals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Goals ({templateDetails.goals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templateDetails.goals.map((goal) => (
                        <div key={goal.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: {goal.defaultTargetValue} {goal.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tasks */}
              {templateDetails.tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Tasks ({templateDetails.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templateDetails.tasks.map((task) => (
                        <div key={task.id} className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Est. {task.estimatedDuration}min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metrics */}
              {templateDetails.metrics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Metrics ({templateDetails.metrics.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templateDetails.metrics.map((metric) => (
                        <div key={metric.id} className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {metric.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Target: {metric.defaultTargetValue} {metric.unit}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Track: {metric.trackingFrequency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showCreateForm ? (
              <>
                <Button onClick={() => setShowCreateForm(true)} className="flex-1">
                  Create Plan from Template
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowCreateForm(false)} className="w-full">
                Back to Preview
              </Button>
            )}
          </div>

          {/* Create Plan Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Plan from Template</CardTitle>
              </CardHeader>
              <CardContent>
                <CreatePlanForm
                  preselectedTemplate={template}
                  onSuccess={handleCreatePlan}
                  onCancel={() => setShowCreateForm(false)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
