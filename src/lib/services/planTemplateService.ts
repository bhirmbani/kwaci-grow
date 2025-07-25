import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentBusinessId, filterByBusiness, withBusinessId } from './businessContext'

// Business ID provider for dependency injection
let businessIdProvider: (() => string | null) | null = null

/**
 * Set the business ID provider function
 * This allows the service to get the current business ID without direct store dependency
 */
export function setBusinessIdProvider(provider: () => string | null) {
  businessIdProvider = provider
}
import type {
  PlanTemplate,
  NewPlanTemplate,
  PlanTemplateWithDetails,
  PlanGoalTemplate,
  NewPlanGoalTemplate,
  PlanTaskTemplate,
  NewPlanTaskTemplate,
  PlanMetricTemplate,
  NewPlanMetricTemplate,
  OperationalPlan
} from '@/lib/db/planningSchema'

export class PlanTemplateService {
  /**
   * Create a new plan template
   */
  static async createTemplate(templateData: Omit<NewPlanTemplate, 'id'>): Promise<PlanTemplate> {
    const now = new Date().toISOString()

    const newTemplate: PlanTemplate = {
      id: uuidv4(),
      ...templateData,
      createdAt: now,
      updatedAt: now,
    }

    await db.planTemplates.add(newTemplate)
    return newTemplate
  }

  /**
   * Get all plan templates
   */
  static async getAllTemplates(): Promise<PlanTemplate[]> {
    try {
      return await db.planTemplates.orderBy('name').toArray()
    } catch (error) {
      console.error('PlanTemplateService.getAllTemplates() - Database error:', error)
      throw error
    }
  }

  /**
   * Get template with details including usage statistics
   */
  static async getTemplateWithDetails(templateId: string): Promise<PlanTemplateWithDetails | null> {
    try {
      const template = await db.planTemplates.get(templateId)
      if (!template) return null

      // Get template components
      const [goalTemplates, taskTemplates, metricTemplates] = await Promise.all([
        db.planGoalTemplates.where('templateId').equals(templateId).toArray(),
        db.planTaskTemplates.where('templateId').equals(templateId).toArray(),
        db.planMetricTemplates.where('templateId').equals(templateId).toArray()
      ])

      // Get usage statistics
      const plansUsingTemplate = await db.operationalPlans
        .where('templateId')
        .equals(templateId)
        .toArray()

      const usageCount = plansUsingTemplate.length
      const lastUsed = plansUsingTemplate.length > 0
        ? plansUsingTemplate
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            .createdAt
        : undefined

      return {
        ...template,
        goalTemplates,
        taskTemplates,
        metricTemplates,
        usageCount,
        lastUsed
      }
    } catch (error) {
      console.error('PlanTemplateService.getTemplateWithDetails() - Database error:', error)
      throw error
    }
  }

  /**
   * Add goal template to plan template
   */
  static async addGoalTemplate(templateId: string, goalData: Omit<NewPlanGoalTemplate, 'templateId'>): Promise<PlanGoalTemplate> {
    const newGoalTemplate: PlanGoalTemplate = {
      id: uuidv4(),
      templateId,
      ...withBusinessId(goalData),
    }
    
    await db.planGoalTemplates.add(newGoalTemplate)
    return newGoalTemplate
  }

  /**
   * Add task template to plan template
   */
  static async addTaskTemplate(templateId: string, taskData: Omit<NewPlanTaskTemplate, 'templateId'>): Promise<PlanTaskTemplate> {
    const newTaskTemplate: PlanTaskTemplate = {
      id: uuidv4(),
      templateId,
      ...withBusinessId(taskData),
    }
    
    await db.planTaskTemplates.add(newTaskTemplate)
    return newTaskTemplate
  }

  /**
   * Add metric template to plan template
   */
  static async addMetricTemplate(templateId: string, metricData: Omit<NewPlanMetricTemplate, 'templateId'>): Promise<PlanMetricTemplate> {
    const newMetricTemplate: PlanMetricTemplate = {
      id: uuidv4(),
      templateId,
      ...metricData,
    }
    
    await db.planMetricTemplates.add(newMetricTemplate)
    return newMetricTemplate
  }

  /**
   * Create plan from template with enhanced goal and task integration
   */
  static async createPlanFromTemplate(
    templateId: string,
    planData: {
      name: string
      description: string
      startDate: string
      endDate: string
      branchId?: string
      note?: string
    }
  ): Promise<OperationalPlan> {
    try {
      const template = await db.planTemplates.get(templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      const [goalTemplates, taskTemplates, metricTemplates] = await Promise.all([
        db.planGoalTemplates.where('templateId').equals(templateId).toArray(),
        db.planTaskTemplates.where('templateId').equals(templateId).toArray(),
        db.planMetricTemplates.where('templateId').equals(templateId).toArray()
      ])

      // Validate branch requirement for goals
      if (goalTemplates.length > 0 && !planData.branchId) {
        throw new Error('Branch selection is required when creating plans from templates that include goals')
      }

      const now = new Date().toISOString()
      const planId = uuidv4()

      // Create the plan
      const newPlan: OperationalPlan = {
        id: planId,
        name: planData.name,
        description: planData.description,
        type: template.type,
        status: 'draft',
        startDate: planData.startDate,
        endDate: planData.endDate,
        branchId: planData.branchId,
        templateId: templateId,
        note: planData.note || '',
        ...withBusinessId({}),
        createdAt: now,
        updatedAt: now,
      }

      await db.operationalPlans.add(newPlan)

      // Step 1: Create tasks first to establish ID mapping for dependencies
      const templateToActualTaskIdMap = new Map<string, string>()
      const createdTasks: any[] = []

      for (const taskTemplate of taskTemplates) {
        const actualTaskId = uuidv4()
        templateToActualTaskIdMap.set(taskTemplate.id, actualTaskId)

        const newTask = {
          id: actualTaskId,
          planId,
          title: taskTemplate.title,
          description: taskTemplate.description,
          category: taskTemplate.category,
          priority: taskTemplate.priority,
          status: 'pending' as const,
          estimatedDuration: taskTemplate.estimatedDuration,
          dependencies: [], // Will be updated in step 2
          note: taskTemplate.note,
          ...withBusinessId({}),
          createdAt: now,
          updatedAt: now,
        }

        createdTasks.push({ task: newTask, templateDependencies: taskTemplate.dependencies })
        await db.planTasks.add(newTask)
      }

      // Step 2: Update task dependencies with actual task IDs
      for (const { task, templateDependencies } of createdTasks) {
        if (templateDependencies && templateDependencies.length > 0) {
          const actualDependencies = templateDependencies
            .map((templateId: string) => templateToActualTaskIdMap.get(templateId))
            .filter(Boolean) as string[] // Filter out undefined values

          if (actualDependencies.length > 0) {
            await db.planTasks.update(task.id, { dependencies: actualDependencies })
          }
        }
      }

      // Step 3: Create goals with branchId and linkedTaskIds
      const createdGoals: any[] = []
      for (const goalTemplate of goalTemplates) {
        const goalId = uuidv4()

        // Find tasks that match this goal's category for linking
        const linkedTaskIds = createdTasks
          .filter(({ task }) => task.category === goalTemplate.category)
          .map(({ task }) => task.id)

        const newGoal = {
          id: goalId,
          planId,
          title: goalTemplate.title,
          description: goalTemplate.description,
          targetValue: goalTemplate.defaultTargetValue,
          currentValue: 0,
          unit: goalTemplate.unit,
          category: goalTemplate.category,
          priority: goalTemplate.priority,
          completed: false,
          branchId: planData.branchId, // Use plan's branchId for all goals
          linkedTaskIds,
          note: goalTemplate.note,
          ...withBusinessId({}),
          createdAt: now,
          updatedAt: now,
        }

        createdGoals.push(newGoal)
        await db.planGoals.add(newGoal)
      }

      // Step 4: Create metrics from templates
      const metricPromises = metricTemplates.map(metricTemplate =>
        db.planMetrics.add({
          id: uuidv4(),
          planId,
          name: metricTemplate.name,
          description: metricTemplate.description,
          targetValue: metricTemplate.defaultTargetValue,
          currentValue: 0,
          unit: metricTemplate.unit,
          category: metricTemplate.category,
          trackingFrequency: metricTemplate.trackingFrequency,
          lastUpdated: now,
          note: metricTemplate.note,
          ...withBusinessId({}),
          createdAt: now,
          updatedAt: now,
        })
      )

      await Promise.all(metricPromises)

      return newPlan
    } catch (error) {
      console.error('PlanTemplateService.createPlanFromTemplate() - Database error:', error)
      throw error
    }
  }

  /**
   * Get default templates by category
   */
  static async getDefaultTemplates(): Promise<PlanTemplate[]> {
    console.log('🔍 PlanTemplateService.getDefaultTemplates() - Starting...')

    try {
      // First, ensure data is clean before attempting queries
      console.log('🧹 Step 1: Cleanup data before query...')
      try {
        await this.cleanupTemplateData()
        console.log('✅ Data cleanup completed')
      } catch (cleanupError) {
        console.warn('⚠️ Data cleanup failed, continuing with query:', cleanupError)
      }

      // Try manual filtering first (more reliable)
      console.log('🔄 Using manual filtering approach for reliability...')

      const businessId = getCurrentBusinessId()
      if (!businessId) {
        console.log('⚠️ No business selected, returning empty templates')
        return []
      }

      const allTemplates = await filterByBusiness(db.planTemplates, businessId).toArray()
      console.log('📊 Retrieved business-specific templates for filtering:', allTemplates.length)

      if (allTemplates.length === 0) {
        console.log('ℹ️ No templates found for business, initializing defaults...')
        await this.initializeDefaultTemplates()

        // Try again after initialization
        const newTemplates = await filterByBusiness(db.planTemplates, businessId).toArray()
        console.log('📊 Retrieved templates after initialization:', newTemplates.length)

        return newTemplates.filter(template => {
          return template && template.isDefault === true
        })
      }

      const filteredTemplates = allTemplates.filter(template => {
        if (!template) {
          console.warn('⚠️ Found null/undefined template, skipping')
          return false
        }

        // Ensure isDefault is a proper boolean
        const isDefaultValue = template.isDefault
        const isDefault = isDefaultValue === true || (typeof isDefaultValue === 'string' && isDefaultValue === 'true')

        if (isDefault) {
          console.log(`✅ Template "${template.name}" is default`)
        }

        return isDefault
      })

      console.log('✅ Manual filtering succeeded, found default templates:', filteredTemplates.length)

      // If no default templates found, initialize them
      if (filteredTemplates.length === 0) {
        console.log('ℹ️ No default templates found, initializing...')
        await this.initializeDefaultTemplates()

        // Try filtering again
        const newAllTemplates = await db.planTemplates.toArray()
        return newAllTemplates.filter(template => {
          return template && template.isDefault === true
        })
      }

      return filteredTemplates

    } catch (error) {
      console.error('❌ PlanTemplateService.getDefaultTemplates() - Error:', error)

      // Last resort: try to initialize default templates
      try {
        console.log('🚨 Last resort: initializing default templates...')
        await this.initializeDefaultTemplates()

        const templates = await db.planTemplates.toArray()
        return templates.filter(template => template && template.isDefault === true)
      } catch (initError) {
        console.error('❌ Failed to initialize default templates:', initError)
        return []
      }
    }
  }

  /**
   * Clean up template data types and missing fields
   */
  static async cleanupTemplateData(): Promise<number> {
    console.log('🧹 PlanTemplateService.cleanupTemplateData() - Starting cleanup...')

    try {
      // First, try to get all templates safely
      let allTemplates: any[] = []

      try {
        allTemplates = await db.planTemplates.toArray()
        console.log('📊 Retrieved templates for cleanup:', allTemplates.length)
      } catch (retrievalError) {
        console.error('❌ Failed to retrieve templates for cleanup:', retrievalError)
        console.log('🚨 Skipping cleanup due to retrieval error')
        return 0
      }

      if (allTemplates.length === 0) {
        console.log('ℹ️ No templates to clean up')
        return 0
      }

      let cleanedCount = 0

      for (let i = 0; i < allTemplates.length; i++) {
        const template = allTemplates[i]

        if (!template || !template.id) {
          console.warn(`⚠️ Skipping invalid template at index ${i}:`, template)
          continue
        }

        console.log(`🔍 Checking template ${i + 1}/${allTemplates.length}: "${template.name || 'Unnamed'}"`)

        const updates: any = {}
        let needsUpdate = false

        try {
          // Fix isDefault field type - ensure it's always a boolean
          if (typeof template.isDefault !== 'boolean') {
            const oldValue = template.isDefault
            // Convert various truthy values to boolean true, everything else to false
            if (oldValue === 'true' || oldValue === true || oldValue === 1 || oldValue === '1') {
              updates.isDefault = true
            } else {
              updates.isDefault = false
            }
            needsUpdate = true
            console.log(`🔧 Fixing isDefault: ${oldValue} (${typeof oldValue}) → ${updates.isDefault} (boolean)`)
          }

          // Ensure isDefault is never null or undefined
          if (template.isDefault === null || template.isDefault === undefined) {
            updates.isDefault = false
            needsUpdate = true
            console.log(`🔧 Fixing null/undefined isDefault → false (boolean)`)
          }

          // Add missing required fields with proper defaults
          if (!template.description || template.description.trim() === '') {
            updates.description = template.name ? `${template.name} template` : 'Template description'
            needsUpdate = true
            console.log(`🔧 Adding missing description: "${updates.description}"`)
          }

          if (!template.type) {
            updates.type = 'daily'
            needsUpdate = true
            console.log(`🔧 Adding missing type: "${updates.type}"`)
          }

          if (!template.category) {
            updates.category = 'operations'
            needsUpdate = true
            console.log(`🔧 Adding missing category: "${updates.category}"`)
          }

          if (!template.difficulty) {
            updates.difficulty = 'beginner'
            needsUpdate = true
            console.log(`🔧 Adding missing difficulty: "${updates.difficulty}"`)
          }

          if (!template.estimatedDuration || template.estimatedDuration <= 0) {
            updates.estimatedDuration = 60
            needsUpdate = true
            console.log(`🔧 Adding missing estimatedDuration: ${updates.estimatedDuration}`)
          }

          // Handle tags that could be string or array
          if (!template.tags ||
              (typeof template.tags === 'string' && template.tags.trim() === '') ||
              (Array.isArray(template.tags) && template.tags.length === 0)) {
            updates.tags = 'template'
            needsUpdate = true
            console.log(`🔧 Adding missing tags: "${updates.tags}"`)
          }

          // Convert array tags to string if needed
          if (Array.isArray(template.tags)) {
            updates.tags = template.tags.join(',')
            needsUpdate = true
            console.log(`🔧 Converting tags array to string: "${updates.tags}"`)
          }

          // Ensure timestamps exist
          const now = new Date().toISOString()
          if (!template.createdAt) {
            updates.createdAt = now
            needsUpdate = true
            console.log(`🔧 Adding missing createdAt: ${updates.createdAt}`)
          }

          if (!template.updatedAt) {
            updates.updatedAt = now
            needsUpdate = true
            console.log(`🔧 Adding missing updatedAt: ${updates.updatedAt}`)
          }

          if (needsUpdate) {
            console.log(`🔄 Updating template "${template.name}" with:`, updates)
            await db.planTemplates.update(template.id, updates)
            cleanedCount++
            console.log(`✅ Successfully cleaned template: ${template.name}`)
          } else {
            console.log(`✅ Template "${template.name}" is already clean`)
          }

        } catch (updateError) {
          console.error(`❌ Failed to update template "${template.name}":`, updateError)
          // Continue with other templates instead of failing completely
        }
      }

      console.log(`✅ Cleanup completed. Cleaned ${cleanedCount}/${allTemplates.length} templates`)
      return cleanedCount

    } catch (error) {
      console.error('❌ PlanTemplateService.cleanupTemplateData() - Cleanup failed:', error)
      console.log('🚨 Returning 0 to prevent further errors')
      return 0
    }
  }

  /**
   * Initialize default templates
   */
  static async initializeDefaultTemplates(): Promise<void> {
    console.log('🔄 PlanTemplateService.initializeDefaultTemplates() - Starting initialization...')

    try {
      // First, cleanup any existing data type issues
      console.log('🧹 Step 1: Cleanup existing data...')
      try {
        const cleanedCount = await this.cleanupTemplateData()
        console.log(`✅ Cleanup completed, cleaned ${cleanedCount} templates`)
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup failed, continuing with initialization:', cleanupError)
      }

      // Check if default templates already exist (direct query to avoid circular dependency)
      console.log('🔍 Step 2: Check for existing default templates...')
      try {
        const allTemplates = await db.planTemplates.toArray()
        const existingDefaults = allTemplates.filter(template => template && template.isDefault === true)
        if (existingDefaults.length > 0) {
          console.log(`🔍 Found ${existingDefaults.length} existing default templates, checking if they have goals and tasks...`)

          // Check if existing templates have goals and tasks
          let needsEnhancement = false
          for (const template of existingDefaults) {
            const [goals, tasks] = await Promise.all([
              this.getGoalTemplates(template.id),
              this.getTaskTemplates(template.id)
            ])

            if (goals.length === 0 && tasks.length === 0) {
              console.log(`⚠️ Template "${template.name}" has no goals or tasks, needs enhancement`)
              needsEnhancement = true
            } else {
              console.log(`✅ Template "${template.name}" has ${goals.length} goals and ${tasks.length} tasks`)
            }
          }

          if (!needsEnhancement) {
            console.log(`✅ All existing templates have goals and tasks, skipping initialization`)
            return
          } else {
            console.log(`🔄 Some templates need enhancement, adding goals and tasks to existing templates...`)

            // Add goals and tasks to existing templates that don't have them
            for (const template of existingDefaults) {
              const [goals, tasks] = await Promise.all([
                this.getGoalTemplates(template.id),
                this.getTaskTemplates(template.id)
              ])

              if (goals.length === 0 && tasks.length === 0) {
                console.log(`🎯 Enhancing template "${template.name}" with goals and tasks...`)
                await this.createDefaultGoalsAndTasks(template.id, template.type)
              }
            }

            console.log(`✅ Enhanced existing templates with goals and tasks`)
            return
          }
        }
        console.log('ℹ️ No existing default templates found, proceeding with initialization')
      } catch (checkError) {
        console.warn('⚠️ Failed to check existing templates, proceeding with initialization:', checkError)
      }

      const now = new Date().toISOString()

      // Daily Operations Template
      const dailyTemplate = withBusinessId({
        id: uuidv4(),
        name: 'Daily Operations',
        description: 'Standard daily operational plan for coffee shop management',
        type: 'daily' as const,
        category: 'operations' as const,
        isDefault: true,
        estimatedDuration: 480, // 8 hours
        difficulty: 'beginner' as const,
        tags: 'daily,operations,standard', // Store as comma-separated string
        note: 'Comprehensive daily operations template covering all essential activities',
        createdAt: now,
        updatedAt: now,
      })

      // Weekly Planning Template
      const weeklyTemplate = withBusinessId({
        id: uuidv4(),
        name: 'Weekly Planning',
        description: 'Weekly inventory, production schedules, and staff planning',
        type: 'weekly' as const,
        category: 'operations' as const,
        isDefault: true,
        estimatedDuration: 120, // 2 hours
        difficulty: 'intermediate' as const,
        tags: 'weekly,inventory,planning', // Store as comma-separated string
        note: 'Strategic weekly planning for inventory and resource management',
        createdAt: now,
        updatedAt: now,
      })

      // Monthly Strategy Template
      const monthlyTemplate = withBusinessId({
        id: uuidv4(),
        name: 'Monthly Strategy',
        description: 'Long-term planning, menu updates, and growth strategies',
        type: 'monthly' as const,
        category: 'strategy' as const,
        isDefault: true,
        estimatedDuration: 240, // 4 hours
        difficulty: 'advanced' as const,
        tags: 'monthly,strategy,growth', // Store as comma-separated string
        note: 'Strategic monthly planning for business growth and optimization',
        createdAt: now,
        updatedAt: now,
      })

      await Promise.all([
        db.planTemplates.add(dailyTemplate),
        db.planTemplates.add(weeklyTemplate),
        db.planTemplates.add(monthlyTemplate)
      ])

      console.log('✅ Default planning templates created, now adding goals and tasks...')

      // Add goals and tasks for Daily Operations Template
      await this.createDefaultGoalsAndTasks(dailyTemplate.id, 'daily')

      // Add goals and tasks for Weekly Planning Template
      await this.createDefaultGoalsAndTasks(weeklyTemplate.id, 'weekly')

      // Add goals and tasks for Monthly Strategy Template
      await this.createDefaultGoalsAndTasks(monthlyTemplate.id, 'monthly')

      console.log('✅ Default planning templates with goals and tasks initialized successfully')
    } catch (error) {
      console.error('PlanTemplateService.initializeDefaultTemplates() - Error:', error)
      throw error
    }
  }

  /**
   * Create default goals and tasks for a template
   */
  private static async createDefaultGoalsAndTasks(templateId: string, templateType: 'daily' | 'weekly' | 'monthly' | 'operational' | 'strategic'): Promise<void> {
    try {
      console.log(`🎯 Creating default goals and tasks for ${templateType} template (ID: ${templateId})...`)

      if (templateType === 'daily') {
        // Daily template goals
        void await this.addGoalTemplate(templateId, {
          title: 'Daily Sales Target',
          description: 'Achieve daily revenue target',
          defaultTargetValue: 2000000, // 2M IDR
          unit: 'IDR',
          category: 'sales',
          priority: 'high',
          note: 'Daily sales revenue goal'
        })

        void await this.addGoalTemplate(templateId, {
          title: 'Daily Production Target',
          description: 'Complete daily coffee production quota',
          defaultTargetValue: 100,
          unit: 'cups',
          category: 'production',
          priority: 'high',
          note: 'Daily coffee production goal'
        })

        // Daily template tasks
        const setupTask = await this.addTaskTemplate(templateId, {
          title: 'Morning Setup',
          description: 'Prepare equipment, check inventory, and open shop',
          category: 'setup',
          priority: 'high',
          estimatedDuration: 30,
          dependencies: [],
          note: 'Essential morning preparation tasks'
        })

        const productionTask = await this.addTaskTemplate(templateId, {
          title: 'Coffee Production',
          description: 'Prepare coffee beans, maintain quality standards',
          category: 'production',
          priority: 'high',
          estimatedDuration: 120,
          dependencies: [setupTask.id],
          note: 'Core coffee production activities'
        })

        const salesTask = await this.addTaskTemplate(templateId, {
          title: 'Customer Service',
          description: 'Serve customers, process orders, maintain service quality',
          category: 'sales',
          priority: 'high',
          estimatedDuration: 300,
          dependencies: [setupTask.id],
          note: 'Customer-facing sales activities'
        })

        void await this.addTaskTemplate(templateId, {
          title: 'Daily Closing',
          description: 'Clean equipment, count cash, secure premises',
          category: 'maintenance',
          priority: 'medium',
          estimatedDuration: 45,
          dependencies: [productionTask.id, salesTask.id],
          note: 'End-of-day closing procedures'
        })

      } else if (templateType === 'weekly') {
        // Weekly template goals
        void await this.addGoalTemplate(templateId, {
          title: 'Weekly Inventory Management',
          description: 'Maintain optimal inventory levels',
          defaultTargetValue: 95,
          unit: 'percentage',
          category: 'efficiency',
          priority: 'medium',
          note: 'Weekly inventory optimization goal'
        })

        // Weekly template tasks
        const inventoryTask = await this.addTaskTemplate(templateId, {
          title: 'Inventory Review',
          description: 'Review stock levels, identify reorder needs',
          category: 'inventory',
          priority: 'high',
          estimatedDuration: 60,
          dependencies: [],
          note: 'Weekly inventory assessment'
        })

        void await this.addTaskTemplate(templateId, {
          title: 'Weekly Planning',
          description: 'Plan production schedules and staff assignments',
          category: 'setup',
          priority: 'medium',
          estimatedDuration: 45,
          dependencies: [inventoryTask.id],
          note: 'Strategic weekly planning'
        })

      } else if (templateType === 'monthly') {
        // Monthly template goals
        void await this.addGoalTemplate(templateId, {
          title: 'Monthly Growth Target',
          description: 'Achieve monthly revenue growth',
          defaultTargetValue: 10,
          unit: 'percentage',
          category: 'sales',
          priority: 'high',
          note: 'Monthly business growth goal'
        })

        // Monthly template tasks
        void await this.addTaskTemplate(templateId, {
          title: 'Strategy Review',
          description: 'Review business performance and plan improvements',
          category: 'setup',
          priority: 'high',
          estimatedDuration: 120,
          dependencies: [],
          note: 'Monthly strategic planning'
        })

      } else if (templateType === 'operational') {
        // Operational template goals (for bakery/general operations)
        void await this.addGoalTemplate(templateId, {
          title: 'Operational Efficiency',
          description: 'Maintain high operational efficiency standards',
          defaultTargetValue: 90,
          unit: 'percentage',
          category: 'efficiency',
          priority: 'high',
          note: 'Monthly operational efficiency goal'
        })

        void await this.addGoalTemplate(templateId, {
          title: 'Quality Standards',
          description: 'Maintain product quality standards',
          defaultTargetValue: 95,
          unit: 'percentage',
          category: 'quality',
          priority: 'high',
          note: 'Quality assurance goal'
        })

        // Operational template tasks
        const planningTask = await this.addTaskTemplate(templateId, {
          title: 'Monthly Planning',
          description: 'Plan monthly operations, schedules, and resource allocation',
          category: 'setup',
          priority: 'high',
          estimatedDuration: 120,
          dependencies: [],
          note: 'Strategic monthly planning session'
        })

        const productionTask = await this.addTaskTemplate(templateId, {
          title: 'Production Review',
          description: 'Review production processes and optimize workflows',
          category: 'production',
          priority: 'high',
          estimatedDuration: 90,
          dependencies: [planningTask.id],
          note: 'Monthly production optimization'
        })

        void await this.addTaskTemplate(templateId, {
          title: 'Quality Assessment',
          description: 'Assess product quality and implement improvements',
          category: 'maintenance',
          priority: 'medium',
          estimatedDuration: 60,
          dependencies: [productionTask.id],
          note: 'Monthly quality review'
        })

      } else if (templateType === 'strategic') {
        // Strategic template goals
        void await this.addGoalTemplate(templateId, {
          title: 'Strategic Growth',
          description: 'Achieve strategic business growth targets',
          defaultTargetValue: 15,
          unit: 'percentage',
          category: 'sales',
          priority: 'high',
          note: 'Strategic growth objective'
        })

        // Strategic template tasks
        void await this.addTaskTemplate(templateId, {
          title: 'Market Analysis',
          description: 'Analyze market trends and competitive landscape',
          category: 'setup',
          priority: 'high',
          estimatedDuration: 180,
          dependencies: [],
          note: 'Strategic market research'
        })

        void await this.addTaskTemplate(templateId, {
          title: 'Strategic Planning',
          description: 'Develop long-term strategic plans and initiatives',
          category: 'setup',
          priority: 'high',
          estimatedDuration: 240,
          dependencies: [],
          note: 'Long-term strategic planning'
        })
      }

      // Verify goals and tasks were created
      const [createdGoals, createdTasks] = await Promise.all([
        this.getGoalTemplates(templateId),
        this.getTaskTemplates(templateId)
      ])

      console.log(`✅ Default goals and tasks created for ${templateType} template: ${createdGoals.length} goals, ${createdTasks.length} tasks`)
    } catch (error) {
      console.error(`❌ Failed to create default goals and tasks for ${templateType} template:`, error)
      throw error
    }
  }

  /**
   * Get goal templates for a specific template
   */
  static async getGoalTemplates(templateId: string): Promise<PlanGoalTemplate[]> {
    try {
      return await db.planGoalTemplates.where('templateId').equals(templateId).toArray()
    } catch (error) {
      console.error('PlanTemplateService.getGoalTemplates() - Database error:', error)
      throw error
    }
  }

  /**
   * Get task templates for a specific template
   */
  static async getTaskTemplates(templateId: string): Promise<PlanTaskTemplate[]> {
    try {
      return await db.planTaskTemplates.where('templateId').equals(templateId).toArray()
    } catch (error) {
      console.error('PlanTemplateService.getTaskTemplates() - Database error:', error)
      throw error
    }
  }

  /**
   * Get metric templates for a specific template
   */
  static async getMetricTemplates(templateId: string): Promise<PlanMetricTemplate[]> {
    try {
      return await db.planMetricTemplates.where('templateId').equals(templateId).toArray()
    } catch (error) {
      console.error('PlanTemplateService.getMetricTemplates() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete template and all related data
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      await Promise.all([
        db.planGoalTemplates.where('templateId').equals(templateId).delete(),
        db.planTaskTemplates.where('templateId').equals(templateId).delete(),
        db.planMetricTemplates.where('templateId').equals(templateId).delete(),
        db.planTemplates.delete(templateId)
      ])
    } catch (error) {
      console.error('PlanTemplateService.deleteTemplate() - Database error:', error)
      throw error
    }
  }
}
