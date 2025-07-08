/**
 * Debug script for Plan Creation Issues
 * 
 * This script investigates:
 * 1. Template availability issue
 * 2. Plan persistence issue
 * 
 * Run this in the browser console on the /plan route
 */

console.log('🔍 Starting Plan Creation Debug...')

// Test 1: Check template initialization
async function debugTemplateInitialization() {
  console.log('\n📋 Testing Template Initialization...')
  
  try {
    // Import services
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Services imported successfully')
    
    // Check current templates in database
    console.log('🔍 Checking existing templates...')
    const existingTemplates = await db.planTemplates.toArray()
    console.log('📊 Existing templates:', existingTemplates)
    
    // Check default templates specifically
    const defaultTemplates = await PlanTemplateService.getDefaultTemplates()
    console.log('📊 Default templates:', defaultTemplates)
    
    // Try to initialize templates
    console.log('🔄 Attempting to initialize default templates...')
    await PlanTemplateService.initializeDefaultTemplates()
    
    // Check templates after initialization
    const templatesAfterInit = await db.planTemplates.toArray()
    console.log('📊 Templates after initialization:', templatesAfterInit)
    
    // Test getAllTemplates method
    const allTemplates = await PlanTemplateService.getAllTemplates()
    console.log('📊 All templates via service:', allTemplates)
    
    return {
      existing: existingTemplates,
      defaults: defaultTemplates,
      afterInit: templatesAfterInit,
      all: allTemplates
    }
    
  } catch (error) {
    console.error('❌ Template initialization failed:', error)
    throw error
  }
}

// Test 2: Check plan creation from scratch
async function debugPlanCreationFromScratch() {
  console.log('\n📝 Testing Plan Creation from Scratch...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Check existing plans
    const existingPlans = await db.operationalPlans.toArray()
    console.log('📊 Existing plans:', existingPlans)
    
    // Create a test plan
    const testPlanData = {
      name: 'Debug Test Plan',
      description: 'A test plan created by the debug script',
      type: 'daily',
      status: 'draft',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      branchId: undefined,
      templateId: undefined,
      note: 'Debug test plan'
    }
    
    console.log('🔄 Creating test plan:', testPlanData)
    const createdPlan = await PlanningService.createPlan(testPlanData)
    console.log('✅ Plan created:', createdPlan)
    
    // Verify plan was saved
    const plansAfterCreation = await db.operationalPlans.toArray()
    console.log('📊 Plans after creation:', plansAfterCreation)
    
    // Check if the specific plan exists
    const foundPlan = await db.operationalPlans.get(createdPlan.id)
    console.log('🔍 Found created plan:', foundPlan)
    
    return {
      existing: existingPlans,
      created: createdPlan,
      afterCreation: plansAfterCreation,
      found: foundPlan
    }
    
  } catch (error) {
    console.error('❌ Plan creation from scratch failed:', error)
    throw error
  }
}

// Test 3: Check plan creation from template
async function debugPlanCreationFromTemplate() {
  console.log('\n📋 Testing Plan Creation from Template...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Get available templates
    const templates = await PlanTemplateService.getAllTemplates()
    console.log('📊 Available templates:', templates)
    
    if (templates.length === 0) {
      console.log('⚠️ No templates available, cannot test template creation')
      return { error: 'No templates available' }
    }
    
    // Use the first template
    const template = templates[0]
    console.log('📝 Using template:', template)
    
    const testPlanData = {
      name: 'Debug Template Plan',
      description: 'A test plan created from template by debug script',
      startDate: '2025-01-20',
      endDate: '2025-01-20',
      branchId: undefined,
      note: 'Debug template test plan'
    }
    
    console.log('🔄 Creating plan from template:', testPlanData)
    const createdPlan = await PlanTemplateService.createPlanFromTemplate(template.id, testPlanData)
    console.log('✅ Plan created from template:', createdPlan)
    
    // Verify plan was saved
    const foundPlan = await db.operationalPlans.get(createdPlan.id)
    console.log('🔍 Found template-created plan:', foundPlan)
    
    return {
      template: template,
      created: createdPlan,
      found: foundPlan
    }
    
  } catch (error) {
    console.error('❌ Plan creation from template failed:', error)
    throw error
  }
}

// Test 4: Check dashboard data loading
async function debugDashboardDataLoading() {
  console.log('\n📊 Testing Dashboard Data Loading...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    // Test analytics loading
    console.log('🔄 Loading analytics...')
    const analytics = await PlanningService.getPlanAnalytics()
    console.log('📊 Analytics:', analytics)
    
    // Test template loading
    console.log('🔄 Loading templates...')
    const templates = await PlanTemplateService.getDefaultTemplates()
    console.log('📊 Templates:', templates)
    
    // Test plans loading
    console.log('🔄 Loading plans...')
    const plans = await PlanningService.getAllPlans()
    console.log('📊 Plans:', plans)
    
    return {
      analytics: analytics,
      templates: templates,
      plans: plans
    }
    
  } catch (error) {
    console.error('❌ Dashboard data loading failed:', error)
    throw error
  }
}

// Test 5: Check database table structure
async function debugDatabaseStructure() {
  console.log('\n🗄️ Testing Database Structure...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    // Check if tables exist
    const tables = [
      'planTemplates',
      'operationalPlans',
      'planGoals',
      'planTasks',
      'planMetrics',
      'planGoalTemplates',
      'planTaskTemplates',
      'planMetricTemplates'
    ]
    
    const tableInfo = {}
    
    for (const tableName of tables) {
      try {
        const table = db[tableName]
        if (table) {
          const count = await table.count()
          const sample = await table.limit(1).toArray()
          tableInfo[tableName] = {
            exists: true,
            count: count,
            sample: sample[0] || null
          }
        } else {
          tableInfo[tableName] = { exists: false }
        }
      } catch (error) {
        tableInfo[tableName] = { exists: false, error: error.message }
      }
    }
    
    console.log('📊 Database table info:', tableInfo)
    
    // Check database version
    console.log('🔍 Database version:', db.verno)
    
    return tableInfo
    
  } catch (error) {
    console.error('❌ Database structure check failed:', error)
    throw error
  }
}

// Main debug function
async function runAllDebugTests() {
  console.log('🚀 Running All Debug Tests...')
  console.log('=====================================')
  
  const results = {}
  
  try {
    // Test 1: Database structure
    results.database = await debugDatabaseStructure()
    console.log('')
    
    // Test 2: Template initialization
    results.templates = await debugTemplateInitialization()
    console.log('')
    
    // Test 3: Dashboard data loading
    results.dashboard = await debugDashboardDataLoading()
    console.log('')
    
    // Test 4: Plan creation from scratch
    results.scratchPlan = await debugPlanCreationFromScratch()
    console.log('')
    
    // Test 5: Plan creation from template
    results.templatePlan = await debugPlanCreationFromTemplate()
    console.log('')
    
    console.log('🎉 All debug tests completed!')
    console.log('📊 Complete results:', results)
    console.log('=====================================')
    
    return results
    
  } catch (error) {
    console.error('💥 Debug tests failed:', error)
    console.log('📊 Partial results:', results)
    console.log('=====================================')
    return results
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.planDebug = {
    runAllDebugTests,
    debugTemplateInitialization,
    debugPlanCreationFromScratch,
    debugPlanCreationFromTemplate,
    debugDashboardDataLoading,
    debugDatabaseStructure
  }
  
  console.log(`
📋 Plan Creation Debug Instructions:
=====================================

1. Open browser console on /plan route
2. Run: planDebug.runAllDebugTests()
3. Or run individual tests:
   - planDebug.debugDatabaseStructure()
   - planDebug.debugTemplateInitialization()
   - planDebug.debugDashboardDataLoading()
   - planDebug.debugPlanCreationFromScratch()
   - planDebug.debugPlanCreationFromTemplate()

This will help identify the root cause of both issues.
`)
}

console.log('✅ Debug script loaded. Use planDebug.runAllDebugTests() to start.')
