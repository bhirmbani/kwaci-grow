import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { seedMenuData, testMenuManagement } from '../lib/db/seedMenus'

function TestMenusPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleSeedData = async () => {
    setIsSeeding(true)
    setResults([])
    
    try {
      addResult('🌱 Starting menu data seeding...')
      await seedMenuData()
      addResult('✅ Menu data seeded successfully!')
    } catch (error) {
      addResult(`❌ Seeding failed: ${error.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleTestFunctionality = async () => {
    setIsTesting(true)
    
    try {
      addResult('🧪 Starting functionality test...')
      const success = await testMenuManagement()
      
      if (success) {
        addResult('✅ All tests passed!')
      } else {
        addResult('❌ Some tests failed')
      }
    } catch (error) {
      addResult(`❌ Testing failed: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  const handleClearResults = () => {
    setResults([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu Management Test</h1>
        <p className="text-muted-foreground">
          Test the menu management functionality with sample data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding || isTesting}
              className="w-full"
            >
              {isSeeding ? 'Seeding Data...' : '🌱 Seed Menu Data'}
            </Button>
            
            <Button 
              onClick={handleTestFunctionality} 
              disabled={isSeeding || isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? 'Testing...' : '🧪 Test Functionality'}
            </Button>
            
            <Button 
              onClick={handleClearResults} 
              disabled={isSeeding || isTesting}
              variant="secondary"
              className="w-full"
            >
              🗑️ Clear Results
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Seed Menu Data" to populate the database with sample menus, branches, and sales targets</li>
              <li>Click "Test Functionality" to verify all database operations work correctly</li>
              <li>Navigate to <a href="/menus" className="text-blue-600 hover:underline">/menus</a> to test the UI</li>
              <li>Try creating, editing, and deleting menus</li>
              <li>Test branch assignment functionality</li>
              <li>Verify the floating action button works</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Management Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Implemented Features:</h4>
              <ul className="space-y-1">
                <li>• Menu CRUD operations</li>
                <li>• Branch management</li>
                <li>• Menu-product relationships</li>
                <li>• Branch assignments</li>
                <li>• Sales target management</li>
                <li>• Card and list view modes</li>
                <li>• Floating action buttons</li>
                <li>• Form validation with react-hook-form + zod</li>
                <li>• Professional UI with shadcn/ui</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🚀 Possible Enhancements:</h4>
              <ul className="space-y-1">
                <li>• Menu product pricing management</li>
                <li>• Bulk operations for menus</li>
                <li>• Menu templates</li>
                <li>• Advanced filtering and search</li>
                <li>• Menu analytics and reporting</li>
                <li>• Menu scheduling (time-based availability)</li>
                <li>• Menu categories and tags</li>
                <li>• Export/import functionality</li>
                <li>• Menu versioning</li>
                <li>• Integration with POS systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-menus')({
  component: TestMenusPage,
})
