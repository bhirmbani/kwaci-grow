import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Factory, Edit, Trash2, Eye, CheckCircle, Clock, Play } from 'lucide-react'
import { useProduction } from '@/hooks/useProduction'
import type { ProductionBatchWithItems, ProductionBatchStatus } from '@/lib/db/schema'

interface ProductionBatchListProps {
  batches: ProductionBatchWithItems[]
}

export function ProductionBatchList({ batches }: ProductionBatchListProps) {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatchWithItems | null>(null)
  const [editingBatch, setEditingBatch] = useState<ProductionBatchWithItems | null>(null)
  const [editNote, setEditNote] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProductionBatchStatus>('all')
  const { updateBatchStatus, deleteBatch, updateBatch } = useProduction()

  // Filter batches based on status
  const filteredBatches = batches.filter(batch => 
    statusFilter === 'all' || batch.status === statusFilter
  )

  const handleStatusChange = async (batchId: string, newStatus: ProductionBatchStatus) => {
    const result = await updateBatchStatus(batchId, newStatus)
    if (!result.success) {
      console.error('Failed to update batch status:', result.error)
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    const result = await deleteBatch(batchId)
    if (!result.success) {
      console.error('Failed to delete batch:', result.error)
    }
  }

  const handleUpdateNote = async () => {
    if (!editingBatch) return
    
    const result = await updateBatch(editingBatch.id, { note: editNote })
    if (result.success) {
      setEditingBatch(null)
      setEditNote('')
    } else {
      console.error('Failed to update batch note:', result.error)
    }
  }

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

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Production Batches
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Filter by Status:</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredBatches.length} of {batches.length} batches
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'No production batches found. Create your first batch using Quick Production Allocation.'
                  : `No ${statusFilter.toLowerCase()} batches found.`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">#{batch.batchNumber}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(batch.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(batch.status)}
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(batch.dateCreated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{batch.items.length} items</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {batch.note || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBatch(batch)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[600px] sm:w-[600px]">
                            <SheetHeader>
                              <SheetTitle>Production Batch #{selectedBatch?.batchNumber}</SheetTitle>
                              <SheetDescription>
                                View and manage production batch details
                              </SheetDescription>
                            </SheetHeader>
                            {selectedBatch && (
                              <div className="space-y-6 mt-6">
                                {/* Batch Info */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Status:</span>
                                    <Select
                                      value={selectedBatch.status}
                                      onValueChange={(value) => handleStatusChange(selectedBatch.id, value as ProductionBatchStatus)}
                                      disabled={selectedBatch.status === 'Completed'}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Created:</span>
                                    <span>{new Date(selectedBatch.dateCreated).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-start justify-between">
                                    <span className="font-medium">Note:</span>
                                    <span className="text-right max-w-xs">{selectedBatch.note || 'No note'}</span>
                                  </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2">
                                  <h4 className="font-medium">Allocated Ingredients:</h4>
                                  <div className="border rounded-lg">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Ingredient</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Note</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedBatch.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.ingredientName}</TableCell>
                                            <TableCell>{item.quantity} {item.unit}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                              {item.note || '-'}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>

                        {/* Edit Note */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingBatch(batch)
                                setEditNote(batch.note || '')
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Edit Batch #{editingBatch?.batchNumber}</SheetTitle>
                              <SheetDescription>
                                Update the production batch note
                              </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                              <div className="space-y-2">
                                <Label htmlFor="edit-note">Batch Note</Label>
                                <Textarea
                                  id="edit-note"
                                  value={editNote}
                                  onChange={(e) => setEditNote(e.target.value)}
                                  placeholder="Add a note about this production batch..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateNote} className="flex-1">
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingBatch(null)
                                    setEditNote('')
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>

                        {/* Delete Batch */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Production Batch</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete Production Batch #{batch.batchNumber}? 
                                {batch.status !== 'Completed' && ' This will release all reserved stock.'}
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Batch
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
