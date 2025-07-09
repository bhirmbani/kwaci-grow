import { TaskItem } from './TaskItem'
import { sortTasksByDependencies } from '@/lib/utils/taskUtils'
import type { PlanTask } from '@/lib/db/planningSchema'

interface TaskListProps {
  tasks: PlanTask[]
  onUpdateTask: (taskId: string, updates: Partial<PlanTask>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onDuplicateTask: (taskId: string) => Promise<void>
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onDuplicateTask }: TaskListProps) {
  // Sort tasks by dependencies to show them in logical order
  const sortedTasks = sortTasksByDependencies(tasks)

  return (
    <div className="space-y-3">
      {sortedTasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          allTasks={tasks}
          index={index}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onDuplicate={onDuplicateTask}
        />
      ))}
    </div>
  )
}
