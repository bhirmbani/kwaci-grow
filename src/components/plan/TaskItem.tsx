import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Circle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal, 
  ExternalLink,
  AlertTriangle,
  Timer
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

interface TaskItemProps {
  task: PlanTask
  allTasks: PlanTask[]
  index: number
  onUpdate: (taskId: string, updates: Partial<PlanTask>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
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

export function TaskItem({ task, allTasks, index, onUpdate, onDelete }: TaskItemProps) {
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)

  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const categoryConfig = CATEGORY_CONFIG[task.category]

  const canStart = canTaskStart(task, allTasks)
  const dependentTasks = getDependentTasks(task.id, allTasks)
  const taskTypeRoute = getTaskTypeRoute(task.taskType)
  const taskTypeDisplayName = getTaskTypeDisplayName(task.taskType)

  const handleStatusChange = async (newStatus: PlanTask['status']) => {
    if (newStatus === task.status) return
    
    setIsUpdating(true)
    try {
      await onUpdate(task.id, { status: newStatus })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTaskTypeClick = () => {
    if (taskTypeRoute) {
      navigate({ to: taskTypeRoute })
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id)
    }
  }

  // Get dependency task names
  const dependencyNames = task.dependencies
    .map(depId => allTasks.find(t => t.id === depId)?.title)
    .filter(Boolean)

  return (
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
              <Select 
                value={task.status} 
                onValueChange={handleStatusChange}
                disabled={isUpdating || (!canStart && task.status === 'pending')}
              >
                <SelectTrigger className="w-auto h-8 gap-1">
                  <div className="flex items-center gap-1">
                    <StatusIcon status={task.status} />
                    <span className="text-xs">{statusConfig.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      Not Started
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress" disabled={!canStart && task.status === 'pending'}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
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
        </div>
      </CardContent>
    </Card>
  )
}
