import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductService } from '@/lib/services/productService'
import { db } from '@/lib/db'

function TestIngredientFix() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runCleanup = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Starting ingredient integrity check...')
      
      // Get all product ingredients
      const productIngredients = await db.productIngredients.toArray()
      addResult(`Found ${productIngredients.length} product-ingredient relationships`)
      
      // Get all ingredients
      const ingredients = await db.ingredients.toArray()
      addResult(`Found ${ingredients.length} ingredient records`)
      
      // Check for missing ingredient records
      let missingCount = 0
      let validCount = 0
      
      for (const pi of productIngredients) {
        const ingredient = await db.ingredients.get(pi.ingredientId)
        if (!ingredient) {
          missingCount++
          addResult(`❌ Missing ingredient record for ID: ${pi.ingredientId} in product: ${pi.productId}`)
        } else {
          validCount++
          addResult(`✅ Found ingredient: ${ingredient.name} (ID: ${ingredient.id})`)
        }
      }
      
      addResult(`📊 Summary: ${validCount} valid, ${missingCount} missing`)
      
      if (missingCount > 0) {
        addResult('🧹 Running cleanup...')
        await ProductService.cleanupOrphanedRelationships()
        addResult('✅ Cleanup completed')
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testProductView = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Testing product view...')
      
      // Get all products
      const products = await db.products.toArray()
      addResult(`Found ${products.length} products`)
      
      for (const product of products) {
        addResult(`Testing product: ${product.name} (${product.id})`)
        
        try {
          const productWithIngredients = await ProductService.getWithIngredients(product.id)
          if (productWithIngredients) {
            addResult(`✅ Product loaded with ${productWithIngredients.ingredients.length} ingredients`)
            
            // Test COGS calculation
            const cogsBreakdown = await ProductService.getCOGSBreakdown(product.id)
            addResult(`✅ COGS calculated: ${cogsBreakdown.totalCostPerCup} IDR`)
            addResult(`   Ingredients: ${cogsBreakdown.ingredients.map(i => i.name).join(', ')}`)
          } else {
            addResult(`❌ Product not found: ${product.id}`)
          }
        } catch (error) {
          addResult(`❌ Error loading product ${product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Integrity Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runCleanup} disabled={loading}>
              {loading ? 'Running...' : 'Run Cleanup'}
            </Button>
            <Button onClick={testProductView} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Test Product View'}
            </Button>
            <Button onClick={() => setResults([])} variant="outline">
              Clear Results
            </Button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-medium mb-2">Results:</h3>
            {results.length === 0 ? (
              <p className="text-muted-foreground">No results yet. Click a button to start testing.</p>
            ) : (
              <div className="space-y-1 text-sm font-mono">
                {results.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-ingredient-fix')({
  component: TestIngredientFix,
})
