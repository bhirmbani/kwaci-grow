import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import { AlertCircle, CheckCircle, Coffee, Cookie, Loader2, Building2, BarChart3 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MultiBusinessSeeder, 
  type BusinessSeedingResult, 
  type MultiBusinessSeedingProgress 
} from '@/lib/db/multiBusinessSeeder'

interface SeedingLog {
  timestamp: string
  business: string
  step: string
  message: string
  type: 'info' | 'success' | 'error'
}

function MultiBusinessSeed() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [clearFirst, setClearFirst] = useState(true)
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<Array<'coffee' | 'bakery'>>(['coffee', 'bakery'])
  const [progress, setProgress] = useState<MultiBusinessSeedingProgress | null>(null)
  const [seedingLogs, setSeedingLogs] = useState<SeedingLog[]>([])
  const [results, setResults] = useState<BusinessSeedingResult[]>([])
  const [hasError, setHasError] = useState(false)
  const [businessStats, setBusinessStats] = useState<{
    totalBusinesses: number
    businessTypes: Record<string, number>
    businesses: Array<{ id: string; name: string; description: string }>
  } | null>(null)

  const businessTypeOptions = [
    { 
      value: 'coffee' as const, 
      label: 'Coffee Shop', 
      description: 'On The Go Coffee - Premium coffee and pastries',
      icon: Coffee,
      color: 'bg-amber-100 text-amber-800'
    },
    { 
      value: 'bakery' as const, 
      label: 'Bakery', 
      description: 'Sweet Dreams Bakery - Artisan breads and desserts',
      icon: Cookie,
      color: 'bg-pink-100 text-pink-800'
    }
  ]

  const addLog = (business: string, step: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const log: SeedingLog = {
      timestamp: new Date().toLocaleTimeString(),
      business,
      step,
      message,
      type
    }
    setSeedingLogs(prev => [...prev, log])
  }

  const handleProgressUpdate = (progressData: MultiBusinessSeedingProgress) => {
    setProgress(progressData)
    
    if (progressData.currentBusiness) {
      addLog(
        progressData.currentBusiness,
        progressData.step,
        progressData.message,
        progressData.error ? 'error' : progressData.completed ? 'success' : 'info'
      )
    }
  }

  const handleBusinessTypeToggle = (businessType: 'coffee' | 'bakery') => {
    setSelectedBusinessTypes(prev => {
      if (prev.includes(businessType)) {
        return prev.filter(type => type !== businessType)
      } else {
        return [...prev, businessType]
      }
    })
  }

  const startSeeding = async () => {
    if (selectedBusinessTypes.length === 0) {
      addLog('System', 'Validation', 'Please select at least one business type to seed', 'error')
      return
    }

    setIsSeeding(true)
    setHasError(false)
    setSeedingLogs([])
    setProgress(null)
    setResults([])

    try {
      addLog('System', 'Starting', 'Initializing multi-business seeder...', 'info')
      
      const seeder = new MultiBusinessSeeder(handleProgressUpdate)
      const seedingResults = await seeder.seedMultipleBusinesses(selectedBusinessTypes, clearFirst)
      
      setResults(seedingResults)
      
      const successCount = seedingResults.filter(r => r.success).length
      const failureCount = seedingResults.filter(r => !r.success).length
      
      if (failureCount === 0) {
        addLog('System', 'Complete', `All ${successCount} businesses seeded successfully!`, 'success')
      } else {
        addLog('System', 'Complete', `${successCount} businesses succeeded, ${failureCount} failed`, 'error')
        setHasError(true)
      }
      
      // Load business statistics
      await loadBusinessStats()
      
    } catch (error) {
      setHasError(true)
      addLog('System', 'Error', `Multi-business seeding failed: ${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
      setIsSeeding(false)
    }
  }

  const loadBusinessStats = async () => {
    try {
      const seeder = new MultiBusinessSeeder()
      const stats = await seeder.getBusinessStats()
      setBusinessStats(stats)
    } catch (error) {
      console.error('Failed to load business stats:', error)
    }
  }

  const getProgressPercentage = () => {
    if (!progress) return 0
    if (progress.total === 0) return 0
    return Math.round((progress.progress / progress.total) * 100)
  }

  const getOverallProgressPercentage = () => {
    if (!progress) return 0
    if (progress.totalBusinesses === 0) return 0
    
    const businessProgress = (progress.businessesCompleted / progress.totalBusinesses) * 100
    const currentBusinessProgress = progress.total > 0 ? (progress.progress / progress.total) * (100 / progress.totalBusinesses) : 0
    
    return Math.round(businessProgress + currentBusinessProgress)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Multi-Business Database Seeder</h1>
          <p className="text-muted-foreground">
            Create test data for multiple business types with proper data isolation
          </p>
        </div>
      </div>

      {/* Business Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Business Types to Seed</CardTitle>
          <CardDescription>
            Choose which types of businesses you want to create test data for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessTypeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedBusinessTypes.includes(option.value)
              
              return (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBusinessTypeToggle(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleBusinessTypeToggle(option.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold">{option.label}</span>
                        <Badge className={option.color}>{option.value}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clear-first" 
              checked={clearFirst} 
              onCheckedChange={setClearFirst}
              disabled={isSeeding}
            />
            <label htmlFor="clear-first" className="text-sm font-medium">
              Clear existing data before seeding
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Seeding Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Seeding Controls</CardTitle>
          <CardDescription>
            Start the multi-business seeding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={startSeeding} 
            disabled={isSeeding || selectedBusinessTypes.length === 0}
            className="w-full"
            size="lg"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding {selectedBusinessTypes.length} Business{selectedBusinessTypes.length > 1 ? 'es' : ''}...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Seed {selectedBusinessTypes.length} Business{selectedBusinessTypes.length > 1 ? 'es' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Seeding Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progress.businessesCompleted}/{progress.totalBusinesses} businesses</span>
              </div>
              <Progress value={getOverallProgressPercentage()} className="h-2" />
            </div>
            
            {/* Current Business Progress */}
            {progress.currentBusiness && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current: {progress.currentBusiness}</span>
                  <span>{progress.progress}/{progress.total} steps</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
            )}
            
            {/* Current Step */}
            <div className="text-sm text-muted-foreground">
              <strong>{progress.step}:</strong> {progress.message}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Seeding Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.businessName}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {result.businessType}
                        {result.businessId && ` • ID: ${result.businessId.slice(0, 8)}...`}
                      </div>
                    </div>
                  </div>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
            
            {results.some(r => !r.success) && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some businesses failed to seed. Check the logs below for details.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Statistics */}
      {businessStats && (
        <Card>
          <CardHeader>
            <CardTitle>Database Statistics</CardTitle>
            <CardDescription>
              Current businesses in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{businessStats.totalBusinesses}</div>
                <div className="text-sm text-muted-foreground">Total Businesses</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{businessStats.businessTypes.coffee || 0}</div>
                <div className="text-sm text-muted-foreground">Coffee Shops</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{businessStats.businessTypes.bakery || 0}</div>
                <div className="text-sm text-muted-foreground">Bakeries</div>
              </div>
            </div>
            
            {businessStats.businesses.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Businesses:</h4>
                <div className="space-y-2">
                  {businessStats.businesses.map((business) => (
                    <div key={business.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{business.name}</div>
                        <div className="text-sm text-muted-foreground">{business.description}</div>
                      </div>
                      <Badge variant="outline">{business.id.slice(0, 8)}...</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seeding Logs */}
      {seedingLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seeding Logs</CardTitle>
            <CardDescription>
              Detailed progress and error information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {seedingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground font-mono text-xs">
                    {log.timestamp}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {log.business}
                  </Badge>
                  <span className="font-medium">{log.step}:</span>
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-600' : 
                    log.type === 'success' ? 'text-green-600' : 
                    'text-foreground'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/seed-multi-business')({
  component: MultiBusinessSeed,
})

export default MultiBusinessSeed