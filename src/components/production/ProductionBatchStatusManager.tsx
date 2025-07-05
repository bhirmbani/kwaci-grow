import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Factory, Clock, Play, CheckCircle, ArrowRight } from 'lucide-react'
import { useProduction } from '@/hooks/useProduction'
import type { ProductionBatchWithItems, ProductionBatchStatus } from '@/lib/db/schema'

interface ProductionBatchStatusManagerProps {
  showTitle?: boolean
  maxItems?: number
  compact?: boolean
  batches?: ProductionBatchWithItems[]
  loading?: boolean
  error?: string | null
}

export function ProductionBatchStatusManager({
  showTitle = true,
  maxItems = 5,
  compact = false,
  batches: propBatches,
  loading: propLoading,
  error: propError
}: ProductionBatchStatusManagerProps) {
  const { batches: hookBatches, updateBatchStatus, loading: hookLoading, error: hookError } = useProduction()
  const [updatingBatch, setUpdatingBatch] = useState<string | null>(null)

  // Use props if provided, otherwise fall back to hook
  const batches = propBatches ?? hookBatches
  const loading = propLoading ?? hookLoading
  const error = propError ?? hookError

  // Filter to show only non-completed batches for quick status management
  const allActiveBatches = batches.filter(batch => batch.status !== 'Completed')
  const activeBatches = allActiveBatches.slice(0, maxItems)

  const getStatusIcon = (status: ProductionBatchStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'In Progress':
        return <Play className="h-4 w-4" />
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ProductionBatchStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getNextStatus = (currentStatus: ProductionBatchStatus): ProductionBatchStatus | null => {
    switch (currentStatus) {
      case 'Pending':
        return 'In Progress'
      case 'In Progress':
        return 'Completed'
      default:
        return null
    }
  }

  const handleStatusChange = async (batchId: string, newStatus: ProductionBatchStatus) => {
    setUpdatingBatch(batchId)
    try {
      const result = await updateBatchStatus(batchId, newStatus)
      if (!result.success) {
        console.error('Failed to update batch status:', result.error)
      }
    } catch (error) {
      console.error('Error updating batch status:', error)
    } finally {
      setUpdatingBatch(null)
    }
  }

  const handleQuickStatusAdvance = async (batchId: string, currentStatus: ProductionBatchStatus) => {
    const nextStatus = getNextStatus(currentStatus)
    if (nextStatus) {
      await handleStatusChange(batchId, nextStatus)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading production batches...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading production batches: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Production Batch Status
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage active production batches and update their status
          </p>
        </CardHeader>
      )}
      <CardContent>
        {activeBatches.length === 0 ? (
          <div className="text-center py-6">
            <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No active production batches. Create one using Quick Production Allocation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {compact ? (
              // Compact view for warehouse integration
              <div className="space-y-2">
                {activeBatches.map((batch) => {
                  const nextStatus = getNextStatus(batch.status)
                  const isUpdating = updatingBatch === batch.id

                  return (
                    <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(batch.status)} flex items-center gap-1`}>
                          {getStatusIcon(batch.status)}
                          {batch.status}
                        </Badge>
                        <div>
                          <span className="font-medium">Batch #{batch.batchNumber}</span>
                          <p className="text-xs text-muted-foreground">
                            {batch.items.length} items • {new Date(batch.dateCreated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {nextStatus && (
                          <>
                            {nextStatus === 'Completed' ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    disabled={isUpdating}
                                    className="flex items-center gap-1"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                    Complete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Production Batch</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to mark Batch #{batch.batchNumber} as completed? 
                                      This will permanently consume the allocated ingredients from stock.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleQuickStatusAdvance(batch.id, batch.status)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Complete Batch
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() => handleQuickStatusAdvance(batch.id, batch.status)}
                                className="flex items-center gap-1"
                              >
                                <ArrowRight className="h-3 w-3" />
                                {nextStatus}
                              </Button>
                            )}
                          </>
                        )}
                        
                        <Select
                          value={batch.status}
                          onValueChange={(value) => handleStatusChange(batch.id, value as ProductionBatchStatus)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Full table view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBatches.map((batch) => {
                    const nextStatus = getNextStatus(batch.status)
                    const isUpdating = updatingBatch === batch.id

                    return (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">#{batch.batchNumber}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(batch.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(batch.status)}
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{batch.items.length} items</TableCell>
                        <TableCell>{new Date(batch.dateCreated).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {nextStatus && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() => handleQuickStatusAdvance(batch.id, batch.status)}
                                className="flex items-center gap-1"
                              >
                                <ArrowRight className="h-3 w-3" />
                                {nextStatus}
                              </Button>
                            )}
                            
                            <Select
                              value={batch.status}
                              onValueChange={(value) => handleStatusChange(batch.id, value as ProductionBatchStatus)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
            
            {batches.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {allActiveBatches.length > maxItems ? (
                  <>Showing {activeBatches.length} of {allActiveBatches.length} active batches. </>
                ) : (
                  <>Showing {activeBatches.length} active batch{activeBatches.length !== 1 ? 'es' : ''}. </>
                )}
                View all {batches.length} batch{batches.length !== 1 ? 'es' : ''} in Production page.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
