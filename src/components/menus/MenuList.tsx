import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, MapPin, ArrowUpDown, BookOpen } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface MenuListProps {
  menus: MenuWithProductCount[]
  onEdit: (menu: MenuWithProductCount) => void
  onDelete: (menuId: string) => void
  onAssignBranches: (menu: MenuWithProductCount) => void
  onViewDetails: (menu: MenuWithProductCount) => void
}

type SortField = 'name' | 'status' | 'productCount' | 'branchCount' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function MenuList({ menus, onEdit, onDelete, onAssignBranches, onViewDetails }: MenuListProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMenus = [...menus].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle date sorting
    if (sortField === 'createdAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = () => {
    if (deleteMenuId) {
      onDelete(deleteMenuId)
      setDeleteMenuId(null)
    }
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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No menus found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name">Name</SortableHeader>
              <TableHead>Description</TableHead>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="productCount">Products</SortableHeader>
              <SortableHeader field="branchCount">Branches</SortableHeader>
              <SortableHeader field="createdAt">Created</SortableHeader>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMenus.map((menu) => (
              <TableRow 
                key={menu.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewDetails(menu)}
              >
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{menu.name}</p>
                    {menu.note && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {menu.note}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                    {menu.description || '-'}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(menu.status)}`}
                  >
                    {menu.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{menu.productCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{menu.branchCount}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(menu.createdAt).toLocaleDateString()}
                  </span>
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
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(menu); }}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Products
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
                        onClick={(e) => { e.stopPropagation(); setDeleteMenuId(menu.id); }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Menu
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
      <AlertDialog open={!!deleteMenuId} onOpenChange={() => setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu? This action will set the menu status to inactive.
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
