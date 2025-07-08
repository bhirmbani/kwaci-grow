/**
 * Comprehensive diagnostic script for IDBKeyRange DataError
 * 
 * This script investigates the exact cause of the persistent IDBKeyRange error
 * during plan creation and template initialization.
 * 
 * Run this in the browser console on the /plan route
 */

console.log('🔍 Investigating IDBKeyRange DataError...')

async function checkDatabaseVersion() {
  console.log('\n📊 Checking Database Version and Migration Status...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('🔍 Current database version:', db.verno)
    console.log('🔍 Database name:', db.name)
    console.log('🔍 Database open state:', db.isOpen())
    
    // Check if database is properly initialized
    if (!db.isOpen()) {
      console.log('⚠️ Database is not open, attempting to open...')
      await db.open()
      console.log('✅ Database opened successfully')
    }
    
    return {
      version: db.verno,
      name: db.name,
      isOpen: db.isOpen()
    }
    
  } catch (error) {
    console.error('❌ Database version check failed:', error)
    throw error
  }
}

async function examineExistingTemplateData() {
  console.log('\n🔍 Examining Existing Template Data...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    // Get all records from planTemplates table
    console.log('📊 Fetching all planTemplates records...')
    const allTemplates = await db.planTemplates.toArray()
    console.log('📊 Total templates found:', allTemplates.length)
    
    if (allTemplates.length === 0) {
      console.log('ℹ️ No existing templates found - this is a clean database')
      return { templates: [], issues: [] }
    }
    
    // Analyze each template for data type issues
    const issues = []
    
    for (let i = 0; i < allTemplates.length; i++) {
      const template = allTemplates[i]
      console.log(`\n🔍 Analyzing template ${i + 1}:`, template.name || 'Unnamed')
      console.log('📋 Template data:', template)
      
      // Check isDefault field specifically
      if ('isDefault' in template) {
        const isDefaultType = typeof template.isDefault
        console.log(`🔍 isDefault field: ${template.isDefault} (type: ${isDefaultType})`)
        
        if (isDefaultType !== 'boolean') {
          issues.push({
            templateId: template.id,
            templateName: template.name,
            field: 'isDefault',
            currentValue: template.isDefault,
            currentType: isDefaultType,
            expectedType: 'boolean'
          })
          console.log(`⚠️ ISSUE: isDefault should be boolean, but is ${isDefaultType}`)
        }
      } else {
        issues.push({
          templateId: template.id,
          templateName: template.name,
          field: 'isDefault',
          currentValue: undefined,
          currentType: 'undefined',
          expectedType: 'boolean'
        })
        console.log('⚠️ ISSUE: isDefault field is missing')
      }
      
      // Check other critical fields
      const requiredFields = ['id', 'name', 'type', 'category', 'difficulty']
      for (const field of requiredFields) {
        if (!(field in template) || template[field] === undefined || template[field] === null) {
          issues.push({
            templateId: template.id,
            templateName: template.name,
            field: field,
            currentValue: template[field],
            currentType: typeof template[field],
            expectedType: 'string'
          })
          console.log(`⚠️ ISSUE: Required field '${field}' is missing or invalid`)
        }
      }
    }
    
    console.log('\n📊 Data Analysis Summary:')
    console.log('✅ Total templates:', allTemplates.length)
    console.log('⚠️ Total issues found:', issues.length)
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues found:')
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. Template "${issue.templateName}" - Field "${issue.field}": ${issue.currentValue} (${issue.currentType}) should be ${issue.expectedType}`)
      })
    }
    
    return { templates: allTemplates, issues }
    
  } catch (error) {
    console.error('❌ Template data examination failed:', error)
    throw error
  }
}

async function testFailingQuery() {
  console.log('\n🧪 Testing the Failing Query...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    // Test the exact query that's failing
    console.log('🔄 Testing: db.planTemplates.where("isDefault").equals(true)')
    
    try {
      const defaultTemplates = await db.planTemplates
        .where('isDefault')
        .equals(true)
        .toArray()
      
      console.log('✅ Query succeeded! Found templates:', defaultTemplates)
      return { success: true, templates: defaultTemplates }
      
    } catch (queryError) {
      console.error('❌ Query failed with error:', queryError)
      
      // Try alternative queries to isolate the issue
      console.log('\n🔄 Trying alternative queries...')
      
      // Test 1: Get all templates without filtering
      try {
        const allTemplates = await db.planTemplates.toArray()
        console.log('✅ Basic query works, total templates:', allTemplates.length)
        
        // Test 2: Filter manually
        const manualFilter = allTemplates.filter(t => t.isDefault === true)
        console.log('✅ Manual filter works, default templates:', manualFilter.length)
        
        return { 
          success: false, 
          error: queryError, 
          allTemplates: allTemplates.length,
          manualFilterResult: manualFilter.length 
        }
        
      } catch (basicError) {
        console.error('❌ Even basic query failed:', basicError)
        return { success: false, error: queryError, basicQueryFailed: true }
      }
    }
    
  } catch (error) {
    console.error('❌ Query test setup failed:', error)
    throw error
  }
}

async function attemptDataCleanup() {
  console.log('\n🧹 Attempting Data Cleanup...')
  
  try {
    const { db } = await import('./src/lib/db/index.js')
    
    // Get all templates
    const allTemplates = await db.planTemplates.toArray()
    console.log('📊 Found templates to clean:', allTemplates.length)
    
    if (allTemplates.length === 0) {
      console.log('ℹ️ No templates to clean')
      return { cleaned: 0 }
    }
    
    let cleanedCount = 0
    
    for (const template of allTemplates) {
      let needsUpdate = false
      const updates = {}
      
      // Fix isDefault field
      if (typeof template.isDefault !== 'boolean') {
        if (template.isDefault === 'true' || template.isDefault === true) {
          updates.isDefault = true
        } else {
          updates.isDefault = false
        }
        needsUpdate = true
        console.log(`🔧 Fixing isDefault for template "${template.name}": ${template.isDefault} → ${updates.isDefault}`)
      }
      
      // Add missing fields with defaults
      if (!template.description) {
        updates.description = template.name || 'Template description'
        needsUpdate = true
      }
      
      if (!template.estimatedDuration) {
        updates.estimatedDuration = 60 // Default 1 hour
        needsUpdate = true
      }
      
      if (!template.tags) {
        updates.tags = 'template'
        needsUpdate = true
      }
      
      if (needsUpdate) {
        console.log(`🔧 Updating template "${template.name}" with:`, updates)
        await db.planTemplates.update(template.id, updates)
        cleanedCount++
      }
    }
    
    console.log(`✅ Cleaned ${cleanedCount} templates`)
    return { cleaned: cleanedCount }
    
  } catch (error) {
    console.error('❌ Data cleanup failed:', error)
    throw error
  }
}

async function testAfterCleanup() {
  console.log('\n✅ Testing After Cleanup...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    // Test the failing method
    console.log('🔄 Testing getDefaultTemplates()...')
    const defaultTemplates = await PlanTemplateService.getDefaultTemplates()
    console.log('✅ getDefaultTemplates() succeeded:', defaultTemplates)
    
    // Test template initialization
    console.log('🔄 Testing initializeDefaultTemplates()...')
    await PlanTemplateService.initializeDefaultTemplates()
    console.log('✅ initializeDefaultTemplates() succeeded')
    
    return { success: true, defaultTemplates }
    
  } catch (error) {
    console.error('❌ Post-cleanup test failed:', error)
    return { success: false, error }
  }
}

// Main diagnostic function
async function runIDBKeyRangeDiagnostic() {
  console.log('🚀 Running IDBKeyRange DataError Diagnostic...')
  console.log('================================================')
  
  const results = {}
  
  try {
    // Step 1: Check database version
    results.database = await checkDatabaseVersion()
    console.log('')
    
    // Step 2: Examine existing data
    results.dataAnalysis = await examineExistingTemplateData()
    console.log('')
    
    // Step 3: Test the failing query
    results.queryTest = await testFailingQuery()
    console.log('')
    
    // Step 4: Attempt data cleanup if issues found
    if (results.dataAnalysis.issues.length > 0 || !results.queryTest.success) {
      results.cleanup = await attemptDataCleanup()
      console.log('')
      
      // Step 5: Test after cleanup
      results.postCleanupTest = await testAfterCleanup()
      console.log('')
    }
    
    console.log('🎉 Diagnostic completed!')
    console.log('📊 Complete results:', results)
    console.log('================================================')
    
    // Summary
    console.log('\n📋 Diagnostic Summary:')
    console.log(`✅ Database version: ${results.database.version}`)
    console.log(`📊 Templates found: ${results.dataAnalysis.templates.length}`)
    console.log(`⚠️ Issues found: ${results.dataAnalysis.issues.length}`)
    console.log(`🔧 Templates cleaned: ${results.cleanup?.cleaned || 0}`)
    console.log(`✅ Final test: ${results.postCleanupTest?.success ? 'PASSED' : 'FAILED'}`)
    
    if (results.postCleanupTest?.success) {
      console.log('\n🎯 IDBKeyRange error should now be resolved!')
    } else {
      console.log('\n🚨 IDBKeyRange error persists - additional investigation needed')
    }
    
    return results
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error)
    console.log('📊 Partial results:', results)
    console.log('================================================')
    return results
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.idbDiagnostic = {
    runIDBKeyRangeDiagnostic,
    checkDatabaseVersion,
    examineExistingTemplateData,
    testFailingQuery,
    attemptDataCleanup,
    testAfterCleanup
  }
  
  console.log(`
📋 IDBKeyRange Diagnostic Instructions:
=====================================

1. Open browser console on /plan route
2. Run: idbDiagnostic.runIDBKeyRangeDiagnostic()
3. Or run individual diagnostics:
   - idbDiagnostic.checkDatabaseVersion()
   - idbDiagnostic.examineExistingTemplateData()
   - idbDiagnostic.testFailingQuery()
   - idbDiagnostic.attemptDataCleanup()
   - idbDiagnostic.testAfterCleanup()

This will identify and fix the root cause of the IDBKeyRange error.
`)
}

console.log('✅ IDBKeyRange diagnostic script loaded. Use idbDiagnostic.runIDBKeyRangeDiagnostic() to start.')
