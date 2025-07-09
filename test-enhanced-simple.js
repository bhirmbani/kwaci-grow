/**
 * Simple test for Enhanced Plan Template functionality
 * 
 * Run this in the browser console to test the enhanced functionality
 */

// Test function
window.testEnhancedTemplates = async function() {
  console.log('🚀 Testing Enhanced Plan Template Functionality')
  console.log('=' .repeat(50))
  
  try {
    // Import services
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { BranchService } = await import('./src/lib/services/branchService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Services imported successfully')
    
    // Clear existing templates for clean test
    console.log('\n🧹 Clearing existing templates...')
    await Promise.all([
      db.planTemplates.clear(),
      db.planGoalTemplates.clear(),
      db.planTaskTemplates.clear(),
      db.planMetricTemplates.clear()
    ])
    console.log('✅ Templates cleared')
    
    // Initialize enhanced templates
    console.log('\n🔄 Initializing enhanced templates...')
    await PlanTemplateService.initializeDefaultTemplates()
    
    // Check templates
    const templates = await PlanTemplateService.getAllTemplates()
    console.log(`✅ Created ${templates.length} templates`)
    
    // Check each template for goals and tasks
    console.log('\n🎯 Checking template contents...')
    let templatesWithGoals = 0
    let templatesWithTasks = 0
    
    for (const template of templates) {
      const [goals, tasks] = await Promise.all([
        PlanTemplateService.getGoalTemplates(template.id),
        PlanTemplateService.getTaskTemplates(template.id)
      ])
      
      console.log(`📋 ${template.name}: ${goals.length} goals, ${tasks.length} tasks`)
      
      if (goals.length > 0) templatesWithGoals++
      if (tasks.length > 0) templatesWithTasks++
    }
    
    console.log(`\n📊 Summary: ${templatesWithGoals} templates with goals, ${templatesWithTasks} templates with tasks`)
    
    if (templatesWithGoals === 0 || templatesWithTasks === 0) {
      console.error('❌ FAIL: Templates were not created with goals and tasks!')
      return false
    }
    
    // Test plan creation
    console.log('\n📝 Testing plan creation...')
    
    // Get or create a branch
    const branches = await BranchService.getAll()
    let testBranch = branches.find(b => b.isActive)
    
    if (!testBranch) {
      testBranch = await BranchService.create({
        name: 'Test Branch',
        location: 'Test Location',
        isActive: true,
        note: 'Test branch'
      })
    }
    
    // Use daily template
    const dailyTemplate = templates.find(t => t.type === 'daily')
    if (!dailyTemplate) {
      console.error('❌ No daily template found!')
      return false
    }
    
    const planData = {
      name: 'Enhanced Test Plan',
      description: 'Test plan from enhanced template',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      branchId: testBranch.id,
      note: 'Test plan'
    }
    
    console.log(`📋 Creating plan from template: ${dailyTemplate.name}`)
    const createdPlan = await PlanTemplateService.createPlanFromTemplate(dailyTemplate.id, planData)
    console.log(`✅ Plan created: ${createdPlan.name}`)
    
    // Check plan details
    const planDetails = await PlanningService.getPlanWithDetails(createdPlan.id)
    if (!planDetails) {
      console.error('❌ Could not retrieve plan details!')
      return false
    }
    
    console.log(`\n📊 Plan Results:`)
    console.log(`   - Goals: ${planDetails.goals.length}`)
    console.log(`   - Tasks: ${planDetails.tasks.length}`)
    console.log(`   - Metrics: ${planDetails.metrics.length}`)
    
    // Detailed checks
    const goalsWithBranch = planDetails.goals.filter(g => g.branchId)
    const tasksWithDeps = planDetails.tasks.filter(t => t.dependencies.length > 0)
    const goalsWithTasks = planDetails.goals.filter(g => g.linkedTaskIds.length > 0)
    
    console.log(`   - Goals with branch: ${goalsWithBranch.length}/${planDetails.goals.length}`)
    console.log(`   - Tasks with dependencies: ${tasksWithDeps.length}`)
    console.log(`   - Goals linked to tasks: ${goalsWithTasks.length}`)
    
    // Final validation
    if (planDetails.goals.length === 0) {
      console.error('❌ FAIL: No goals created!')
      return false
    }
    
    if (planDetails.tasks.length === 0) {
      console.error('❌ FAIL: No tasks created!')
      return false
    }
    
    if (goalsWithBranch.length !== planDetails.goals.length) {
      console.error('❌ FAIL: Not all goals have branchId!')
      return false
    }
    
    console.log('\n✅ SUCCESS: Enhanced plan template functionality is working!')
    return true
    
  } catch (error) {
    console.error('❌ FAIL: Test failed with error:', error)
    return false
  }
}

// Auto-run
console.log('Enhanced template test function loaded. Run testEnhancedTemplates() to test.')
console.log('Or wait 2 seconds for auto-run...')

setTimeout(() => {
  window.testEnhancedTemplates().then(success => {
    console.log('\n🏁 Test completed:', success ? 'SUCCESS' : 'FAILED')
  }).catch(error => {
    console.error('💥 Test execution failed:', error)
  })
}, 2000)
