// Planning-related database schema interfaces

export interface OperationalPlan {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  status: 'draft' | 'active' | 'completed' | 'archived'
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  branchId?: string // Optional branch assignment
  templateId?: string // Reference to template used
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface PlanGoal {
  id: string
  planId: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string // e.g., 'cups', 'IDR', 'percentage'
  category: 'sales' | 'production' | 'efficiency' | 'quality' | 'cost'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  completed: boolean
  branchId?: string // Optional foreign key to Branch for sales target integration
  linkedTaskIds: string[] // Array of task IDs that are linked to this goal
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface PlanTask {
  id: string
  planId: string
  title: string
  description: string
  category: 'setup' | 'production' | 'sales' | 'inventory' | 'maintenance' | 'training'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assignedTo?: string // User/staff assignment
  estimatedDuration: number // in minutes
  actualDuration?: number // in minutes
  dependencies: string[] // Array of task IDs that must be completed first
  dueDate?: string
  completedAt?: string
  taskType?: 'warehouse-batches' | 'ingredient-purchases' | 'production-batches' | 'sales-records' | 'product-creation' // Optional task type for internal linking
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface PlanMetric {
  id: string
  planId: string
  name: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  category: 'financial' | 'operational' | 'quality' | 'efficiency'
  trackingFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  lastUpdated: string
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface PlanTemplate {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  category: 'operations' | 'sales' | 'production' | 'inventory' | 'strategy'
  isDefault: boolean
  estimatedDuration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string // Stored as comma-separated string
  note: string
  businessId: string // Foreign key to Business
  createdAt: string
  updatedAt: string
}

export interface PlanGoalTemplate {
  id: string
  templateId: string
  title: string
  description: string
  defaultTargetValue: number
  unit: string
  category: 'sales' | 'production' | 'efficiency' | 'quality' | 'cost'
  priority: 'low' | 'medium' | 'high'
  note: string
  businessId: string // Foreign key to Business
}

export interface PlanTaskTemplate {
  id: string
  templateId: string
  title: string
  description: string
  category: 'setup' | 'production' | 'sales' | 'inventory' | 'maintenance' | 'training'
  priority: 'low' | 'medium' | 'high'
  estimatedDuration: number // in minutes
  dependencies: string[] // Array of template task IDs
  note: string
  businessId: string // Foreign key to Business
}

export interface PlanMetricTemplate {
  id: string
  templateId: string
  name: string
  description: string
  defaultTargetValue: number
  unit: string
  category: 'financial' | 'operational' | 'quality' | 'efficiency'
  trackingFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  note: string
  businessId: string // Foreign key to Business
}

// Extended types with relationships
export interface OperationalPlanWithDetails extends OperationalPlan {
  goals: PlanGoal[]
  tasks: PlanTask[]
  metrics: PlanMetric[]
  branch?: import('./schema').Branch
  template?: PlanTemplate
  goalsWithProgress: (PlanGoal & {
    progressPercentage: number
    branch?: import('./schema').Branch
    linkedTasks: PlanTask[]
  })[]
  tasksWithStatus: (PlanTask & { canStart: boolean })[]
  metricsWithProgress: (PlanMetric & { progressPercentage: number })[]
}

export interface PlanTemplateWithDetails extends PlanTemplate {
  goalTemplates: PlanGoalTemplate[]
  taskTemplates: PlanTaskTemplate[]
  metricTemplates: PlanMetricTemplate[]
  usageCount: number
  lastUsed?: string
}

// Type aliases for creating new records
export type NewOperationalPlan = Omit<OperationalPlan, 'createdAt' | 'updatedAt'>
export type NewPlanGoal = Omit<PlanGoal, 'createdAt' | 'updatedAt'>
export type NewPlanTask = Omit<PlanTask, 'createdAt' | 'updatedAt'>
export type NewPlanMetric = Omit<PlanMetric, 'createdAt' | 'updatedAt'>
export type NewPlanTemplate = Omit<PlanTemplate, 'createdAt' | 'updatedAt'>
export type NewPlanGoalTemplate = Omit<PlanGoalTemplate, 'id'>
export type NewPlanTaskTemplate = Omit<PlanTaskTemplate, 'id'>
export type NewPlanMetricTemplate = Omit<PlanMetricTemplate, 'id'>

// Planning analytics interfaces
export interface PlanAnalytics {
  totalPlans: number
  activePlans: number
  completedPlans: number
  averageCompletionRate: number
  totalGoalsAchieved: number
  totalTasksCompleted: number
  averageTaskDuration: number
  mostUsedTemplate: string
  plansByType: Record<OperationalPlan['type'], number>
  plansByStatus: Record<OperationalPlan['status'], number>
  goalsByCategory: Record<PlanGoal['category'], number>
  tasksByCategory: Record<PlanTask['category'], number>
}

export interface PlanProgress {
  planId: string
  overallProgress: number // 0-100
  goalsProgress: number // 0-100
  tasksProgress: number // 0-100
  metricsProgress: number // 0-100
  isOnTrack: boolean
  daysRemaining: number
  estimatedCompletionDate: string
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}
