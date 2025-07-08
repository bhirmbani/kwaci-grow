import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductTargetDefaultService } from '@/lib/services/productTargetDefaultService'

function TestTargetsPage() {
  const [targets, setTargets] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(false)
  const [testProductId] = useState('test-product-123')
  const [testQuantity, setTestQuantity] = useState(15)

  const loadTargets = async () => {
    setLoading(true)
    try {
      const allTargets = await ProductTargetDefaultService.getAllDefaultTargetQuantities()
      setTargets(allTargets)
      console.log('Loaded targets:', allTargets)
    } catch (error) {
      console.error('Error loading targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTestTarget = async () => {
    setLoading(true)
    try {
      await ProductTargetDefaultService.setDefaultTargetQuantity(
        testProductId, 
        testQuantity, 
        'Test target from test page'
      )
      console.log('Target saved successfully')
      await loadTargets() // Reload to see changes
    } catch (error) {
      console.error('Error saving target:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTestTarget = async () => {
    setLoading(true)
    try {
      await ProductTargetDefaultService.deleteDefaultTargetQuantity(testProductId)
      console.log('Target deleted successfully')
      await loadTargets() // Reload to see changes
    } catch (error) {
      console.error('Error deleting target:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTargets()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Test Product Target Defaults</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={testQuantity}
              onChange={(e) => setTestQuantity(parseInt(e.target.value) || 0)}
              placeholder="Target quantity"
              className="w-32"
            />
            <Button onClick={saveTestTarget} disabled={loading}>
              Save Test Target
            </Button>
            <Button onClick={deleteTestTarget} disabled={loading} variant="destructive">
              Delete Test Target
            </Button>
            <Button onClick={loadTargets} disabled={loading} variant="outline">
              Reload Targets
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Targets ({targets.size})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : targets.size === 0 ? (
            <p>No targets found</p>
          ) : (
            <div className="space-y-2">
              {Array.from(targets.entries()).map(([productId, quantity]) => (
                <div key={productId} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-mono text-sm">{productId}</span>
                  <span className="font-semibold">{quantity} units/day</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-targets')({
  component: TestTargetsPage,
})
