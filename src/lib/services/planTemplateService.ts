import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
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
      ...goalData,
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
      ...taskData,
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
   * Create plan from template
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
        createdAt: now,
        updatedAt: now,
      }

      await db.operationalPlans.add(newPlan)

      // Create goals from templates
      const goalPromises = goalTemplates.map(goalTemplate => 
        db.planGoals.add({
          id: uuidv4(),
          planId,
          title: goalTemplate.title,
          description: goalTemplate.description,
          targetValue: goalTemplate.defaultTargetValue,
          currentValue: 0,
          unit: goalTemplate.unit,
          category: goalTemplate.category,
          priority: goalTemplate.priority,
          completed: false,
          note: goalTemplate.note,
          createdAt: now,
          updatedAt: now,
        })
      )

      // Create tasks from templates
      const taskPromises = taskTemplates.map(taskTemplate => 
        db.planTasks.add({
          id: uuidv4(),
          planId,
          title: taskTemplate.title,
          description: taskTemplate.description,
          category: taskTemplate.category,
          priority: taskTemplate.priority,
          status: 'pending',
          estimatedDuration: taskTemplate.estimatedDuration,
          dependencies: taskTemplate.dependencies,
          note: taskTemplate.note,
          createdAt: now,
          updatedAt: now,
        })
      )

      // Create metrics from templates
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
          createdAt: now,
          updatedAt: now,
        })
      )

      await Promise.all([...goalPromises, ...taskPromises, ...metricPromises])

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

      const allTemplates = await db.planTemplates.toArray()
      console.log('📊 Retrieved all templates for filtering:', allTemplates.length)

      if (allTemplates.length === 0) {
        console.log('ℹ️ No templates found in database, initializing defaults...')
        await this.initializeDefaultTemplates()

        // Try again after initialization
        const newTemplates = await db.planTemplates.toArray()
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
        const isDefault = isDefaultValue === true || isDefaultValue === 'true'

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

          if (!template.tags || template.tags.trim() === '') {
            updates.tags = 'template'
            needsUpdate = true
            console.log(`🔧 Adding missing tags: "${updates.tags}"`)
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

      // Check if default templates already exist
      console.log('🔍 Step 2: Check for existing default templates...')
      try {
        const existingDefaults = await this.getDefaultTemplates()
        if (existingDefaults.length > 0) {
          console.log(`✅ Found ${existingDefaults.length} existing default templates, skipping initialization`)
          return // Already initialized
        }
        console.log('ℹ️ No existing default templates found, proceeding with initialization')
      } catch (checkError) {
        console.warn('⚠️ Failed to check existing templates, proceeding with initialization:', checkError)
      }

      const now = new Date().toISOString()

      // Daily Operations Template
      const dailyTemplate = {
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
      }

      // Weekly Planning Template
      const weeklyTemplate = {
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
      }

      // Monthly Strategy Template
      const monthlyTemplate = {
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
      }

      await Promise.all([
        db.planTemplates.add(dailyTemplate),
        db.planTemplates.add(weeklyTemplate),
        db.planTemplates.add(monthlyTemplate)
      ])

      console.log('✅ Default planning templates initialized successfully')
    } catch (error) {
      console.error('PlanTemplateService.initializeDefaultTemplates() - Error:', error)
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
