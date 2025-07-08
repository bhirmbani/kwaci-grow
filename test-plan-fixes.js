/**
 * Test script to verify Plan Creation fixes
 * 
 * Run this in the browser console on the /plan route
 */

console.log('🔧 Testing Plan Creation Fixes...')

async function testTemplateFixes() {
  console.log('\n📋 Testing Template Fixes...')
  
  try {
    // Import services
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Services imported successfully')
    
    // Clear existing templates for clean test
    console.log('🧹 Clearing existing templates...')
    await db.planTemplates.clear()
    
    // Test template initialization
    console.log('🔄 Initializing default templates...')
    await PlanTemplateService.initializeDefaultTemplates()
    
    // Check if templates were created
    const templates = await db.planTemplates.toArray()
    console.log('📊 Created templates:', templates)
    
    if (templates.length === 0) {
      throw new Error('No templates were created!')
    }
    
    // Test getAllTemplates
    const allTemplates = await PlanTemplateService.getAllTemplates()
    console.log('📊 Templates via service:', allTemplates)
    
    // Test getDefaultTemplates
    const defaultTemplates = await PlanTemplateService.getDefaultTemplates()
    console.log('📊 Default templates:', defaultTemplates)
    
    console.log('✅ Template fixes working correctly!')
    return { templates, allTemplates, defaultTemplates }
    
  } catch (error) {
    console.error('❌ Template fixes failed:', error)
    throw error
  }
}

async function testPlanCreationFixes() {
  console.log('\n📝 Testing Plan Creation Fixes...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Clear existing plans for clean test
    console.log('🧹 Clearing existing plans...')
    await db.operationalPlans.clear()
    
    // Test plan creation from scratch
    const testPlanData = {
      name: 'Test Plan - Fixed',
      description: 'A test plan to verify fixes',
      type: 'daily',
      status: 'draft',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      branchId: undefined,
      templateId: undefined,
      note: 'Test plan after fixes'
    }
    
    console.log('🔄 Creating test plan:', testPlanData)
    const createdPlan = await PlanningService.createPlan(testPlanData)
    console.log('✅ Plan created:', createdPlan)
    
    // Verify plan was saved
    const savedPlans = await db.operationalPlans.toArray()
    console.log('📊 Saved plans:', savedPlans)
    
    if (savedPlans.length === 0) {
      throw new Error('Plan was not saved to database!')
    }
    
    // Test getAllPlans
    const allPlans = await PlanningService.getAllPlans()
    console.log('📊 Plans via service:', allPlans)
    
    console.log('✅ Plan creation fixes working correctly!')
    return { createdPlan, savedPlans, allPlans }
    
  } catch (error) {
    console.error('❌ Plan creation fixes failed:', error)
    throw error
  }
}

async function testTemplateBasedPlanCreation() {
  console.log('\n📋 Testing Template-Based Plan Creation...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Get available templates
    const templates = await PlanTemplateService.getAllTemplates()
    console.log('📊 Available templates:', templates)
    
    if (templates.length === 0) {
      throw new Error('No templates available for testing!')
    }
    
    // Use the first template
    const template = templates[0]
    console.log('📝 Using template:', template)
    
    const testPlanData = {
      name: 'Template Test Plan - Fixed',
      description: 'A test plan created from template after fixes',
      startDate: '2025-01-20',
      endDate: '2025-01-20',
      branchId: undefined,
      note: 'Template-based test plan after fixes'
    }
    
    console.log('🔄 Creating plan from template:', testPlanData)
    const createdPlan = await PlanTemplateService.createPlanFromTemplate(template.id, testPlanData)
    console.log('✅ Template plan created:', createdPlan)
    
    // Verify plan was saved
    const foundPlan = await db.operationalPlans.get(createdPlan.id)
    console.log('🔍 Found template plan:', foundPlan)
    
    if (!foundPlan) {
      throw new Error('Template-based plan was not saved to database!')
    }
    
    console.log('✅ Template-based plan creation working correctly!')
    return { template, createdPlan, foundPlan }
    
  } catch (error) {
    console.error('❌ Template-based plan creation failed:', error)
    throw error
  }
}

async function testDashboardRefresh() {
  console.log('\n📊 Testing Dashboard Refresh...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    // Test analytics
    const analytics = await PlanningService.getPlanAnalytics()
    console.log('📊 Analytics:', analytics)
    
    // Test template loading
    const templates = await PlanTemplateService.getDefaultTemplates()
    console.log('📊 Templates for dashboard:', templates)
    
    // Test plan loading
    const plans = await PlanningService.getAllPlans()
    console.log('📊 Plans for dashboard:', plans)
    
    console.log('✅ Dashboard refresh working correctly!')
    return { analytics, templates, plans }
    
  } catch (error) {
    console.error('❌ Dashboard refresh failed:', error)
    throw error
  }
}

// Main test function
async function runFixTests() {
  console.log('🚀 Running Plan Creation Fix Tests...')
  console.log('=====================================')
  
  const results = {}
  
  try {
    // Test 1: Template fixes
    results.templates = await testTemplateFixes()
    console.log('')
    
    // Test 2: Plan creation fixes
    results.plans = await testPlanCreationFixes()
    console.log('')
    
    // Test 3: Template-based plan creation
    results.templatePlans = await testTemplateBasedPlanCreation()
    console.log('')
    
    // Test 4: Dashboard refresh
    results.dashboard = await testDashboardRefresh()
    console.log('')
    
    console.log('🎉 All fix tests passed!')
    console.log('📊 Complete results:', results)
    console.log('=====================================')
    
    // Summary
    console.log('\n📋 Fix Summary:')
    console.log('✅ Templates are now being created and loaded correctly')
    console.log('✅ Plans are being saved to database correctly')
    console.log('✅ Template-based plan creation is working')
    console.log('✅ Dashboard refresh functionality is working')
    console.log('\n🎯 Both issues should now be resolved!')
    
    return results
    
  } catch (error) {
    console.error('💥 Fix tests failed:', error)
    console.log('📊 Partial results:', results)
    console.log('=====================================')
    return results
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.planFixTests = {
    runFixTests,
    testTemplateFixes,
    testPlanCreationFixes,
    testTemplateBasedPlanCreation,
    testDashboardRefresh
  }
  
  console.log(`
📋 Plan Creation Fix Test Instructions:
=====================================

1. Open browser console on /plan route
2. Run: planFixTests.runFixTests()
3. Or run individual tests:
   - planFixTests.testTemplateFixes()
   - planFixTests.testPlanCreationFixes()
   - planFixTests.testTemplateBasedPlanCreation()
   - planFixTests.testDashboardRefresh()

This will verify that both issues are now fixed.
`)
}

console.log('✅ Fix test script loaded. Use planFixTests.runFixTests() to start.')
