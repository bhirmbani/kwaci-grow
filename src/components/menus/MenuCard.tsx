import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, MapPin, Coffee, Building2, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { MenuWithProductCount } from '@/lib/db/schema'

interface MenuCardProps {
  menu: MenuWithProductCount
  onEdit: (menu: MenuWithProductCount) => void
  onDelete: (menuId: string) => void
  onAssignBranches: (menu: MenuWithProductCount) => void
  onViewDetails: (menu: MenuWithProductCount) => void
}

export function MenuCard({ menu, onEdit, onDelete, onAssignBranches, onViewDetails }: MenuCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    onDelete(menu.id)
    setShowDeleteDialog(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => onViewDetails(menu)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">
                {menu.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getStatusColor(menu.status)}`}
                >
                  {menu.status}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(menu); }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Menu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssignBranches(menu); }}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Assign Branches
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Menu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Description */}
          {menu.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {menu.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
                <Coffee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-sm font-medium">{menu.productCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Branches</p>
                <p className="text-sm font-medium">{menu.branchCount}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          {menu.note && (
            <div className="mt-3 p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium">Note:</span> {menu.note}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); onViewDetails(menu); }}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); onEdit(menu); }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{menu.name}"? This action will set the menu status to inactive.
              You can reactivate it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
