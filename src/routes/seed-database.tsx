import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle, 
  Database,
  Trash2,
  Play,
  RotateCcw
} from 'lucide-react'
import { ComprehensiveSeeder, type SeedingProgress } from '@/lib/db/comprehensiveSeeder'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SeedingLog {
  timestamp: string
  step: string
  message: string
  type: 'info' | 'success' | 'error'
}

function DatabaseSeed() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [clearFirst, setClearFirst] = useState(true)
  const [progress, setProgress] = useState<SeedingProgress | null>(null)
  const [seedingLogs, setSeedingLogs] = useState<SeedingLog[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  const addLog = (step: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const log: SeedingLog = {
      timestamp: new Date().toLocaleTimeString(),
      step,
      message,
      type
    }
    setSeedingLogs(prev => [...prev, log])
  }

  const handleProgressUpdate = (progressData: SeedingProgress) => {
    setProgress(progressData)
    
    if (progressData.error) {
      addLog(progressData.step, progressData.error, 'error')
      setHasError(true)
    } else if (progressData.completed) {
      addLog(progressData.step, progressData.message, 'success')
    } else {
      addLog(progressData.step, progressData.message, 'info')
    }
  }

  const startSeeding = async () => {
    setIsSeeding(true)
    setIsComplete(false)
    setHasError(false)
    setSeedingLogs([])
    setProgress(null)

    try {
      addLog('Starting', 'Initializing comprehensive database seeder...', 'info')
      
      const seeder = new ComprehensiveSeeder(handleProgressUpdate)
      await seeder.seedDatabase(clearFirst)
      
      setIsComplete(true)
      addLog('Complete', 'Database seeding completed successfully!', 'success')
    } catch (error) {
      setHasError(true)
      addLog('Error', `Seeding failed: ${error.message}`, 'error')
    } finally {
      setIsSeeding(false)
    }
  }

  const clearLogs = () => {
    setSeedingLogs([])
    setProgress(null)
    setIsComplete(false)
    setHasError(false)
  }

  const getProgressPercentage = () => {
    if (!progress) return 0
    return Math.round((progress.progress / progress.total) * 100)
  }

  const getStatusIcon = (type: 'info' | 'success' | 'error') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Database Seed</h1>
          <p className="text-muted-foreground">
            Populate the database with comprehensive test data for all application features
          </p>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Warning:</strong> This will populate your database with test data. 
          If "Clear existing data" is enabled, all current data will be permanently deleted.
          This action cannot be undone.
        </AlertDescription>
      </Alert>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seeding Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clearFirst" 
              checked={clearFirst}
              onCheckedChange={(checked) => setClearFirst(checked as boolean)}
              disabled={isSeeding}
            />
            <label 
              htmlFor="clearFirst" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Clear existing data before seeding
            </label>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>What will be created:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>4 branch locations with business hours</li>
              <li>25+ ingredients with realistic COGS data</li>
              <li>6 coffee products with ingredient relationships</li>
              <li>3 menus with product assignments and pricing</li>
              <li>8 fixed assets with depreciation schedules</li>
              <li>10+ recurring expenses across categories</li>
              <li>30 days of sales targets and historical data</li>
              <li>Warehouse inventory and production batches</li>
              <li>Tasks, goals, and operational plans</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={isSeeding}
                  className="flex items-center gap-2"
                >
                  {isSeeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Seeding
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Database Seeding</AlertDialogTitle>
                  <AlertDialogDescription>
                    {clearFirst ? (
                      <>
                        This will <strong>permanently delete all existing data</strong> and 
                        populate the database with comprehensive test data. This action cannot be undone.
                      </>
                    ) : (
                      <>
                        This will add comprehensive test data to your existing database. 
                        Some data may be duplicated if similar records already exist.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={startSeeding}>
                    {clearFirst ? 'Clear & Seed Database' : 'Seed Database'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              variant="outline" 
              onClick={clearLogs}
              disabled={isSeeding}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {(progress || isSeeding) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Seeding Progress</span>
              <Badge variant={hasError ? 'destructive' : isComplete ? 'default' : 'secondary'}>
                {hasError ? 'Failed' : isComplete ? 'Complete' : 'In Progress'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Step: {progress.step}</span>
                    <span>{progress.progress} / {progress.total}</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="w-full" />
                  <p className="text-sm text-muted-foreground">{progress.message}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs Card */}
      {seedingLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seeding Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {seedingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  {getStatusIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.step}</span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Card */}
      {isComplete && !hasError && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Database Seeding Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your database has been populated with comprehensive test data. 
                  You can now explore all application features with realistic data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/seed-database')({
  component: DatabaseSeed,
})
