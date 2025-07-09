import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import {
  Circle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle,
  Timer,
  Edit,
  Copy,
  Trash2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanTask } from '@/lib/db/planningSchema'
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_CONFIG,
  canTaskStart,
  getDependentTasks,
  getTaskTypeRoute,
  getTaskTypeDisplayName
} from '@/lib/utils/taskUtils'
import { TaskEditForm } from './TaskEditForm'

interface TaskItemProps {
  task: PlanTask
  allTasks: PlanTask[]
  index: number
  onUpdate: (taskId: string, updates: Partial<PlanTask>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onDuplicate: (taskId: string) => Promise<void>
}

const StatusIcon = ({ status }: { status: PlanTask['status'] }) => {
  const config = STATUS_CONFIG[status]
  
  switch (config.icon) {
    case 'Circle':
      return <Circle className="h-4 w-4" />
    case 'Clock':
      return <Clock className="h-4 w-4" />
    case 'CheckCircle':
      return <CheckCircle className="h-4 w-4" />
    case 'XCircle':
      return <XCircle className="h-4 w-4" />
    default:
      return <Circle className="h-4 w-4" />
  }
}

export function TaskItem({ task, allTasks, index, onUpdate, onDelete, onDuplicate }: TaskItemProps) {
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState<{
    newStatus: PlanTask['status']
    dependentTasks: PlanTask[]
  } | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)

  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const categoryConfig = CATEGORY_CONFIG[task.category]

  const canStart = canTaskStart(task, allTasks)
  const dependentTasks = getDependentTasks(task.id, allTasks)
  const taskTypeRoute = getTaskTypeRoute(task.taskType)
  const taskTypeDisplayName = getTaskTypeDisplayName(task.taskType)

  const handleStatusChange = async (newStatus: PlanTask['status']) => {
    if (newStatus === task.status) return

    // Check if trying to start a task that can't be started due to dependencies
    if (newStatus === 'in-progress' && !canStart) {
      setOperationError('Cannot start this task. Please complete its dependencies first.')
      return
    }

    // Check if changing from completed to another status would affect dependent tasks
    if (task.status === 'completed' && newStatus !== 'completed') {
      const dependentTasks = getDependentTasks(task.id, allTasks)
      if (dependentTasks.length > 0) {
        setShowStatusChangeConfirm({ newStatus, dependentTasks })
        return
      }
    }

    await performStatusChange(newStatus)
  }

  const performStatusChange = async (newStatus: PlanTask['status']) => {
    setIsUpdating(true)
    setOperationError(null)
    try {
      await onUpdate(task.id, { status: newStatus })
      // Clear any previous errors on successful update
      setOperationError(null)
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to update task status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTaskTypeClick = () => {
    if (taskTypeRoute) {
      navigate({ to: taskTypeRoute })
    }
  }

  const handleEdit = () => {
    setIsEditSheetOpen(true)
    setOperationError(null)
  }

  const handleEditSubmit = async (updates: Partial<PlanTask>) => {
    try {
      setOperationError(null)
      await onUpdate(task.id, updates)
      setIsEditSheetOpen(false)
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to update task')
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    setOperationError(null)
    try {
      await onDuplicate(task.id)
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to duplicate task')
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setOperationError(null)
      await onDelete(task.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to delete task')
    }
  }

  // Get dependency task names
  const dependencyNames = task.dependencies
    .map(depId => allTasks.find(t => t.id === depId)?.title)
    .filter(Boolean)

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        task.status === 'completed' && "bg-green-50/50 border-green-200",
        task.status === 'cancelled' && "bg-red-50/50 border-red-200",
        task.status === 'in-progress' && "bg-blue-50/50 border-blue-200",
        !canStart && task.status === 'pending' && "bg-orange-50/50 border-orange-200"
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
                  <h4 className="font-semibold text-base truncate">{task.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Status Selector */}
                <DropdownMenu onOpenChange={(open) => {
                  if (open) {
                    setOperationError(null) // Clear errors when opening dropdown
                  }
                }}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 w-auto"
                      disabled={isUpdating}
                    >
                      <div className="flex items-center gap-1">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <StatusIcon status={task.status} />
                        )}
                        <span className="text-xs">{statusConfig.label}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('pending')}
                      className={task.status === 'pending' ? 'bg-accent' : ''}
                    >
                      <Circle className="h-4 w-4 mr-2" />
                      Not Started
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={!canStart && task.status !== 'in-progress'}
                      className={task.status === 'in-progress' ? 'bg-accent' : ''}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      In Progress
                      {!canStart && task.status !== 'in-progress' && (
                        <span className="text-xs text-muted-foreground ml-1">(blocked)</span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('completed')}
                      className={task.status === 'completed' ? 'bg-accent' : ''}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('cancelled')}
                      className={task.status === 'cancelled' ? 'bg-accent' : ''}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* More Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                      {isDuplicating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Duplicate Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Badge */}
              <Badge variant={priorityConfig.variant} className="text-xs">
                {priorityConfig.label}
              </Badge>

              {/* Category Badge */}
              <Badge variant="outline" className="text-xs">
                {categoryConfig.label}
              </Badge>

              {/* Task Type Badge with Link */}
              {task.taskType && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={handleTaskTypeClick}
                >
                  {taskTypeDisplayName}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Badge>
              )}

              {/* Duration Badge */}
              <Badge variant="outline" className="text-xs">
                <Timer className="mr-1 h-3 w-3" />
                {task.estimatedDuration}m
              </Badge>

              {/* Blocked Warning */}
              {!canStart && task.status === 'pending' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Blocked
                </Badge>
              )}
            </div>

            {/* Dependencies */}
            {dependencyNames.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Depends on:</span>{' '}
                {dependencyNames.join(', ')}
              </div>
            )}

            {/* Dependent Tasks Warning */}
            {dependentTasks.length > 0 && task.status !== 'completed' && (
              <div className="text-xs text-orange-600">
                <span className="font-medium">Blocking:</span>{' '}
                {dependentTasks.map(t => t.title).join(', ')}
              </div>
            )}

            {/* Notes */}
            {task.note && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {task.note}
              </div>
            )}

            {/* Error Message */}
            {operationError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                {operationError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    {/* Edit Task Sheet */}
    <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>
            Make changes to the task details. All fields can be updated.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <TaskEditForm
            task={task}
            allTasks={allTasks}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditSheetOpen(false)}
            isSubmitting={isUpdating}
          />
        </div>
      </SheetContent>
    </Sheet>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
            {dependentTasks.length > 0 && (
              <div className="mt-2 text-orange-600">
                <strong>Warning:</strong> This task is blocking {dependentTasks.length} other task(s): {dependentTasks.map(t => t.title).join(', ')}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Status Change Confirmation Dialog */}
    {showStatusChangeConfirm && (
      <AlertDialog open={true} onOpenChange={() => setShowStatusChangeConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Changing this task from "Completed" to "{STATUS_CONFIG[showStatusChangeConfirm.newStatus].label}" will affect {showStatusChangeConfirm.dependentTasks.length} dependent task(s):
              <div className="mt-2 font-medium">
                {showStatusChangeConfirm.dependentTasks.map(t => t.title).join(', ')}
              </div>
              <div className="mt-2">
                These tasks may become blocked. Are you sure you want to continue?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowStatusChangeConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                performStatusChange(showStatusChangeConfirm.newStatus)
                setShowStatusChangeConfirm(null)
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Change Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  )
}
