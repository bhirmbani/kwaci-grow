import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target } from 'lucide-react'
import { GoalForm } from './GoalForm'
import { GoalList } from './GoalList'
import { PlanningService } from '@/lib/services/planningService'
import type { PlanGoal, PlanTask, NewPlanGoal } from '@/lib/db/planningSchema'
import type { Branch } from '@/lib/db/schema'

interface GoalManagementProps {
  planId: string
  goals: (PlanGoal & { 
    progressPercentage: number
    branch?: Branch
    linkedTasks: PlanTask[]
  })[]
  tasks: PlanTask[]
  onGoalsChange: () => void
}

export function GoalManagement({ planId, goals = [], tasks = [], onGoalsChange }: GoalManagementProps) {
  const [showCreationForm, setShowCreationForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGoal = useCallback(async (goalData: Omit<NewPlanGoal, 'id' | 'planId'>) => {
    try {
      setIsCreating(true)
      await PlanningService.addGoalToPlan(planId, goalData)
      onGoalsChange()
      setShowCreationForm(false)
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setIsCreating(false)
    }
  }, [planId, onGoalsChange])

  const handleUpdateGoal = useCallback(async (goalId: string, updates: Partial<PlanGoal>) => {
    try {
      await PlanningService.updateGoal(goalId, updates)
      onGoalsChange()
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }, [onGoalsChange])

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    try {
      await PlanningService.deleteGoal(goalId)
      onGoalsChange()
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }, [onGoalsChange])

  if (goals.length === 0 && !showCreationForm) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals</h3>
            <p className="text-muted-foreground mb-4">
              Start organizing your plan by creating your first goal.
            </p>
            <Button onClick={() => setShowCreationForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Goal Creation Form */}
      {showCreationForm && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm
              planId={planId}
              availableTasks={tasks}
              onSubmit={handleCreateGoal}
              onCancel={() => setShowCreationForm(false)}
              isSubmitting={isCreating}
            />
          </CardContent>
        </Card>
      )}

      {/* Goal List */}
      {goals.length > 0 && (
        <div className="space-y-4">
          {/* Header with Add Button */}
          {!showCreationForm && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Goals ({goals.length})</h3>
              <Button onClick={() => setShowCreationForm(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </div>
          )}

          <GoalList
            goals={goals}
            allTasks={tasks}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
      )}

      {/* Add Goal Button when form is not shown and goals exist */}
      {goals.length > 0 && !showCreationForm && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowCreationForm(true)} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Goal
          </Button>
        </div>
      )}
    </div>
  )
}
