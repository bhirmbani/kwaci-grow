/**
 * Debug Accounting Route
 * 
 * TanStack Router route to analyze accounting data state and identify
 * why the accounting page might be showing empty states.
 */

import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
// import { Button } from '@/lib/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { debugAccountingData } from '@/debug/accountingDebug'
import { debugAccountingHook } from '@/debug/accountingHookDebug'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DebugAccountingPage() {
  const [debugOutput, setDebugOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const runDebug = async () => {
    setIsRunning(true)
    setDebugOutput('Running debug analysis...\n')

    // Capture console output
    const originalLog = console.log
    const originalError = console.error
    let output = 'Running debug analysis...\n'

    console.log = (...args) => {
      output += args.join(' ') + '\n'
      setDebugOutput(output)
      originalLog(...args)
    }

    console.error = (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n'
      setDebugOutput(output)
      originalError(...args)
    }

    try {
      await debugAccountingData()
      output += '\n' + '='.repeat(50) + '\n'
      setDebugOutput(output)
      await debugAccountingHook()
    } catch (error) {
      output += `\nFATAL ERROR: ${error}\n`
      setDebugOutput(output)
    }

    // Restore console
    console.log = originalLog
    console.error = originalError

    setIsRunning(false)
  }

  // Auto-run debug on component mount
  useEffect(() => {
    runDebug()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounting Debug Analysis</h1>
        <Button onClick={runDebug} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Debug'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto max-h-96 font-mono">
            {debugOutput || 'Click "Run Debug" to analyze accounting data...'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This debug tool checks:
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Whether businesses exist in the database</li>
            <li>Financial items, sales records, recurring expenses, and fixed assets data</li>
            <li>Unified transaction conversion in AccountingService</li>
            <li>Financial summary calculations</li>
            <li>Business context and localStorage state</li>
          </ul>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <h4 className="font-medium mb-2">Expected Results:</h4>
            <ul className="text-sm space-y-1">
              <li>• If seeded: Should show businesses, financial data, and unified transactions</li>
              <li>• If empty: Should show no businesses and explain the empty accounting state</li>
              <li>• If partial: Should identify which data sources are missing</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md">
            <h4 className="font-medium mb-2">Common Issues:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>No businesses:</strong> Database hasn't been seeded</li>
              <li>• <strong>No business selected:</strong> localStorage currentBusinessId is missing</li>
              <li>• <strong>Data exists but no transactions:</strong> Conversion logic issue in AccountingService</li>
              <li>• <strong>Wrong business selected:</strong> Data exists for different business ID</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/debug-accounting')({
  component: DebugAccountingPage,
})
