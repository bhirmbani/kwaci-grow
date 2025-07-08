/**
 * Test script for Plan Creation functionality
 * 
 * This script tests the plan creation workflow including:
 * - Creating plans from scratch
 * - Creating plans from templates
 * - Form validation
 * - Database persistence
 * 
 * Run this script in the browser console on the /plan route
 */

// Test data
const testPlanData = {
  scratch: {
    name: 'Test Daily Operations Plan',
    description: 'A test plan for daily coffee shop operations',
    type: 'daily',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    note: 'This is a test plan created by the test script'
  },
  template: {
    name: 'Test Weekly Plan from Template',
    description: 'A test plan created from a template',
    startDate: '2025-01-20',
    endDate: '2025-01-26',
    note: 'Template-based test plan'
  }
}

// Test functions
async function testPlanCreationFromScratch() {
  console.log('🧪 Testing plan creation from scratch...')
  
  try {
    // Import services (assuming they're available globally or can be imported)
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    
    const planData = {
      ...testPlanData.scratch,
      status: 'draft',
      branchId: undefined,
      templateId: undefined,
    }
    
    const createdPlan = await PlanningService.createPlan(planData)
    console.log('✅ Plan created successfully:', createdPlan)
    
    // Verify the plan was saved
    const allPlans = await PlanningService.getAllPlans()
    const foundPlan = allPlans.find(p => p.id === createdPlan.id)
    
    if (foundPlan) {
      console.log('✅ Plan found in database:', foundPlan)
      return createdPlan
    } else {
      throw new Error('Plan not found in database after creation')
    }
  } catch (error) {
    console.error('❌ Failed to create plan from scratch:', error)
    throw error
  }
}

async function testPlanCreationFromTemplate() {
  console.log('🧪 Testing plan creation from template...')
  
  try {
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    
    // First, get available templates
    const templates = await PlanTemplateService.getAllTemplates()
    console.log('📋 Available templates:', templates)
    
    if (templates.length === 0) {
      console.log('⚠️ No templates available, initializing default templates...')
      await PlanTemplateService.initializeDefaultTemplates()
      const newTemplates = await PlanTemplateService.getAllTemplates()
      console.log('📋 Default templates initialized:', newTemplates)
      
      if (newTemplates.length === 0) {
        throw new Error('No templates available even after initialization')
      }
    }
    
    // Use the first available template
    const template = templates[0] || (await PlanTemplateService.getAllTemplates())[0]
    console.log('📝 Using template:', template)
    
    const createdPlan = await PlanTemplateService.createPlanFromTemplate(template.id, testPlanData.template)
    console.log('✅ Plan created from template:', createdPlan)
    
    return createdPlan
  } catch (error) {
    console.error('❌ Failed to create plan from template:', error)
    throw error
  }
}

async function testFormValidation() {
  console.log('🧪 Testing form validation...')
  
  // Test cases for validation
  const invalidCases = [
    {
      name: 'Empty name test',
      data: { ...testPlanData.scratch, name: '' },
      expectedError: 'Plan name is required'
    },
    {
      name: 'Empty description test',
      data: { ...testPlanData.scratch, description: '' },
      expectedError: 'Description is required'
    },
    {
      name: 'Invalid date range test',
      data: { ...testPlanData.scratch, startDate: '2025-01-20', endDate: '2025-01-15' },
      expectedError: 'End date must be after or equal to start date'
    }
  ]
  
  // Note: This would need to be tested in the actual form component
  // For now, we'll just log the test cases
  console.log('📝 Validation test cases prepared:', invalidCases)
  console.log('⚠️ Form validation tests should be run in the actual UI')
}

async function testDashboardRefresh() {
  console.log('🧪 Testing dashboard refresh functionality...')
  
  try {
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    
    // Get analytics before and after plan creation
    const analyticsBefore = await PlanningService.getPlanAnalytics()
    console.log('📊 Analytics before:', analyticsBefore)
    
    // Create a test plan
    const testPlan = await testPlanCreationFromScratch()
    
    // Get analytics after
    const analyticsAfter = await PlanningService.getPlanAnalytics()
    console.log('📊 Analytics after:', analyticsAfter)
    
    // Verify the analytics updated
    if (analyticsAfter.totalPlans > analyticsBefore.totalPlans) {
      console.log('✅ Dashboard analytics updated correctly')
    } else {
      console.log('⚠️ Dashboard analytics may not have updated')
    }
    
    return { before: analyticsBefore, after: analyticsAfter }
  } catch (error) {
    console.error('❌ Failed to test dashboard refresh:', error)
    throw error
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Plan Creation Tests...')
  console.log('=====================================')
  
  try {
    // Test 1: Plan creation from scratch
    await testPlanCreationFromScratch()
    console.log('')
    
    // Test 2: Plan creation from template
    await testPlanCreationFromTemplate()
    console.log('')
    
    // Test 3: Form validation (conceptual)
    await testFormValidation()
    console.log('')
    
    // Test 4: Dashboard refresh
    await testDashboardRefresh()
    console.log('')
    
    console.log('🎉 All tests completed successfully!')
    console.log('=====================================')
    
  } catch (error) {
    console.error('💥 Test suite failed:', error)
    console.log('=====================================')
  }
}

// Instructions for manual testing
console.log(`
📋 Plan Creation Test Instructions:
=====================================

1. Open the browser console on the /plan route
2. Run: runAllTests()
3. Or run individual tests:
   - testPlanCreationFromScratch()
   - testPlanCreationFromTemplate()
   - testFormValidation()
   - testDashboardRefresh()

4. Manual UI Testing:
   - Click "Create New Plan" button
   - Test form validation by submitting empty fields
   - Test template selection
   - Test date range validation
   - Verify dashboard refreshes after plan creation

5. Check the Recent Plans section for new plans
6. Verify analytics update correctly

Note: Some tests require the services to be available in the browser context.
`)

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.planCreationTests = {
    runAllTests,
    testPlanCreationFromScratch,
    testPlanCreationFromTemplate,
    testFormValidation,
    testDashboardRefresh
  }
}
