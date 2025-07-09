import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Target, MapPin, CheckSquare, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { GoalForm } from './GoalForm'
import type { PlanGoal, PlanTask, NewPlanGoal } from '@/lib/db/planningSchema'
import type { Branch } from '@/lib/db/schema'

interface GoalItemProps {
  goal: PlanGoal & { 
    progressPercentage: number
    branch?: Branch
    linkedTasks: PlanTask[]
  }
  allTasks: PlanTask[]
  index: number
  onUpdate: (goalId: string, updates: Partial<PlanGoal>) => Promise<void>
  onDelete: (goalId: string) => Promise<void>
}

const PRIORITY_CONFIG = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
  high: { color: 'bg-red-100 text-red-800', label: 'High' }
}

const CATEGORY_CONFIG = {
  sales: { color: 'bg-green-100 text-green-800', label: 'Sales' },
  production: { color: 'bg-blue-100 text-blue-800', label: 'Production' },
  efficiency: { color: 'bg-purple-100 text-purple-800', label: 'Efficiency' },
  quality: { color: 'bg-yellow-100 text-yellow-800', label: 'Quality' },
  cost: { color: 'bg-orange-100 text-orange-800', label: 'Cost' }
}

export function GoalItem({ goal, allTasks, index, onUpdate, onDelete }: GoalItemProps) {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const priorityConfig = PRIORITY_CONFIG[goal.priority]
  const categoryConfig = CATEGORY_CONFIG[goal.category]

  const handleUpdate = async (goalData: Omit<NewPlanGoal, 'id' | 'planId'>) => {
    try {
      setIsUpdating(true)
      setOperationError(null)
      await onUpdate(goal.id, goalData)
      setIsEditSheetOpen(false)
    } catch (error) {
      console.error('Failed to update goal:', error)
      setOperationError('Failed to update goal. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsUpdating(true)
      setOperationError(null)
      await onDelete(goal.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete goal:', error)
      setOperationError('Failed to delete goal. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.completed
  const isCompleted = goal.completed || goal.progressPercentage >= 100

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        isCompleted && "bg-green-50/50 border-green-200",
        isOverdue && "bg-red-50/50 border-red-200"
      )}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground font-mono">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <h4 className="font-semibold text-base truncate">{goal.title}</h4>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckSquare className="mr-1 h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Edit Goal</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <GoalForm
                        goal={goal}
                        planId={goal.planId}
                        availableTasks={allTasks}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditSheetOpen(false)}
                        isSubmitting={isUpdating}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isUpdating ? 'Deleting...' : 'Delete Goal'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Progress Section */}
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

            {/* Metadata Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs", categoryConfig.color)}>
                <Target className="mr-1 h-3 w-3" />
                {categoryConfig.label}
              </Badge>
              
              <Badge variant="outline" className={cn("text-xs", priorityConfig.color)}>
                {priorityConfig.label}
              </Badge>

              {goal.branch ? (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="mr-1 h-3 w-3" />
                  {goal.branch.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  <MapPin className="mr-1 h-3 w-3" />
                  No Branch
                </Badge>
              )}

              {goal.dueDate && (
                <Badge variant="outline" className={cn(
                  "text-xs",
                  isOverdue && "border-red-300 text-red-700"
                )}>
                  <Calendar className="mr-1 h-3 w-3" />
                  {format(new Date(goal.dueDate), "MMM d, yyyy")}
                </Badge>
              )}
            </div>

            {/* Linked Tasks */}
            {goal.linkedTasks.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Linked Tasks:</div>
                <div className="flex flex-wrap gap-1">
                  {goal.linkedTasks.map((task) => (
                    <Badge key={task.id} variant="secondary" className="text-xs">
                      {task.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {goal.note && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {goal.note}
              </div>
            )}

            {/* Error Display */}
            {operationError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {operationError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
