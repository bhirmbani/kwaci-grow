import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ProductService } from '@/lib/services/productService'
import { IngredientService } from '@/lib/services/ingredientService'
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
