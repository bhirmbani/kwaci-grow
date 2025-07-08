import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type {
  OperationalPlan,
  NewOperationalPlan,
  OperationalPlanWithDetails,
  PlanGoal,
  NewPlanGoal,
  PlanTask,
  NewPlanTask,
  PlanMetric,
  NewPlanMetric,
  PlanTemplate,
  NewPlanTemplate,
  PlanAnalytics,
  PlanProgress
} from '@/lib/db/planningSchema'

export class PlanningService {
  /**
   * Create a new operational plan
   */
  static async createPlan(planData: Omit<NewOperationalPlan, 'id'>): Promise<OperationalPlan> {
    const now = new Date().toISOString()

    const newPlan: OperationalPlan = {
      id: uuidv4(),
      ...planData,
      createdAt: now,
      updatedAt: now,
    }

    await db.operationalPlans.add(newPlan)
    return newPlan
  }

  /**
   * Get all operational plans
   */
  static async getAllPlans(): Promise<OperationalPlan[]> {
    try {
      return await db.operationalPlans.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('PlanningService.getAllPlans() - Database error:', error)
      throw error
    }
  }

  /**
   * Get plan by ID with full details
   */
  static async getPlanWithDetails(planId: string): Promise<OperationalPlanWithDetails | null> {
    try {
      const plan = await db.operationalPlans.get(planId)
      if (!plan) return null

      const [goals, tasks, metrics, branch, template] = await Promise.all([
        db.planGoals.where('planId').equals(planId).toArray(),
        db.planTasks.where('planId').equals(planId).toArray(),
        db.planMetrics.where('planId').equals(planId).toArray(),
        plan.branchId ? db.branches.get(plan.branchId) : Promise.resolve(undefined),
        plan.templateId ? db.planTemplates.get(plan.templateId) : Promise.resolve(undefined)
      ])

      // Calculate progress for goals
      const goalsWithProgress = goals.map(goal => ({
        ...goal,
        progressPercentage: goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0
      }))

      // Calculate task dependencies
      const tasksWithStatus = tasks.map(task => {
        const canStart = task.dependencies.length === 0 || 
          task.dependencies.every(depId => 
            tasks.find(t => t.id === depId)?.status === 'completed'
          )
        return { ...task, canStart }
      })

      // Calculate progress for metrics
      const metricsWithProgress = metrics.map(metric => ({
        ...metric,
        progressPercentage: metric.targetValue > 0 ? Math.min((metric.currentValue / metric.targetValue) * 100, 100) : 0
      }))

      return {
        ...plan,
        branch,
        template,
        goalsWithProgress,
        tasksWithStatus,
        metricsWithProgress
      }
    } catch (error) {
      console.error('PlanningService.getPlanWithDetails() - Database error:', error)
      throw error
    }
  }

  /**
   * Update plan status
   */
  static async updatePlanStatus(planId: string, status: OperationalPlan['status']): Promise<void> {
    const now = new Date().toISOString()
    await db.operationalPlans.update(planId, { status, updatedAt: now })
  }

  /**
   * Add goal to plan
   */
  static async addGoalToPlan(planId: string, goalData: Omit<NewPlanGoal, 'id' | 'planId'>): Promise<PlanGoal> {
    const now = new Date().toISOString()
    
    const newGoal: PlanGoal = {
      id: uuidv4(),
      planId,
      ...goalData,
      createdAt: now,
      updatedAt: now,
    }
    
    await db.planGoals.add(newGoal)
    return newGoal
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(goalId: string, currentValue: number, completed?: boolean): Promise<void> {
    const now = new Date().toISOString()
    const updates: Partial<PlanGoal> = { 
      currentValue, 
      updatedAt: now 
    }
    
    if (completed !== undefined) {
      updates.completed = completed
    }
    
    await db.planGoals.update(goalId, updates)
  }

  /**
   * Add task to plan
   */
  static async addTaskToPlan(planId: string, taskData: Omit<NewPlanTask, 'id' | 'planId'>): Promise<PlanTask> {
    const now = new Date().toISOString()
    
    const newTask: PlanTask = {
      id: uuidv4(),
      planId,
      ...taskData,
      createdAt: now,
      updatedAt: now,
    }
    
    await db.planTasks.add(newTask)
    return newTask
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(taskId: string, status: PlanTask['status'], actualDuration?: number): Promise<void> {
    const now = new Date().toISOString()
    const updates: Partial<PlanTask> = { 
      status, 
      updatedAt: now 
    }
    
    if (status === 'completed') {
      updates.completedAt = now
    }
    
    if (actualDuration !== undefined) {
      updates.actualDuration = actualDuration
    }
    
    await db.planTasks.update(taskId, updates)
  }

  /**
   * Add metric to plan
   */
  static async addMetricToPlan(planId: string, metricData: Omit<NewPlanMetric, 'id' | 'planId'>): Promise<PlanMetric> {
    const now = new Date().toISOString()
    
    const newMetric: PlanMetric = {
      id: uuidv4(),
      planId,
      ...metricData,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
    }
    
    await db.planMetrics.add(newMetric)
    return newMetric
  }

  /**
   * Update metric value
   */
  static async updateMetricValue(metricId: string, currentValue: number): Promise<void> {
    const now = new Date().toISOString()
    await db.planMetrics.update(metricId, { 
      currentValue, 
      lastUpdated: now,
      updatedAt: now 
    })
  }

  /**
   * Get plan analytics
   */
  static async getPlanAnalytics(): Promise<PlanAnalytics> {
    try {
      const [plans, goals, tasks] = await Promise.all([
        db.operationalPlans.toArray(),
        db.planGoals.toArray(),
        db.planTasks.toArray()
      ])

      const totalPlans = plans.length
      const activePlans = plans.filter(p => p.status === 'active').length
      const completedPlans = plans.filter(p => p.status === 'completed').length
      
      const completedGoals = goals.filter(g => g.completed).length
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      
      const averageCompletionRate = totalPlans > 0 
        ? (completedPlans / totalPlans) * 100 
        : 0

      const tasksWithDuration = tasks.filter(t => t.actualDuration && t.actualDuration > 0)
      const averageTaskDuration = tasksWithDuration.length > 0
        ? tasksWithDuration.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / tasksWithDuration.length
        : 0

      // Count by type and status
      const plansByType = plans.reduce((acc, plan) => {
        acc[plan.type] = (acc[plan.type] || 0) + 1
        return acc
      }, {} as Record<OperationalPlan['type'], number>)

      const plansByStatus = plans.reduce((acc, plan) => {
        acc[plan.status] = (acc[plan.status] || 0) + 1
        return acc
      }, {} as Record<OperationalPlan['status'], number>)

      const goalsByCategory = goals.reduce((acc, goal) => {
        acc[goal.category] = (acc[goal.category] || 0) + 1
        return acc
      }, {} as Record<PlanGoal['category'], number>)

      const tasksByCategory = tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      }, {} as Record<PlanTask['category'], number>)

      // Find most used template
      const templateUsage = plans.reduce((acc, plan) => {
        if (plan.templateId) {
          acc[plan.templateId] = (acc[plan.templateId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const mostUsedTemplateId = Object.entries(templateUsage)
        .sort(([,a], [,b]) => b - a)[0]?.[0]
      
      const mostUsedTemplate = mostUsedTemplateId 
        ? (await db.planTemplates.get(mostUsedTemplateId))?.name || 'Unknown'
        : 'None'

      return {
        totalPlans,
        activePlans,
        completedPlans,
        averageCompletionRate,
        totalGoalsAchieved: completedGoals,
        totalTasksCompleted: completedTasks,
        averageTaskDuration,
        mostUsedTemplate,
        plansByType,
        plansByStatus,
        goalsByCategory,
        tasksByCategory
      }
    } catch (error) {
      console.error('PlanningService.getPlanAnalytics() - Database error:', error)
      throw error
    }
  }

  /**
   * Calculate plan progress
   */
  static async calculatePlanProgress(planId: string): Promise<PlanProgress> {
    try {
      const planDetails = await this.getPlanWithDetails(planId)
      if (!planDetails) {
        throw new Error('Plan not found')
      }

      const { goalsWithProgress, tasksWithStatus, metricsWithProgress } = planDetails

      // Calculate overall progress
      const goalsProgress = goalsWithProgress.length > 0
        ? goalsWithProgress.reduce((sum, g) => sum + g.progressPercentage, 0) / goalsWithProgress.length
        : 0

      const tasksProgress = tasksWithStatus.length > 0
        ? (tasksWithStatus.filter(t => t.status === 'completed').length / tasksWithStatus.length) * 100
        : 0

      const metricsProgress = metricsWithProgress.length > 0
        ? metricsWithProgress.reduce((sum, m) => sum + m.progressPercentage, 0) / metricsWithProgress.length
        : 0

      const overallProgress = (goalsProgress + tasksProgress + metricsProgress) / 3

      // Calculate time-based metrics
      const now = new Date()
      const startDate = new Date(planDetails.startDate)
      const endDate = new Date(planDetails.endDate)
      
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, totalDays - elapsedDays)
      
      const expectedProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0
      const isOnTrack = overallProgress >= expectedProgress - 10 // 10% tolerance

      // Estimate completion date
      const progressRate = elapsedDays > 0 ? overallProgress / elapsedDays : 0
      const estimatedDaysToComplete = progressRate > 0 ? (100 - overallProgress) / progressRate : totalDays
      const estimatedCompletionDate = new Date(now.getTime() + estimatedDaysToComplete * 24 * 60 * 60 * 1000)

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      if (overallProgress < expectedProgress - 20) {
        riskLevel = 'high'
      } else if (overallProgress < expectedProgress - 10) {
        riskLevel = 'medium'
      }

      // Generate recommendations
      const recommendations: string[] = []
      if (riskLevel === 'high') {
        recommendations.push('Consider reallocating resources to critical tasks')
        recommendations.push('Review and adjust plan timeline if necessary')
      }
      if (tasksProgress < goalsProgress) {
        recommendations.push('Focus on completing pending tasks to support goal achievement')
      }
      if (metricsProgress < 50) {
        recommendations.push('Update metric tracking more frequently for better visibility')
      }

      return {
        planId,
        overallProgress,
        goalsProgress,
        tasksProgress,
        metricsProgress,
        isOnTrack,
        daysRemaining,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
        riskLevel,
        recommendations
      }
    } catch (error) {
      console.error('PlanningService.calculatePlanProgress() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete a plan and all related data
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      await Promise.all([
        db.planGoals.where('planId').equals(planId).delete(),
        db.planTasks.where('planId').equals(planId).delete(),
        db.planMetrics.where('planId').equals(planId).delete(),
        db.operationalPlans.delete(planId)
      ])
    } catch (error) {
      console.error('PlanningService.deletePlan() - Database error:', error)
      throw error
    }
  }
}
