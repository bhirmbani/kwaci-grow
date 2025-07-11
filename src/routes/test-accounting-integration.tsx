import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { AccountingService } from '@/lib/services/accountingService'
import { BusinessService } from '@/lib/services/businessService'
import { db } from '@/lib/db'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'warning' | 'error'
  message: string
  data?: any
}

function AccountingIntegrationTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Business Data Check', status: 'pending', message: 'Checking businesses...' },
    { name: 'Operational Data Verification', status: 'pending', message: 'Waiting...' },
    { name: 'Financial Items Analysis', status: 'pending', message: 'Waiting...' },
    { name: 'Transaction Source Mapping', status: 'pending', message: 'Waiting...' },
    { name: 'Data Relationship Integrity', status: 'pending', message: 'Waiting...' },
    { name: 'Accounting Service Integration', status: 'pending', message: 'Waiting...' },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [businessResults, setBusinessResults] = useState<any[]>([])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test))
  }

  const runTests = async () => {
    setIsRunning(true)
    const results: any[] = []
    
    try {
      // Test 1: Business Data Check
      updateTest(0, { status: 'pending', message: 'Checking business data...' })
      const businesses = await BusinessService.getAll()
      updateTest(0, { 
        status: 'success', 
        message: `Found ${businesses.length} businesses`,
        data: businesses.map(b => ({ id: b.id, name: b.name }))
      })

      for (const business of businesses) {
        const businessResult: any = { business: business.name, businessId: business.id }

        // Test 2: Operational Data Verification
        updateTest(1, { status: 'pending', message: `Checking operational data for ${business.name}...` })
        
        const [salesRecords, fixedAssets, recurringExpenses, warehouseBatches, productionBatches, financialItems] = await Promise.all([
          db.salesRecords.where('businessId').equals(business.id).toArray(),
          db.fixedAssets.where('businessId').equals(business.id).toArray(),
          db.recurringExpenses.where('businessId').equals(business.id).toArray(),
          db.warehouseBatches.where('businessId').equals(business.id).toArray(),
          db.productionBatches.where('businessId').equals(business.id).toArray(),
          db.financialItems.where('businessId').equals(business.id).toArray()
        ])

        businessResult.operationalData = {
          salesRecords: salesRecords.length,
          fixedAssets: fixedAssets.length,
          recurringExpenses: recurringExpenses.length,
          warehouseBatches: warehouseBatches.length,
          productionBatches: productionBatches.length,
          financialItems: financialItems.length
        }

        // Test 3: Financial Items Analysis
        updateTest(2, { status: 'pending', message: `Analyzing financial items for ${business.name}...` })
        
        const financialItemsByCategory = financialItems.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const assetPurchaseItems = financialItems.filter(item => 
          item.isFixedAsset && item.sourceAssetId && item.category === 'initial_capital'
        )
        const warehousePurchaseItems = financialItems.filter(item => 
          item.name.includes('Warehouse Purchase') && item.category === 'variable_cogs'
        )
        const productionCostItems = financialItems.filter(item => 
          item.name.includes('Production Cost') && item.category === 'variable_cogs'
        )
        const operationalFinancialItems = financialItems.filter(item => 
          item.category === 'fixed_costs' && 
          !item.isFixedAsset &&
          !item.name.includes('Depreciation')
        )

        businessResult.financialAnalysis = {
          byCategory: financialItemsByCategory,
          assetPurchases: assetPurchaseItems.length,
          warehousePurchases: warehousePurchaseItems.length,
          productionCosts: productionCostItems.length,
          operationalItems: operationalFinancialItems.length,
          operationalItemNames: operationalFinancialItems.map(item => item.name)
        }

        // Test 4: Transaction Source Mapping
        updateTest(3, { status: 'pending', message: `Testing transaction mapping for ${business.name}...` })
        
        const transactions = await AccountingService.getAllTransactions(business.id)
        const transactionsBySource = transactions.reduce((acc, tx) => {
          acc[tx.sourceEntity] = (acc[tx.sourceEntity] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        businessResult.transactionMapping = {
          totalTransactions: transactions.length,
          bySource: transactionsBySource
        }

        // Test 5: Data Relationship Integrity
        updateTest(4, { status: 'pending', message: `Checking data integrity for ${business.name}...` })
        
        const completedProduction = productionBatches.filter(batch => batch.status === 'Completed')
        const integrityChecks = {
          assetPurchaseRatio: `${assetPurchaseItems.length}/${fixedAssets.length}`,
          warehousePurchaseRatio: `${warehousePurchaseItems.length}/${warehouseBatches.length}`,
          productionCostRatio: `${productionCostItems.length}/${completedProduction.length}`,
          duplicateOperationalExpenses: operationalFinancialItems.length > 0
        }

        businessResult.integrityChecks = integrityChecks

        // Test 6: Accounting Service Integration
        updateTest(5, { status: 'pending', message: `Testing accounting service for ${business.name}...` })
        
        const summary = await AccountingService.getFinancialSummary(business.id)
        businessResult.financialSummary = {
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          netIncome: summary.netIncome,
          cashFlow: summary.cashFlow
        }

        results.push(businessResult)
      }

      setBusinessResults(results)

      // Update test statuses based on results
      updateTest(1, { status: 'success', message: 'Operational data verified for all businesses' })
      updateTest(2, { status: 'success', message: 'Financial items analyzed' })
      updateTest(3, { status: 'success', message: 'Transaction mapping completed' })
      
      // Check for integrity issues
      const hasIntegrityIssues = results.some(r => r.financialAnalysis.operationalItems > 0)
      updateTest(4, { 
        status: hasIntegrityIssues ? 'warning' : 'success', 
        message: hasIntegrityIssues ? 'Found duplicate operational expenses' : 'Data integrity verified'
      })
      
      updateTest(5, { status: 'success', message: 'Accounting service integration verified' })

    } catch (error) {
      console.error('Test failed:', error)
      const currentTestIndex = tests.findIndex(t => t.status === 'pending')
      if (currentTestIndex >= 0) {
        updateTest(currentTestIndex, { 
          status: 'error', 
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounting Integration Test</h1>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.message}</div>
                  {test.data && (
                    <pre className="text-xs mt-2 p-2 bg-muted rounded">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {businessResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {businessResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">{result.business}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Operational Data</h4>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(result.operationalData, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Financial Analysis</h4>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(result.financialAnalysis, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Transaction Mapping</h4>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(result.transactionMapping, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Integrity Checks</h4>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(result.integrityChecks, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Financial Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Income</div>
                        <div className="font-medium">{result.financialSummary.totalIncome.toLocaleString()} IDR</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Expenses</div>
                        <div className="font-medium">{result.financialSummary.totalExpenses.toLocaleString()} IDR</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Net Income</div>
                        <div className="font-medium">{result.financialSummary.netIncome.toLocaleString()} IDR</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cash Flow</div>
                        <div className="font-medium">{result.financialSummary.cashFlow.toLocaleString()} IDR</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/test-accounting-integration')({
  component: AccountingIntegrationTest,
})
