import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Trash2, Search, ArrowUpDown, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { BranchService } from '@/lib/services/branchService'
import { MenuService } from '@/lib/services/menuService'
import { MenuAssignmentSelector } from './MenuAssignmentSelector'
import type { BranchWithMenus, Menu } from '@/lib/db/schema'

interface BranchMenuViewProps {
  branch: BranchWithMenus
  onClose: () => void
  onBranchUpdated: () => void
}

type SortField = 'name' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function BranchMenuView({ branch, onClose, onBranchUpdated }: BranchMenuViewProps) {
  const [branchData, setBranchData] = useState<BranchWithMenus>(branch)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [loading, setLoading] = useState(false)
  
  // Sheet states
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false)
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null)

  // Load branch data
  const loadBranchData = async () => {
    try {
      setLoading(true)
      const updatedBranch = await BranchService.getWithMenus(branch.id)
      if (updatedBranch) {
        setBranchData(updatedBranch)
      }
    } catch (error) {
      console.error('Failed to load branch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranchData()
  }, [branch.id])

  // Filter and sort menus
  const filteredMenus = branchData.menus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleAssignMenu = () => {
    setIsMenuSelectorOpen(true)
  }

  const handleUnassignMenu = (menu: Menu) => {
    setDeletingMenu(menu)
    setShowDeleteDialog(true)
  }

  const confirmUnassignMenu = async () => {
    if (!deletingMenu) return

    try {
      // Get current assigned menu IDs and remove the one we're unassigning
      const currentMenuIds = branchData.menus.map(m => m.id)
      const updatedMenuIds = currentMenuIds.filter(id => id !== deletingMenu.id)
      
      // Update each menu's branch assignments
      for (const menuId of currentMenuIds) {
        if (menuId === deletingMenu.id) {
          // For the menu we're unassigning, get its current branches and remove this branch
          const currentBranches = await MenuService.getAssignedBranches(menuId)
          const updatedBranchIds = currentBranches
            .filter(b => b.id !== branch.id)
            .map(b => b.id)
          await MenuService.assignToBranches(menuId, updatedBranchIds)
        }
      }

      await loadBranchData()
      onBranchUpdated()
      setShowDeleteDialog(false)
      setDeletingMenu(null)
    } catch (error) {
      console.error('Failed to unassign menu from branch:', error)
    }
  }

  const handleMenuAssigned = async () => {
    setIsMenuSelectorOpen(false)
    await loadBranchData()
    onBranchUpdated()
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
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Branch Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{branchData.name}</h2>
              {branchData.location && (
                <p className="text-muted-foreground mt-1">{branchData.location}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={
                  branchData.isActive 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {branchData.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {branchData.menus.length} menus assigned
                </span>
              </div>
            </div>
            <Button onClick={handleAssignMenu}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Menu
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Menus Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assigned Menus ({sortedMenus.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedMenus.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No menus found' : 'No menus assigned'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Assign menus to this branch to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleAssignMenu}>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Menu
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="name">Menu Name</SortableHeader>
                      <TableHead>Description</TableHead>
                      <SortableHeader field="status">Status</SortableHeader>
                      <SortableHeader field="createdAt">Created</SortableHeader>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMenus.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{menu.name}</p>
                            {menu.note && (
                              <p className="text-xs text-muted-foreground">{menu.note}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                            {menu.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${getStatusColor(menu.status)}`}
                          >
                            {menu.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(menu.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleUnassignMenu(menu)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Unassign
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Assignment Selector Sheet */}
      <Sheet open={isMenuSelectorOpen} onOpenChange={setIsMenuSelectorOpen}>
        <SheetContent className="w-[800px] sm:w-[800px] bg-background/20 dark:bg-background/80 backdrop-blur-3xl">
          <SheetHeader>
            <SheetTitle>Assign Menu to Branch</SheetTitle>
            <SheetDescription>
              Select a menu to assign to "{branchData.name}"
            </SheetDescription>
          </SheetHeader>
          <MenuAssignmentSelector
            branchId={branchData.id}
            existingMenuIds={branchData.menus.map(m => m.id)}
            onMenuAssigned={handleMenuAssigned}
            onCancel={() => setIsMenuSelectorOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Menu from Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign "{deletingMenu?.name}" from this branch?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnassignMenu}
              className="bg-red-600 hover:bg-red-700"
            >
              Unassign Menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
