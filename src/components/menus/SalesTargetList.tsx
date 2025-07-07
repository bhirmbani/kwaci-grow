import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Target, Calendar, TrendingUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/utils/formatters'
import type { SalesTargetWithDetails } from '@/lib/services/salesTargetService'

interface SalesTargetListProps {
  targets: SalesTargetWithDetails[]
  onEdit: (target: SalesTargetWithDetails) => void
  onDelete: (targetId: string) => void
  onCreateNew: () => void
  viewMode: 'list' | 'grid'
}

export function SalesTargetList({ targets, onEdit, onDelete, onCreateNew, viewMode }: SalesTargetListProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId)
      setDeleteTargetId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString < today
  }

  if (targets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sales targets found</h3>
          <p className="text-muted-foreground mb-4 text-center">
            Set daily sales targets to track performance and motivate your team
          </p>
          <Button onClick={onCreateNew}>
            <Target className="h-4 w-4 mr-2" />
            Create Sales Target
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map((target) => (
            <Card key={target.id} className="group hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-foreground truncate">
                      {target.menu.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{target.branch.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(target)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Target
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteTargetId(target.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Target
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Date */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(target.targetDate)}
                    {isToday(target.targetDate) && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Today
                      </span>
                    )}
                    {isPast(target.targetDate) && !isToday(target.targetDate) && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Past
                      </span>
                    )}
                  </span>
                </div>

                {/* Target Amount */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(target.targetAmount)}
                    </p>
                  </div>
                </div>

                {/* Note */}
                {target.note && (
                  <div className="mt-3 p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium">Note:</span> {target.note}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onEdit(target)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sales Target</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this sales target? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete Target
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // List view
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Target Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targets.map((target) => (
              <TableRow 
                key={target.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEdit(target)}
              >
                <TableCell className="font-medium">
                  <p className="font-semibold">{target.menu.name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{target.branch.name}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatDate(target.targetDate)}
                    </span>
                    {isToday(target.targetDate) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Today
                      </span>
                    )}
                    {isPast(target.targetDate) && !isToday(target.targetDate) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Past
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(target.targetAmount)}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                    {target.note || '-'}
                  </p>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(target); }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Target
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(target.id); }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Target
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sales Target</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sales target? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Target
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
