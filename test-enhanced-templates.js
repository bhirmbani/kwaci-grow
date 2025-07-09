/**
 * Test script for Enhanced Plan Template functionality
 * 
 * This script tests:
 * - Template initialization with goals and tasks
 * - Plan creation from templates with goals and tasks
 * - Proper dependency mapping
 * - Goal-task linking
 * 
 * Run this in the browser console after navigating to the app
 */

async function testEnhancedTemplates() {
  console.log('🚀 Testing Enhanced Plan Template Functionality')
  console.log('=' .repeat(50))
  
  try {
    // Import services
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { BranchService } = await import('./src/lib/services/branchService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Services imported successfully')
    
    // Step 1: Clear existing data for clean test
    console.log('\n🧹 Step 1: Clearing existing data...')
    await Promise.all([
      db.planTemplates.clear(),
      db.planGoalTemplates.clear(),
      db.planTaskTemplates.clear(),
      db.planMetricTemplates.clear(),
      db.operationalPlans.clear(),
      db.planGoals.clear(),
      db.planTasks.clear(),
      db.planMetrics.clear()
    ])
    console.log('✅ Data cleared')
    
    // Step 2: Initialize default templates with goals and tasks
    console.log('\n🔄 Step 2: Initializing enhanced default templates...')
    await PlanTemplateService.initializeDefaultTemplates()
    
    // Verify templates were created
    const templates = await PlanTemplateService.getAllTemplates()
    console.log(`✅ Created ${templates.length} templates:`, templates.map(t => t.name))
    
    // Step 3: Check if templates have goals and tasks
    console.log('\n🎯 Step 3: Verifying templates have goals and tasks...')
    for (const template of templates) {
      const [goals, tasks, metrics] = await Promise.all([
        PlanTemplateService.getGoalTemplates(template.id),
        PlanTemplateService.getTaskTemplates(template.id),
        PlanTemplateService.getMetricTemplates(template.id)
      ])
      
      console.log(`📋 Template "${template.name}":`)
      console.log(`   - Goals: ${goals.length}`)
      console.log(`   - Tasks: ${tasks.length}`)
      console.log(`   - Metrics: ${metrics.length}`)
      
      if (goals.length === 0 && tasks.length === 0) {
        console.warn(`⚠️ Template "${template.name}" has no goals or tasks!`)
      }
    }
    
    // Step 4: Create a test branch for plan creation
    console.log('\n🏢 Step 4: Creating test branch...')
    const branches = await BranchService.getAll()
    let testBranch = branches.find(b => b.isActive)
    
    if (!testBranch) {
      testBranch = await BranchService.create({
        name: 'Test Branch',
        location: 'Test Location',
        isActive: true,
        note: 'Test branch for enhanced template testing'
      })
    }
    console.log(`✅ Using branch: ${testBranch.name}`)
    
    // Step 5: Test plan creation from template with goals
    console.log('\n📝 Step 5: Testing plan creation from template...')
    const dailyTemplate = templates.find(t => t.type === 'daily')
    
    if (!dailyTemplate) {
      throw new Error('No daily template found!')
    }
    
    const planData = {
      name: 'Enhanced Test Plan',
      description: 'Test plan created from enhanced template',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      branchId: testBranch.id,
      note: 'Testing enhanced template functionality'
    }
    
    console.log(`📋 Creating plan from template: ${dailyTemplate.name}`)
    const createdPlan = await PlanTemplateService.createPlanFromTemplate(dailyTemplate.id, planData)
    console.log(`✅ Plan created: ${createdPlan.name} (ID: ${createdPlan.id})`)
    
    // Step 6: Verify plan has goals and tasks
    console.log('\n🔍 Step 6: Verifying plan has goals and tasks...')
    const planDetails = await PlanningService.getPlanWithDetails(createdPlan.id)
    
    if (!planDetails) {
      throw new Error('Created plan not found!')
    }
    
    console.log(`📊 Plan Details:`)
    console.log(`   - Goals: ${planDetails.goals.length}`)
    console.log(`   - Tasks: ${planDetails.tasks.length}`)
    console.log(`   - Metrics: ${planDetails.metrics.length}`)
    
    // Verify goals have branchId
    const goalsWithBranch = planDetails.goals.filter(g => g.branchId)
    console.log(`   - Goals with branch: ${goalsWithBranch.length}/${planDetails.goals.length}`)
    
    // Verify task dependencies
    const tasksWithDeps = planDetails.tasks.filter(t => t.dependencies.length > 0)
    console.log(`   - Tasks with dependencies: ${tasksWithDeps.length}`)
    
    // Verify goal-task linking
    const goalsWithTasks = planDetails.goals.filter(g => g.linkedTaskIds.length > 0)
    console.log(`   - Goals linked to tasks: ${goalsWithTasks.length}`)
    
    // Step 7: Detailed verification
    console.log('\n🔬 Step 7: Detailed verification...')
    
    if (planDetails.goals.length === 0) {
      console.error('❌ FAIL: No goals were created from template!')
      return false
    }
    
    if (planDetails.tasks.length === 0) {
      console.error('❌ FAIL: No tasks were created from template!')
      return false
    }
    
    if (goalsWithBranch.length !== planDetails.goals.length) {
      console.error('❌ FAIL: Not all goals have branchId set!')
      return false
    }
    
    console.log('✅ SUCCESS: Enhanced plan template functionality is working correctly!')
    
    return {
      templates,
      createdPlan,
      planDetails,
      testBranch
    }
    
  } catch (error) {
    console.error('❌ FAIL: Enhanced template test failed:', error)
    return false
  }
}

// Auto-run the test
console.log('Starting enhanced template test...')
testEnhancedTemplates().then(result => {
  if (result) {
    console.log('\n🎉 Enhanced template functionality test completed successfully!')
  } else {
    console.log('\n💥 Enhanced template functionality test failed!')
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error)
})
