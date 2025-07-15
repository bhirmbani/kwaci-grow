import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { DashboardService, type TimePeriod } from '../lib/services/dashboardService'
import { useCurrentBusinessId } from '../lib/stores/businessStore'
import { formatCurrency } from '../utils/formatters'

function TestDashboardPage() {
  const currentBusinessId = useCurrentBusinessId()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string, isError = false) => {
    const prefix = isError ? '❌' : '✅'
    setTestResults(prev => [...prev, `${prefix} ${message}`])
  }

  const runDashboardTests = async () => {
    if (!currentBusinessId) {
      addResult('No business selected', true)
      return
    }

    setIsRunning(true)
    setTestResults([])
    
    try {
      addResult('Starting dashboard service tests...')

      // Test 1: Sales Analytics
      addResult('Testing sales analytics...')
      const salesData = await DashboardService.getSalesAnalytics('today')
      addResult(`Sales analytics loaded - Revenue: ${formatCurrency(salesData.totalRevenue)}, Transactions: ${salesData.totalTransactions}`)

      // Test 2: Financial Overview
      addResult('Testing financial overview...')
      const financialData = await DashboardService.getFinancialOverview()
      addResult(`Financial overview loaded - Available cash: ${formatCurrency(financialData.availableCash)}`)

      // Test 3: Operations Status
      addResult('Testing operations status...')
      const operationsData = await DashboardService.getOperationsStatus()
      addResult(`Operations status loaded - ${operationsData.totalIncomplete} incomplete batches, ${operationsData.overdueCount} overdue`)

      // Test 4: Inventory Alerts
      addResult('Testing inventory alerts...')
      const inventoryAlerts = await DashboardService.getInventoryAlerts()
      addResult(`Inventory alerts loaded - ${inventoryAlerts.length} items below threshold`)

      // Test 5: Branch Performance
      addResult('Testing branch performance...')
      const branchData = await DashboardService.getBranchPerformance('today')
      addResult(`Branch performance loaded - ${branchData.length} branches analyzed`)

      // Test 6: Complete Dashboard Data
      addResult('Testing complete dashboard data...')
      const dashboardData = await DashboardService.getDashboardData('today')
      addResult(`Complete dashboard data loaded successfully`)
      addResult(`Last updated: ${new Date(dashboardData.lastUpdated).toLocaleString()}`)

      // Test different time periods
      addResult('Testing different time periods...')
      const periods: TimePeriod[] = ['today', 'week', 'month', 'quarter']
      for (const period of periods) {
        const periodData = await DashboardService.getSalesAnalytics(period)
        addResult(`${period} data: ${formatCurrency(periodData.totalRevenue)} revenue, ${periodData.totalTransactions} transactions`)
      }

      addResult('All dashboard tests completed successfully! 🎉')
      
    } catch (error) {
      addResult(`Test failed: ${(error as Error).message}`, true)
    } finally {
      setIsRunning(false)
    }
  }

  if (!currentBusinessId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
          <p className="text-muted-foreground">Please select a business to run dashboard tests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Service Tests</h1>
        <p className="text-muted-foreground">
          Test the dashboard service functionality to ensure all components work correctly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Test Suite</CardTitle>
          <CardDescription>
            Run comprehensive tests for all dashboard services and data aggregation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDashboardTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run Dashboard Service Tests'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Components</CardTitle>
          <CardDescription>
            Overview of the new dashboard implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">✅ Implemented Components</h4>
              <ul className="space-y-1 text-sm">
                <li>• Sales Analytics Section</li>
                <li>• Financial Overview Section</li>
                <li>• Operations Status Section</li>
                <li>• Inventory Alerts Section</li>
                <li>• Branch Performance Section</li>
                <li>• Dashboard Service Layer</li>
                <li>• Time Period Filtering</li>
                <li>• Business Context Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 Key Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Real-time data aggregation</li>
                <li>• Multi-business support</li>
                <li>• Responsive design</li>
                <li>• Error handling & loading states</li>
                <li>• Visual indicators & charts</li>
                <li>• Sortable performance metrics</li>
                <li>• Color-coded alerts</li>
                <li>• Comprehensive analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">📊 Data Integration</h4>
              <ul className="space-y-1 text-sm">
                <li>• SalesRecordService - Revenue & transactions</li>
                <li>• ProductionService - Batch status & operations</li>
                <li>• StockService - Inventory levels & alerts</li>
                <li>• BranchService - Branch performance</li>
                <li>• Financial calculations - Cash flow & expenses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⏱️ Time Period Support</h4>
              <ul className="space-y-1 text-sm">
                <li>• Today - Current day analytics</li>
                <li>• This Week - Weekly performance</li>
                <li>• This Month - Monthly overview</li>
                <li>• Last 3 Months - Quarterly trends</li>
                <li>• Automatic date range calculation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Replacement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Successfully Replaced</h4>
              <p className="text-sm text-green-700">
                The old ProjectionTable component and financial input controls have been completely replaced 
                with a comprehensive business overview dashboard that provides real operational insights.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🚀 Enhanced Functionality</h4>
              <p className="text-sm text-blue-700">
                The new dashboard provides live operational data instead of static financial projections, 
                giving users actionable insights into their business performance across all key areas.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🎯 Business Value</h4>
              <p className="text-sm text-purple-700">
                Users can now monitor sales performance, track inventory levels, manage production workflows, 
                and analyze branch performance all from a single comprehensive dashboard view.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-dashboard')({
  component: TestDashboardPage,
})
