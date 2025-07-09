import type { PlanTask } from '@/lib/db/planningSchema'

// Status mapping between database values and display values
export const STATUS_DISPLAY_MAP = {
  'pending': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
} as const

export const STATUS_REVERSE_MAP = {
  'Not Started': 'pending',
  'In Progress': 'in-progress',
  'Completed': 'completed',
  'Cancelled': 'cancelled'
} as const

// Task type routing mapping
export const TASK_TYPE_ROUTES = {
  'warehouse-batches': '/warehouse',
  'ingredient-purchases': '/ingredients',
  'production-batches': '/production',
  'sales-records': '/operations',
  'product-creation': '/products'
} as const

// Task type display names
export const TASK_TYPE_DISPLAY_MAP = {
  'warehouse-batches': 'Warehouse Batches',
  'ingredient-purchases': 'Ingredient Purchases',
  'production-batches': 'Production Batches',
  'sales-records': 'Sales Records',
  'product-creation': 'Product Creation'
} as const

// Priority display configuration
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  },
  medium: {
    label: 'Medium',
    variant: 'default' as const,
    color: 'text-orange-600'
  },
  high: {
    label: 'High',
    variant: 'destructive' as const,
    color: 'text-red-600'
  }
} as const

// Status display configuration
export const STATUS_CONFIG = {
  'pending': {
    label: 'Not Started',
    variant: 'outline' as const,
    color: 'text-muted-foreground',
    icon: 'Circle'
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'secondary' as const,
    color: 'text-blue-600',
    icon: 'Clock'
  },
  'completed': {
    label: 'Completed',
    variant: 'default' as const,
    color: 'text-green-600',
    icon: 'CheckCircle'
  },
  'cancelled': {
    label: 'Cancelled',
    variant: 'destructive' as const,
    color: 'text-red-600',
    icon: 'XCircle'
  }
} as const

// Category display configuration
export const CATEGORY_CONFIG = {
  setup: {
    label: 'Setup',
    color: 'text-purple-600'
  },
  production: {
    label: 'Production',
    color: 'text-blue-600'
  },
  sales: {
    label: 'Sales',
    color: 'text-green-600'
  },
  inventory: {
    label: 'Inventory',
    color: 'text-orange-600'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-red-600'
  },
  training: {
    label: 'Training',
    color: 'text-indigo-600'
  }
} as const

/**
 * Get display status from database status
 */
export function getDisplayStatus(status: PlanTask['status']): string {
  return STATUS_DISPLAY_MAP[status]
}

/**
 * Get database status from display status
 */
export function getDatabaseStatus(displayStatus: string): PlanTask['status'] {
  return STATUS_REVERSE_MAP[displayStatus as keyof typeof STATUS_REVERSE_MAP]
}

/**
 * Get route for task type
 */
export function getTaskTypeRoute(taskType: PlanTask['taskType']): string | null {
  if (!taskType) return null
  return TASK_TYPE_ROUTES[taskType]
}

/**
 * Get display name for task type
 */
export function getTaskTypeDisplayName(taskType: PlanTask['taskType']): string | null {
  if (!taskType) return null
  return TASK_TYPE_DISPLAY_MAP[taskType]
}

/**
 * Check if a task can be started based on dependencies
 */
export function canTaskStart(task: PlanTask, allTasks: PlanTask[]): boolean {
  if (task.dependencies.length === 0) return true
  
  const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id))
  return dependencyTasks.every(t => t.status === 'completed')
}

/**
 * Get tasks that depend on a given task
 */
export function getDependentTasks(taskId: string, allTasks: PlanTask[]): PlanTask[] {
  return allTasks.filter(task => task.dependencies.includes(taskId))
}

/**
 * Validate task dependencies to prevent circular dependencies
 */
export function validateTaskDependencies(
  taskId: string,
  dependencies: string[],
  allTasks: PlanTask[]
): { isValid: boolean; error?: string } {
  // Check for self-dependency
  if (dependencies.includes(taskId)) {
    return { isValid: false, error: 'A task cannot depend on itself' }
  }

  // Check for circular dependencies using DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(currentTaskId: string): boolean {
    if (recursionStack.has(currentTaskId)) return true
    if (visited.has(currentTaskId)) return false

    visited.add(currentTaskId)
    recursionStack.add(currentTaskId)

    const currentTask = allTasks.find(t => t.id === currentTaskId)
    if (currentTask) {
      for (const depId of currentTask.dependencies) {
        if (hasCycle(depId)) return true
      }
    }

    recursionStack.delete(currentTaskId)
    return false
  }

  // Create a temporary task with the new dependencies to test
  const tempTask: PlanTask = {
    id: taskId,
    dependencies,
    // Add other required fields with dummy values for validation
    planId: '',
    title: '',
    description: '',
    category: 'setup',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 0,
    note: '',
    createdAt: '',
    updatedAt: ''
  }

  const tasksWithTemp = allTasks.filter(t => t.id !== taskId).concat(tempTask)

  for (const depId of dependencies) {
    if (hasCycle(depId)) {
      return { isValid: false, error: 'Circular dependency detected' }
    }
  }

  return { isValid: true }
}

/**
 * Sort tasks by dependencies (topological sort)
 */
export function sortTasksByDependencies(tasks: PlanTask[]): PlanTask[] {
  const sorted: PlanTask[] = []
  const visited = new Set<string>()
  const temp = new Set<string>()

  function visit(task: PlanTask) {
    if (temp.has(task.id)) {
      // Circular dependency detected, just add the task
      return
    }
    if (visited.has(task.id)) return

    temp.add(task.id)

    // Visit dependencies first
    for (const depId of task.dependencies) {
      const depTask = tasks.find(t => t.id === depId)
      if (depTask) {
        visit(depTask)
      }
    }

    temp.delete(task.id)
    visited.add(task.id)
    sorted.push(task)
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      visit(task)
    }
  }

  return sorted
}
