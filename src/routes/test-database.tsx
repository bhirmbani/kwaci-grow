import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ProductService } from '@/lib/services/productService'
import { IngredientService } from '@/lib/services/ingredientService'
import { PlanTemplateService } from '@/lib/services/planTemplateService'
import { PlanningService } from '@/lib/services/planningService'
import { BranchService } from '@/lib/services/branchService'
import { ensureDatabaseInitialized } from '@/lib/db/init'
import { resetDatabase, getDatabaseInfo } from '@/lib/db/reset'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

function DatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Initialization', status: 'pending', message: 'Initializing...' },
    { name: 'Product Service Test', status: 'pending', message: 'Waiting...' },
    { name: 'Ingredient Service Test', status: 'pending', message: 'Waiting...' },
    { name: 'Product-Ingredient Relationships', status: 'pending', message: 'Waiting...' },
    { name: 'Ingredient Delete Test', status: 'pending', message: 'Waiting...' },
    { name: 'Enhanced Plan Template Test', status: 'pending', message: 'Waiting...' },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [dbInfo, setDbInfo] = useState<any>(null)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    try {
      // Test 1: Database Initialization
      updateTest(0, { status: 'pending', message: 'Initializing database...' })
      await ensureDatabaseInitialized()
      updateTest(0, { status: 'success', message: 'Database initialized successfully' })

      // Test 2: Product Service
      updateTest(1, { status: 'pending', message: 'Testing ProductService.getAll()...' })
      const products = await ProductService.getAll()
      updateTest(1, { 
        status: 'success', 
        message: `Found ${products.length} products`,
        data: products.map(p => ({ name: p.name, description: p.description }))
      })

      // Test 3: Ingredient Service
      updateTest(2, { status: 'pending', message: 'Testing IngredientService.getAll()...' })
      const ingredients = await IngredientService.getAll()
      updateTest(2, { 
        status: 'success', 
        message: `Found ${ingredients.length} ingredients`,
        data: ingredients.map(i => ({ name: i.name, category: i.category, unit: i.unit }))
      })

      // Test 4: Product-Ingredient Relationships
      updateTest(3, { status: 'pending', message: 'Testing product-ingredient relationships...' })
      const relationships = []
      for (const product of products) {
        const productIngredients = await ProductService.getProductIngredients(product.id)
        relationships.push({
          product: product.name,
          ingredientCount: productIngredients.length,
          ingredients: productIngredients.map(pi => pi.ingredientName)
        })
      }
      updateTest(3, {
        status: 'success',
        message: `Tested relationships for ${products.length} products`,
        data: relationships
      })

      // Test 5: Ingredient Delete Functionality
      updateTest(4, { status: 'pending', message: 'Testing ingredient delete functionality...' })

      // Create a test ingredient
      const testIngredient = await IngredientService.create({
        name: 'Test Delete Ingredient',
        baseUnitCost: 1000,
        baseUnitQuantity: 100,
        unit: 'ml',
        category: 'Test Category',
        note: 'This is a test ingredient for delete functionality'
      })

      // Verify it exists
      const beforeDelete = await IngredientService.getAll(true) // Include inactive
      const foundBefore = beforeDelete.find(i => i.id === testIngredient.id)
      if (!foundBefore) {
        throw new Error('Test ingredient was not created properly')
      }

      // Delete the ingredient (soft delete)
      await IngredientService.delete(testIngredient.id)

      // Verify it's soft deleted (not in active list, but in inactive list)
      const activeAfterDelete = await IngredientService.getAll(false) // Active only
      const allAfterDelete = await IngredientService.getAll(true) // Include inactive

      const foundInActive = activeAfterDelete.find(i => i.id === testIngredient.id)
      const foundInAll = allAfterDelete.find(i => i.id === testIngredient.id)

      if (foundInActive) {
        throw new Error('Ingredient still appears in active list after delete')
      }

      if (!foundInAll) {
        throw new Error('Ingredient was hard deleted instead of soft deleted')
      }

      if (foundInAll.isActive !== false) {
        throw new Error('Ingredient isActive flag was not set to false')
      }

      updateTest(4, {
        status: 'success',
        message: 'Delete functionality working correctly (soft delete)',
        data: {
          testIngredientId: testIngredient.id,
          beforeDelete: { found: !!foundBefore, isActive: foundBefore?.isActive },
          afterDelete: {
            foundInActive: !!foundInActive,
            foundInAll: !!foundInAll,
            isActive: foundInAll?.isActive
          }
        }
      })

      // Test 6: Enhanced Plan Template Functionality
      updateTest(5, { status: 'pending', message: 'Testing enhanced plan template functionality...' })

      // First, ensure we have a branch for testing
      const branches = await BranchService.getAll()
      let testBranch = branches.find(b => b.isActive)

      if (!testBranch) {
        // Create a test branch if none exists
        testBranch = await BranchService.create({
          name: 'Test Branch',
          location: 'Test Location',
          isActive: true,
          note: 'Test branch for plan template testing'
        })
      }

      // Create a test template with goals and tasks
      const testTemplate = await PlanTemplateService.createTemplate({
        name: 'Enhanced Test Template',
        description: 'Test template for enhanced functionality',
        type: 'daily',
        category: 'operations',
        isDefault: false,
        estimatedDuration: 120,
        difficulty: 'beginner',
        tags: 'test,enhanced',
        note: 'Test template with goals and tasks'
      })

      // Add goal templates
      const goalTemplate1 = await PlanTemplateService.addGoalTemplate(testTemplate.id, {
        title: 'Test Sales Goal',
        description: 'Achieve daily sales target',
        defaultTargetValue: 1000000,
        unit: 'IDR',
        category: 'sales',
        priority: 'high',
        note: 'Test goal for sales'
      })

      const goalTemplate2 = await PlanTemplateService.addGoalTemplate(testTemplate.id, {
        title: 'Test Production Goal',
        description: 'Complete production tasks',
        defaultTargetValue: 50,
        unit: 'cups',
        category: 'production',
        priority: 'medium',
        note: 'Test goal for production'
      })

      // Add task templates
      const taskTemplate1 = await PlanTemplateService.addTaskTemplate(testTemplate.id, {
        title: 'Setup Equipment',
        description: 'Prepare coffee machines and equipment',
        category: 'setup',
        priority: 'high',
        estimatedDuration: 30,
        dependencies: [],
        note: 'Setup task'
      })

      const taskTemplate2 = await PlanTemplateService.addTaskTemplate(testTemplate.id, {
        title: 'Prepare Ingredients',
        description: 'Prepare coffee beans and other ingredients',
        category: 'production',
        priority: 'medium',
        estimatedDuration: 45,
        dependencies: [taskTemplate1.id], // Depends on setup
        note: 'Production task'
      })

      // Test creating plan from template
      const createdPlan = await PlanTemplateService.createPlanFromTemplate(testTemplate.id, {
        name: 'Test Enhanced Plan',
        description: 'Plan created from enhanced template',
        startDate: '2024-01-01',
        endDate: '2024-01-01',
        branchId: testBranch.id,
        note: 'Test plan'
      })

      // Verify the plan was created with goals and tasks
      const planDetails = await PlanningService.getPlanWithDetails(createdPlan.id)

      if (!planDetails) {
        throw new Error('Created plan not found')
      }

      if (planDetails.goals.length !== 2) {
        throw new Error(`Expected 2 goals, got ${planDetails.goals.length}`)
      }

      if (planDetails.tasks.length !== 2) {
        throw new Error(`Expected 2 tasks, got ${planDetails.tasks.length}`)
      }

      // Verify goals have branchId
      const goalsWithoutBranch = planDetails.goals.filter(g => !g.branchId)
      if (goalsWithoutBranch.length > 0) {
        throw new Error('Some goals were created without branchId')
      }

      // Verify task dependencies were mapped correctly
      const setupTask = planDetails.tasks.find(t => t.title === 'Setup Equipment')
      const prepTask = planDetails.tasks.find(t => t.title === 'Prepare Ingredients')

      if (!setupTask || !prepTask) {
        throw new Error('Tasks not created correctly')
      }

      if (prepTask.dependencies.length !== 1 || prepTask.dependencies[0] !== setupTask.id) {
        throw new Error('Task dependencies not mapped correctly')
      }

      // Verify goal-task linking
      const salesGoal = planDetails.goals.find(g => g.category === 'sales')
      const productionGoal = planDetails.goals.find(g => g.category === 'production')

      if (!salesGoal || !productionGoal) {
        throw new Error('Goals not created correctly')
      }

      if (productionGoal.linkedTaskIds.length === 0) {
        throw new Error('Production goal should be linked to production tasks')
      }

      updateTest(5, {
        status: 'success',
        message: 'Enhanced plan template functionality working correctly',
        data: {
          templateId: testTemplate.id,
          planId: createdPlan.id,
          goalsCreated: planDetails.goals.length,
          tasksCreated: planDetails.tasks.length,
          dependenciesMapped: prepTask.dependencies.length,
          goalsWithBranch: planDetails.goals.filter(g => g.branchId).length
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      // Find the first pending test and mark it as error
      const pendingIndex = tests.findIndex(test => test.status === 'pending')
      if (pendingIndex !== -1) {
        updateTest(pendingIndex, { status: 'error', message: errorMessage })
      }
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetDatabase()
      // Reset all test statuses
      setTests([
        { name: 'Database Initialization', status: 'pending', message: 'Ready to test...' },
        { name: 'Product Service Test', status: 'pending', message: 'Waiting...' },
        { name: 'Ingredient Service Test', status: 'pending', message: 'Waiting...' },
        { name: 'Product-Ingredient Relationships', status: 'pending', message: 'Waiting...' },
        { name: 'Ingredient Delete Test', status: 'pending', message: 'Waiting...' },
        { name: 'Enhanced Plan Template Test', status: 'pending', message: 'Waiting...' },
      ])
      await loadDbInfo() // Refresh database info
      alert('Database reset successfully! You can now run tests.')
    } catch (error) {
      alert(`Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsResetting(false)
    }
  }

  const loadDbInfo = async () => {
    const info = await getDatabaseInfo()
    setDbInfo(info)
  }

  useEffect(() => {
    loadDbInfo()
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Database Migration Test</h1>
          <p className="text-muted-foreground">
            Test the database migration and seeding functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} disabled={isResetting || isRunning} variant="destructive">
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Database'
            )}
          </Button>
          <Button onClick={runTests} disabled={isRunning || isResetting}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>
      </div>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
        </CardHeader>
        <CardContent>
          {dbInfo ? (
            <div className="space-y-2">
              <p><strong>Version:</strong> {dbInfo.version}</p>
              <p><strong>Name:</strong> {dbInfo.name}</p>
              <p><strong>Status:</strong> {dbInfo.isOpen ? 'Open' : 'Closed'}</p>
              {dbInfo.tableCounts && (
                <details>
                  <summary className="cursor-pointer font-medium">Table Counts</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs">
                    {JSON.stringify(dbInfo.tableCounts, null, 2)}
                  </pre>
                </details>
              )}
              {dbInfo.error && (
                <p className="text-red-500"><strong>Error:</strong> {dbInfo.error}</p>
              )}
            </div>
          ) : (
            <p>Loading database info...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(test.status)}
                {test.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
              {test.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">View Data</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/test-database')({
  component: DatabaseTest,
})
