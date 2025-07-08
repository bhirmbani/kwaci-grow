/**
 * Test script to verify IDBKeyRange error fix
 * 
 * Run this in the browser console on the /plan route
 */

console.log('🔧 Testing IDBKeyRange Error Fix...')

async function testDatabaseSchemaFix() {
  console.log('\n🗄️ Testing Database Schema Fix...')
  
  try {
    // Import services
    const { db } = await import('./src/lib/db/index.js')
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    console.log('✅ Services imported successfully')
    console.log('🔍 Database version:', db.verno)
    
    // Clear existing templates to test fresh creation
    console.log('🧹 Clearing existing templates...')
    await db.planTemplates.clear()
    
    // Test template creation with new schema
    console.log('🔄 Testing template creation with fixed schema...')
    
    const testTemplate = {
      id: 'test-template-id',
      name: 'Test Template',
      description: 'A test template to verify schema fix',
      type: 'daily',
      category: 'operations',
      isDefault: false,
      estimatedDuration: 60,
      difficulty: 'beginner',
      tags: 'test,schema,fix', // String instead of array
      note: 'Test template for schema verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    console.log('📝 Creating test template:', testTemplate)
    await db.planTemplates.add(testTemplate)
    console.log('✅ Template created successfully!')
    
    // Verify template was saved
    const savedTemplate = await db.planTemplates.get('test-template-id')
    console.log('🔍 Saved template:', savedTemplate)
    
    if (!savedTemplate) {
      throw new Error('Template was not saved!')
    }
    
    console.log('✅ Template schema fix working correctly!')
    return savedTemplate
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error)
    throw error
  }
}

async function testTemplateServiceFix() {
  console.log('\n📋 Testing Template Service Fix...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Clear existing templates
    console.log('🧹 Clearing existing templates...')
    await db.planTemplates.clear()
    
    // Test default template initialization
    console.log('🔄 Testing default template initialization...')
    await PlanTemplateService.initializeDefaultTemplates()
    
    // Check if templates were created
    const templates = await db.planTemplates.toArray()
    console.log('📊 Created templates:', templates)
    
    if (templates.length === 0) {
      throw new Error('No templates were created!')
    }
    
    // Verify each template has correct structure
    for (const template of templates) {
      console.log('🔍 Verifying template:', template.name)
      
      // Check required fields
      const requiredFields = ['id', 'name', 'description', 'type', 'category', 'isDefault', 'estimatedDuration', 'difficulty', 'tags', 'note', 'createdAt', 'updatedAt']
      for (const field of requiredFields) {
        if (!(field in template)) {
          throw new Error(`Template missing required field: ${field}`)
        }
      }
      
      // Check that tags is a string
      if (typeof template.tags !== 'string') {
        throw new Error(`Template tags should be string, got: ${typeof template.tags}`)
      }
      
      console.log('✅ Template structure valid:', template.name)
    }
    
    console.log('✅ Template service fix working correctly!')
    return templates
    
  } catch (error) {
    console.error('❌ Template service fix failed:', error)
    throw error
  }
}

async function testPlanCreationFix() {
  console.log('\n📝 Testing Plan Creation Fix...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    // Ensure templates exist
    const templates = await db.planTemplates.toArray()
    if (templates.length === 0) {
      console.log('🔄 Initializing templates first...')
      await PlanTemplateService.initializeDefaultTemplates()
    }
    
    // Clear existing plans
    console.log('🧹 Clearing existing plans...')
    await db.operationalPlans.clear()
    
    // Test plan creation from scratch
    const testPlanData = {
      name: 'Test Plan - IDB Fix',
      description: 'A test plan to verify IDB fix',
      type: 'daily',
      status: 'draft',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      branchId: undefined,
      templateId: undefined,
      note: 'Test plan after IDB fix'
    }
    
    console.log('🔄 Creating test plan from scratch:', testPlanData)
    const createdPlan = await PlanningService.createPlan(testPlanData)
    console.log('✅ Plan created successfully:', createdPlan)
    
    // Test template-based plan creation
    const availableTemplates = await db.planTemplates.toArray()
    if (availableTemplates.length > 0) {
      const template = availableTemplates[0]
      console.log('🔄 Creating plan from template:', template.name)
      
      const templatePlanData = {
        name: 'Template Test Plan - IDB Fix',
        description: 'A test plan from template to verify IDB fix',
        startDate: '2025-01-20',
        endDate: '2025-01-20',
        branchId: undefined,
        note: 'Template-based test plan after IDB fix'
      }
      
      const templatePlan = await PlanTemplateService.createPlanFromTemplate(template.id, templatePlanData)
      console.log('✅ Template plan created successfully:', templatePlan)
    }
    
    // Verify plans were saved
    const savedPlans = await db.operationalPlans.toArray()
    console.log('📊 Saved plans:', savedPlans)
    
    if (savedPlans.length === 0) {
      throw new Error('No plans were saved!')
    }
    
    console.log('✅ Plan creation fix working correctly!')
    return savedPlans
    
  } catch (error) {
    console.error('❌ Plan creation fix failed:', error)
    throw error
  }
}

// Main test function
async function runIDBFixTests() {
  console.log('🚀 Running IDBKeyRange Fix Tests...')
  console.log('=====================================')
  
  const results = {}
  
  try {
    // Test 1: Database schema fix
    results.schema = await testDatabaseSchemaFix()
    console.log('')
    
    // Test 2: Template service fix
    results.templates = await testTemplateServiceFix()
    console.log('')
    
    // Test 3: Plan creation fix
    results.plans = await testPlanCreationFix()
    console.log('')
    
    console.log('🎉 All IDBKeyRange fix tests passed!')
    console.log('📊 Complete results:', results)
    console.log('=====================================')
    
    // Summary
    console.log('\n📋 Fix Summary:')
    console.log('✅ Database schema now includes all required fields')
    console.log('✅ Templates store tags as strings instead of arrays')
    console.log('✅ Plan creation no longer causes IDBKeyRange errors')
    console.log('✅ Both scratch and template-based plan creation work')
    console.log('\n🎯 IDBKeyRange error should now be completely resolved!')
    
    return results
    
  } catch (error) {
    console.error('💥 IDBKeyRange fix tests failed:', error)
    console.log('📊 Partial results:', results)
    console.log('=====================================')
    return results
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.idbFixTests = {
    runIDBFixTests,
    testDatabaseSchemaFix,
    testTemplateServiceFix,
    testPlanCreationFix
  }
  
  console.log(`
📋 IDBKeyRange Fix Test Instructions:
=====================================

1. Open browser console on /plan route
2. Run: idbFixTests.runIDBFixTests()
3. Or run individual tests:
   - idbFixTests.testDatabaseSchemaFix()
   - idbFixTests.testTemplateServiceFix()
   - idbFixTests.testPlanCreationFix()

This will verify that the IDBKeyRange error is completely fixed.
`)
}

console.log('✅ IDB fix test script loaded. Use idbFixTests.runIDBFixTests() to start.')
