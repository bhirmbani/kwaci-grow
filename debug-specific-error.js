/**
 * Specific diagnostic for the persistent IDBKeyRange error
 * 
 * This script tests the exact failing scenario to understand why
 * our fallback mechanism isn't working.
 * 
 * Run this in the browser console on the /plan route
 */

console.log('🔍 Debugging Specific IDBKeyRange Error...')

async function testExactFailingScenario() {
  console.log('\n🧪 Testing Exact Failing Scenario...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Database imported successfully')
    console.log('🔍 Database version:', db.verno)
    console.log('🔍 Database open:', db.isOpen())
    
    // Test 1: Direct query that should fail
    console.log('\n🔄 Testing direct query: db.planTemplates.where("isDefault").equals(true).toArray()')
    
    try {
      const directResult = await db.planTemplates
        .where('isDefault')
        .equals(true)
        .toArray()
      
      console.log('✅ Direct query succeeded unexpectedly:', directResult)
      return { directQuerySuccess: true, result: directResult }
      
    } catch (directError) {
      console.log('❌ Direct query failed as expected:', directError)
      
      // Test 2: Fallback query
      console.log('\n🔄 Testing fallback: db.planTemplates.toArray() + manual filter')
      
      try {
        const allTemplates = await db.planTemplates.toArray()
        console.log('✅ Got all templates:', allTemplates.length)
        
        const filteredTemplates = allTemplates.filter(template => {
          console.log(`🔍 Checking template "${template.name}": isDefault = ${template.isDefault} (${typeof template.isDefault})`)
          return template.isDefault === true || template.isDefault === 'true'
        })
        
        console.log('✅ Fallback succeeded:', filteredTemplates)
        return { 
          directQuerySuccess: false, 
          directError: directError,
          fallbackSuccess: true, 
          allTemplates: allTemplates.length,
          filteredTemplates: filteredTemplates.length,
          templates: filteredTemplates
        }
        
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError)
        return { 
          directQuerySuccess: false, 
          directError: directError,
          fallbackSuccess: false, 
          fallbackError: fallbackError
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error)
    throw error
  }
}

async function testServiceMethod() {
  console.log('\n🧪 Testing Service Method Directly...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    console.log('🔄 Calling PlanTemplateService.getDefaultTemplates()...')
    
    const result = await PlanTemplateService.getDefaultTemplates()
    console.log('✅ Service method succeeded:', result)
    
    return { success: true, result }
    
  } catch (error) {
    console.error('❌ Service method failed:', error)
    return { success: false, error }
  }
}

async function examineTemplateData() {
  console.log('\n🔍 Examining Template Data in Detail...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    const allTemplates = await db.planTemplates.toArray()
    console.log('📊 Total templates:', allTemplates.length)
    
    if (allTemplates.length === 0) {
      console.log('ℹ️ No templates found - empty database')
      return { templates: [], issues: [] }
    }
    
    const issues = []
    
    allTemplates.forEach((template, index) => {
      console.log(`\n📋 Template ${index + 1}: "${template.name || 'Unnamed'}"`)
      console.log('🔍 Full template data:', template)
      
      // Check each field
      Object.keys(template).forEach(key => {
        const value = template[key]
        const type = typeof value
        console.log(`  ${key}: ${value} (${type})`)
        
        if (key === 'isDefault') {
          if (type !== 'boolean') {
            issues.push({
              templateId: template.id,
              templateName: template.name,
              field: key,
              value: value,
              type: type,
              issue: 'Should be boolean'
            })
          }
        }
        
        if (value === null || value === undefined) {
          issues.push({
            templateId: template.id,
            templateName: template.name,
            field: key,
            value: value,
            type: type,
            issue: 'Null/undefined value'
          })
        }
      })
    })
    
    console.log('\n📊 Issues found:', issues)
    return { templates: allTemplates, issues }
    
  } catch (error) {
    console.error('❌ Data examination failed:', error)
    throw error
  }
}

async function testCleanupMethod() {
  console.log('\n🧹 Testing Cleanup Method...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    console.log('🔄 Calling PlanTemplateService.cleanupTemplateData()...')
    
    const cleanedCount = await PlanTemplateService.cleanupTemplateData()
    console.log('✅ Cleanup succeeded, cleaned:', cleanedCount)
    
    return { success: true, cleanedCount }
    
  } catch (error) {
    console.error('❌ Cleanup method failed:', error)
    return { success: false, error }
  }
}

async function testDashboardLoad() {
  console.log('\n📊 Testing Dashboard Load Scenario...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    
    console.log('🔄 Step 1: Initialize default templates...')
    await PlanTemplateService.initializeDefaultTemplates()
    console.log('✅ Template initialization completed')
    
    console.log('🔄 Step 2: Get analytics...')
    const analytics = await PlanningService.getPlanAnalytics()
    console.log('✅ Analytics loaded:', analytics)
    
    console.log('🔄 Step 3: Get default templates...')
    const templates = await PlanTemplateService.getDefaultTemplates()
    console.log('✅ Templates loaded:', templates)
    
    console.log('🔄 Step 4: Get all plans...')
    const plans = await PlanningService.getAllPlans()
    console.log('✅ Plans loaded:', plans)
    
    return { 
      success: true, 
      analytics, 
      templates: templates.length, 
      plans: plans.length 
    }
    
  } catch (error) {
    console.error('❌ Dashboard load simulation failed:', error)
    return { success: false, error }
  }
}

// Main diagnostic function
async function runSpecificErrorDiagnostic() {
  console.log('🚀 Running Specific IDBKeyRange Error Diagnostic...')
  console.log('===================================================')
  
  const results = {}
  
  try {
    // Test 1: Examine current data
    results.dataExamination = await examineTemplateData()
    console.log('')
    
    // Test 2: Test exact failing scenario
    results.exactScenario = await testExactFailingScenario()
    console.log('')
    
    // Test 3: Test service method directly
    results.serviceMethod = await testServiceMethod()
    console.log('')
    
    // Test 4: Test cleanup method
    results.cleanup = await testCleanupMethod()
    console.log('')
    
    // Test 5: Test full dashboard load
    results.dashboardLoad = await testDashboardLoad()
    console.log('')
    
    console.log('🎉 Specific diagnostic completed!')
    console.log('📊 Complete results:', results)
    console.log('===================================================')
    
    // Analysis
    console.log('\n📋 Analysis:')
    console.log(`📊 Templates found: ${results.dataExamination.templates.length}`)
    console.log(`⚠️ Data issues: ${results.dataExamination.issues.length}`)
    console.log(`✅ Direct query: ${results.exactScenario.directQuerySuccess ? 'SUCCESS' : 'FAILED'}`)
    console.log(`✅ Fallback query: ${results.exactScenario.fallbackSuccess ? 'SUCCESS' : 'FAILED'}`)
    console.log(`✅ Service method: ${results.serviceMethod.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`✅ Cleanup method: ${results.cleanup.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`✅ Dashboard load: ${results.dashboardLoad.success ? 'SUCCESS' : 'FAILED'}`)
    
    if (results.serviceMethod.success && results.dashboardLoad.success) {
      console.log('\n🎯 Error appears to be resolved!')
    } else {
      console.log('\n🚨 Error persists - need additional investigation')
      
      if (results.dataExamination.issues.length > 0) {
        console.log('\n🔧 Recommended actions:')
        console.log('1. Run cleanup to fix data type issues')
        console.log('2. Clear planTemplates table if corruption is severe')
        console.log('3. Reinitialize with clean data')
      }
    }
    
    return results
    
  } catch (error) {
    console.error('💥 Specific diagnostic failed:', error)
    console.log('📊 Partial results:', results)
    console.log('===================================================')
    return results
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.specificErrorDebug = {
    runSpecificErrorDiagnostic,
    testExactFailingScenario,
    testServiceMethod,
    examineTemplateData,
    testCleanupMethod,
    testDashboardLoad
  }
  
  console.log(`
📋 Specific Error Debug Instructions:
===================================

1. Open browser console on /plan route
2. Run: specificErrorDebug.runSpecificErrorDiagnostic()
3. Or run individual tests:
   - specificErrorDebug.testExactFailingScenario()
   - specificErrorDebug.testServiceMethod()
   - specificErrorDebug.examineTemplateData()
   - specificErrorDebug.testCleanupMethod()
   - specificErrorDebug.testDashboardLoad()

This will identify exactly why the fallback isn't working.
`)
}

console.log('✅ Specific error diagnostic script loaded. Use specificErrorDebug.runSpecificErrorDiagnostic() to start.')
