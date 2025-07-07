import { useState, useEffect } from 'react'
import { Plus, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,

} from '@/components/ui/sheet'
import { MenuCard } from './MenuCard'
import { MenuList } from './MenuList'
import { MenuForm } from './MenuForm'
import { MenuDetailsView } from './MenuDetailsView'
import { BranchAssignment } from './BranchAssignment'
import { BranchList } from './BranchList'
import { BranchForm } from './BranchForm'
import { SalesTargetList } from './SalesTargetList'
import { SalesTargetForm } from './SalesTargetForm'
import { MenuService } from '@/lib/services/menuService'
import { BranchService } from '@/lib/services/branchService'
import { SalesTargetService, type SalesTargetWithDetails } from '@/lib/services/salesTargetService'
import type { MenuWithProductCount, MenuWithProducts, Branch, BranchWithMenus } from '@/lib/db/schema'

type ViewMode = 'grid' | 'list'

export function MenuManagement() {
  const [menus, setMenus] = useState<MenuWithProductCount[]>([])
  const [branches, setBranches] = useState<BranchWithMenus[]>([])
  const [salesTargets, setSalesTargets] = useState<SalesTargetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Sheet states
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isMenuDetailsSheetOpen, setIsMenuDetailsSheetOpen] = useState(false)
  const [isBranchAssignmentSheetOpen, setIsBranchAssignmentSheetOpen] = useState(false)
  const [isCreateBranchSheetOpen, setIsCreateBranchSheetOpen] = useState(false)
  const [isEditBranchSheetOpen, setIsEditBranchSheetOpen] = useState(false)
  const [isCreateTargetSheetOpen, setIsCreateTargetSheetOpen] = useState(false)
  const [isEditTargetSheetOpen, setIsEditTargetSheetOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuWithProductCount | null>(null)
  const [viewingMenu, setViewingMenu] = useState<MenuWithProducts | null>(null)
  const [assigningMenu, setAssigningMenu] = useState<MenuWithProductCount | null>(null)
  const [editingBranch, setEditingBranch] = useState<BranchWithMenus | null>(null)
  const [editingTarget, setEditingTarget] = useState<SalesTargetWithDetails | null>(null)

  // Load data
  const loadMenus = async () => {
    try {
      setLoading(true)
      const menusData = await MenuService.getAllWithProductCounts(includeInactive)
      setMenus(menusData)
    } catch (error) {
      console.error('Failed to load menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBranches = async () => {
    try {
      const branchesData = await BranchService.getAllWithMenuCounts(includeInactive)
      setBranches(branchesData)
    } catch (error) {
      console.error('Failed to load branches:', error)
    }
  }

  const loadSalesTargets = async () => {
    try {
      const targetsData = await SalesTargetService.getAllWithDetails()
      setSalesTargets(targetsData)
    } catch (error) {
      console.error('Failed to load sales targets:', error)
    }
  }

  useEffect(() => {
    loadMenus()
    loadBranches()
    loadSalesTargets()
  }, [includeInactive])

  // Event handlers
  const handleCreateMenu = () => {
    setEditingMenu(null)
    setIsCreateSheetOpen(true)
  }

  const handleEditMenu = (menu: MenuWithProductCount) => {
    setEditingMenu(menu)
    setIsEditSheetOpen(true)
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await MenuService.delete(menuId)
      await loadMenus()
    } catch (error) {
      console.error('Failed to delete menu:', error)
    }
  }

  const handleAssignBranches = (menu: MenuWithProductCount) => {
    setAssigningMenu(menu)
    setIsBranchAssignmentSheetOpen(true)
  }

  const handleViewDetails = async (menu: MenuWithProductCount) => {
    try {
      const menuWithProducts = await MenuService.getWithProducts(menu.id)
      if (menuWithProducts) {
        setViewingMenu(menuWithProducts)
        setIsMenuDetailsSheetOpen(true)
      }
    } catch (error) {
      console.error('Failed to load menu details:', error)
    }
  }

  const handleFormSuccess = async () => {
    setIsCreateSheetOpen(false)
    setIsEditSheetOpen(false)
    setEditingMenu(null)
    await loadMenus()
  }

  const handleFormCancel = () => {
    setIsCreateSheetOpen(false)
    setIsEditSheetOpen(false)
    setEditingMenu(null)
  }

  const handleBranchAssignmentSuccess = async () => {
    setIsBranchAssignmentSheetOpen(false)
    setAssigningMenu(null)
    await loadMenus()
  }

  const handleBranchAssignmentCancel = () => {
    setIsBranchAssignmentSheetOpen(false)
    setAssigningMenu(null)
  }

  const handleMenuDetailsClose = () => {
    setIsMenuDetailsSheetOpen(false)
    setViewingMenu(null)
  }

  const handleMenuDetailsUpdated = async () => {
    await loadMenus()
    // Reload the viewing menu data
    if (viewingMenu) {
      const updatedMenu = await MenuService.getWithProducts(viewingMenu.id)
      if (updatedMenu) {
        setViewingMenu(updatedMenu)
      }
    }
  }

  // Branch handlers
  const handleCreateBranch = () => {
    setEditingBranch(null)
    setIsCreateBranchSheetOpen(true)
  }

  const handleEditBranch = (branch: BranchWithMenus) => {
    setEditingBranch(branch)
    setIsEditBranchSheetOpen(true)
  }

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await BranchService.delete(branchId)
      await loadBranches()
    } catch (error) {
      console.error('Failed to delete branch:', error)
    }
  }

  const handleViewBranchMenus = (branch: BranchWithMenus) => {
    // TODO: Implement branch menu view
    console.log('View menus for branch:', branch.name)
  }

  const handleBranchFormSuccess = async () => {
    setIsCreateBranchSheetOpen(false)
    setIsEditBranchSheetOpen(false)
    setEditingBranch(null)
    await loadBranches()
  }

  const handleBranchFormCancel = () => {
    setIsCreateBranchSheetOpen(false)
    setIsEditBranchSheetOpen(false)
    setEditingBranch(null)
  }

  // Sales target handlers
  const handleCreateTarget = () => {
    setEditingTarget(null)
    setIsCreateTargetSheetOpen(true)
  }

  const handleEditTarget = (target: SalesTargetWithDetails) => {
    setEditingTarget(target)
    setIsEditTargetSheetOpen(true)
  }

  const handleDeleteTarget = async (targetId: string) => {
    try {
      await SalesTargetService.deleteTarget(targetId)
      await loadSalesTargets()
    } catch (error) {
      console.error('Failed to delete sales target:', error)
    }
  }

  const handleTargetFormSuccess = async () => {
    setIsCreateTargetSheetOpen(false)
    setIsEditTargetSheetOpen(false)
    setEditingTarget(null)
    await loadSalesTargets()
  }

  const handleTargetFormCancel = () => {
    setIsCreateTargetSheetOpen(false)
    setIsEditTargetSheetOpen(false)
    setEditingTarget(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading menus...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Create and manage your coffee shop menus with products and pricing
          </p>
        </div>
        <Button onClick={handleCreateMenu}>
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="menus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="targets">Sales Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Menu Filters & View</CardTitle>
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Include Inactive Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-inactive"
                        checked={includeInactive}
                        onCheckedChange={setIncludeInactive}
                      />
                      <Label htmlFor="include-inactive" className="text-sm font-medium">
                        Show inactive menus
                      </Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Menu Display */}
            {menus.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No menus found</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first menu
                    </p>
                    <Button onClick={handleCreateMenu}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    onEdit={handleEditMenu}
                    onDelete={handleDeleteMenu}
                    onAssignBranches={handleAssignBranches}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <MenuList
                menus={menus}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAssignBranches={handleAssignBranches}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="branches">
          <div className="space-y-4">
            {/* Branch Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Branch Management</h2>
                <p className="text-muted-foreground">
                  Manage your coffee shop locations and their menu assignments
                </p>
              </div>
              <Button onClick={handleCreateBranch}>
                <Plus className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </div>

            {/* Branch Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Branch Filters & View</CardTitle>
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Include Inactive Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-inactive-branches"
                        checked={includeInactive}
                        onCheckedChange={setIncludeInactive}
                      />
                      <Label htmlFor="include-inactive-branches" className="text-sm font-medium">
                        Show inactive branches
                      </Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Branch Display */}
            <BranchList
              branches={branches}
              onEdit={handleEditBranch}
              onDelete={handleDeleteBranch}
              onViewMenus={handleViewBranchMenus}
              viewMode={viewMode}
            />
          </div>
        </TabsContent>

        <TabsContent value="targets">
          <div className="space-y-4">
            {/* Sales Target Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Sales Target Management</h2>
                <p className="text-muted-foreground">
                  Set and track daily sales targets for your menus and branches
                </p>
              </div>
              <Button onClick={handleCreateTarget}>
                <Plus className="h-4 w-4 mr-2" />
                Create Target
              </Button>
            </div>

            {/* Sales Target Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Target Filters & View</CardTitle>
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Sales Target Display */}
            <SalesTargetList
              targets={salesTargets}
              onEdit={handleEditTarget}
              onDelete={handleDeleteTarget}
              onCreateNew={handleCreateTarget}
              viewMode={viewMode}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Menu Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Create New Menu</SheetTitle>
            <SheetDescription>
              Add a new menu to your coffee shop catalog
            </SheetDescription>
          </SheetHeader>
          <MenuForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Menu Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Menu</SheetTitle>
            <SheetDescription>
              Update menu details and settings
            </SheetDescription>
          </SheetHeader>
          <MenuForm
            menu={editingMenu || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Branch Assignment Sheet */}
      <Sheet open={isBranchAssignmentSheetOpen} onOpenChange={setIsBranchAssignmentSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Assign Branches</SheetTitle>
            <SheetDescription>
              Select which branches this menu should be available at
            </SheetDescription>
          </SheetHeader>
          {assigningMenu && (
            <BranchAssignment
              menu={assigningMenu}
              onSuccess={handleBranchAssignmentSuccess}
              onCancel={handleBranchAssignmentCancel}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create Branch Sheet */}
      <Sheet open={isCreateBranchSheetOpen} onOpenChange={setIsCreateBranchSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Create New Branch</SheetTitle>
            <SheetDescription>
              Add a new branch location to your coffee shop network
            </SheetDescription>
          </SheetHeader>
          <BranchForm
            onSuccess={handleBranchFormSuccess}
            onCancel={handleBranchFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Branch Sheet */}
      <Sheet open={isEditBranchSheetOpen} onOpenChange={setIsEditBranchSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Branch</SheetTitle>
            <SheetDescription>
              Update branch details and settings
            </SheetDescription>
          </SheetHeader>
          <BranchForm
            branch={editingBranch || undefined}
            onSuccess={handleBranchFormSuccess}
            onCancel={handleBranchFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Create Sales Target Sheet */}
      <Sheet open={isCreateTargetSheetOpen} onOpenChange={setIsCreateTargetSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Create Sales Target</SheetTitle>
            <SheetDescription>
              Set a daily sales target for a specific menu and branch
            </SheetDescription>
          </SheetHeader>
          <SalesTargetForm
            onSuccess={handleTargetFormSuccess}
            onCancel={handleTargetFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Sales Target Sheet */}
      <Sheet open={isEditTargetSheetOpen} onOpenChange={setIsEditTargetSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Sales Target</SheetTitle>
            <SheetDescription>
              Update sales target amount and details
            </SheetDescription>
          </SheetHeader>
          {editingTarget && (
            <SalesTargetForm
              target={editingTarget}
              onSuccess={handleTargetFormSuccess}
              onCancel={handleTargetFormCancel}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Menu Details Sheet */}
      <Sheet open={isMenuDetailsSheetOpen} onOpenChange={setIsMenuDetailsSheetOpen}>
        <SheetContent className="w-[1000px] sm:w-[1000px] max-w-[90vw]">
          <SheetHeader>
            <SheetTitle>Menu Details</SheetTitle>
            <SheetDescription>
              Manage products and settings for this menu
            </SheetDescription>
          </SheetHeader>
          {viewingMenu && (
            <MenuDetailsView
              menu={viewingMenu}
              onClose={handleMenuDetailsClose}
              onMenuUpdated={handleMenuDetailsUpdated}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleCreateMenu}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Create Menu</span>
        </Button>
      </div>
    </div>
  )
}
