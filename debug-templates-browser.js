/**
 * Browser console test for Enhanced Plan Template functionality
 * 
 * Copy and paste this into the browser console on any page of the app
 */

async function debugTemplates() {
  console.log('🔍 Debugging Enhanced Plan Template Functionality')
  console.log('=' .repeat(50))
  
  try {
    // Import services (works in browser)
    const { PlanTemplateService } = await import('./src/lib/services/planTemplateService.js')
    const { PlanningService } = await import('./src/lib/services/planningService.js')
    const { BranchService } = await import('./src/lib/services/branchService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Services imported successfully')
    
    // Step 1: Check current templates
    console.log('\n📋 Step 1: Checking current templates...')
    const templates = await PlanTemplateService.getAllTemplates()
    console.log(`Found ${templates.length} templates:`, templates.map(t => t.name))
    
    if (templates.length === 0) {
      console.log('🔄 No templates found, initializing defaults...')
      await PlanTemplateService.initializeDefaultTemplates()
      const newTemplates = await PlanTemplateService.getAllTemplates()
      console.log(`✅ Initialized ${newTemplates.length} templates`)
    }
    
    // Step 2: Check template details
    console.log('\n🎯 Step 2: Checking template goals and tasks...')
    const allTemplates = await PlanTemplateService.getAllTemplates()
    
    for (const template of allTemplates) {
      const [goals, tasks] = await Promise.all([
        PlanTemplateService.getGoalTemplates(template.id),
        PlanTemplateService.getTaskTemplates(template.id)
      ])
      
      console.log(`📋 Template "${template.name}": ${goals.length} goals, ${tasks.length} tasks`)
      
      if (goals.length > 0) {
        console.log('   Goals:', goals.map(g => g.title))
      }
      if (tasks.length > 0) {
        console.log('   Tasks:', tasks.map(t => t.title))
      }
    }
    
    // Step 3: Test plan creation if we have templates with goals
    const templatesWithGoals = []
    for (const template of allTemplates) {
      const goals = await PlanTemplateService.getGoalTemplates(template.id)
      if (goals.length > 0) {
        templatesWithGoals.push(template)
      }
    }
    
    if (templatesWithGoals.length > 0) {
      console.log('\n📝 Step 3: Testing plan creation from template with goals...')
      
      // Get or create a branch
      const branches = await BranchService.getAll()
      let testBranch = branches.find(b => b.isActive)
      
      if (!testBranch) {
        console.log('🏢 Creating test branch...')
        testBranch = await BranchService.create({
          name: 'Debug Test Branch',
          location: 'Debug Location',
          isActive: true,
          note: 'Debug test branch'
        })
      }
      
      const template = templatesWithGoals[0]
      console.log(`📋 Using template: ${template.name}`)
      
      const planData = {
        name: 'Debug Test Plan',
        description: 'Debug test plan from enhanced template',
        startDate: '2025-01-15',
        endDate: '2025-01-15',
        branchId: testBranch.id,
        note: 'Debug test'
      }
      
      console.log('🔄 Creating plan from template...')
      const createdPlan = await PlanTemplateService.createPlanFromTemplate(template.id, planData)
      console.log(`✅ Plan created: ${createdPlan.name}`)
      
      // Check plan details
      const planDetails = await PlanningService.getPlanWithDetails(createdPlan.id)
      if (planDetails) {
        console.log(`📊 Plan has ${planDetails.goals.length} goals and ${planDetails.tasks.length} tasks`)
        
        if (planDetails.goals.length > 0) {
          console.log('   Goals:', planDetails.goals.map(g => `${g.title} (branch: ${g.branchId ? 'yes' : 'no'})`))
        }
        if (planDetails.tasks.length > 0) {
          console.log('   Tasks:', planDetails.tasks.map(t => `${t.title} (deps: ${t.dependencies.length})`))
        }
        
        // Check goal-task linking
        const linkedGoals = planDetails.goals.filter(g => g.linkedTaskIds.length > 0)
        console.log(`   Goals linked to tasks: ${linkedGoals.length}/${planDetails.goals.length}`)
        
        if (planDetails.goals.length > 0 && planDetails.tasks.length > 0) {
          console.log('✅ SUCCESS: Plan created with goals and tasks!')
          return { success: true, planDetails }
        } else {
          console.error('❌ FAIL: Plan created but missing goals or tasks!')
          return { success: false, planDetails }
        }
      } else {
        console.error('❌ FAIL: Could not retrieve plan details!')
        return { success: false }
      }
    } else {
      console.warn('⚠️ No templates with goals found to test plan creation')
      return { success: false, reason: 'No templates with goals' }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return { success: false, error }
  }
}

// Auto-run
console.log('Starting template debug...')
debugTemplates().then(result => {
  console.log('\n🏁 Debug completed:', result.success ? 'SUCCESS' : 'FAILED')
  if (!result.success && result.reason) {
    console.log('Reason:', result.reason)
  }
  if (result.error) {
    console.log('Error:', result.error)
  }
}).catch(error => {
  console.error('💥 Debug execution failed:', error)
})
