import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare } from 'lucide-react'
import { TaskCreationForm } from './TaskCreationForm'
import { TaskList } from './TaskList'
import { PlanningService } from '@/lib/services/planningService'
import type { PlanTask, NewPlanTask } from '@/lib/db/planningSchema'

interface TaskManagementProps {
  planId: string
  tasks: PlanTask[]
  onTasksChange: () => void
}

export function TaskManagement({ planId, tasks = [], onTasksChange }: TaskManagementProps) {
  const [showCreationForm, setShowCreationForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTask = useCallback(async (taskData: Omit<NewPlanTask, 'id' | 'planId'>) => {
    try {
      setIsCreating(true)
      await PlanningService.addTaskToPlan(planId, taskData)
      onTasksChange()
      setShowCreationForm(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }, [planId, onTasksChange])

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<PlanTask>) => {
    try {
      // Update task status if provided
      if (updates.status) {
        await PlanningService.updateTaskStatus(taskId, updates.status, updates.actualDuration)
      } else {
        // For other updates, use the general update method
        await PlanningService.updateTask(taskId, updates)
      }

      onTasksChange()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [onTasksChange])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await PlanningService.deleteTask(taskId)
      onTasksChange()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [onTasksChange])

  const handleDuplicateTask = useCallback(async (taskId: string) => {
    try {
      const taskToDuplicate = tasks.find(t => t.id === taskId)
      if (!taskToDuplicate) {
        throw new Error('Task not found')
      }

      // Create duplicate with modified title and reset status
      const duplicateData = {
        ...taskToDuplicate,
        title: `${taskToDuplicate.title} (Copy)`,
        status: 'pending' as const,
        completedAt: undefined,
        actualDuration: undefined,
        dependencies: [], // Reset dependencies to avoid circular references
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Remove fields that shouldn't be copied
      const { id, planId, ...taskDataWithoutIds } = duplicateData

      await PlanningService.addTaskToPlan(planId, taskDataWithoutIds)
      onTasksChange()
    } catch (error) {
      console.error('Failed to duplicate task:', error)
      throw error
    }
  }, [planId, tasks, onTasksChange])

  if (tasks.length === 0 && !showCreationForm) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="text-center py-8">
            <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks</h3>
            <p className="text-muted-foreground mb-4">
              Start organizing your plan by creating your first task.
            </p>
            <Button onClick={() => setShowCreationForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Creation Form */}
      {showCreationForm && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCreationForm
              planId={planId}
              existingTasks={tasks}
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreationForm(false)}
              isSubmitting={isCreating}
            />
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      {tasks.length > 0 && (
        <TaskList
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onDuplicateTask={handleDuplicateTask}
        />
      )}

      {/* Add Task Button */}
      {!showCreationForm && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCreationForm(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  )
}
