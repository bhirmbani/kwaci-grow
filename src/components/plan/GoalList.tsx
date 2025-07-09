import { GoalItem } from './GoalItem'
import type { PlanGoal, PlanTask } from '@/lib/db/planningSchema'
import type { Branch } from '@/lib/db/schema'

interface GoalListProps {
  goals: (PlanGoal & { 
    progressPercentage: number
    branch?: Branch
    linkedTasks: PlanTask[]
  })[]
  allTasks: PlanTask[]
  onUpdateGoal: (goalId: string, updates: Partial<PlanGoal>) => Promise<void>
  onDeleteGoal: (goalId: string) => Promise<void>
}

export function GoalList({ goals, allTasks, onUpdateGoal, onDeleteGoal }: GoalListProps) {
  // Sort goals by priority (high first), then by creation date
  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    
    if (priorityDiff !== 0) {
      return priorityDiff
    }
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-3">
      {sortedGoals.map((goal, index) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          allTasks={allTasks}
          index={index}
          onUpdate={onUpdateGoal}
          onDelete={onDeleteGoal}
        />
      ))}
    </div>
  )
}
