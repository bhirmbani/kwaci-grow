import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  SheetTrigger,
} from '@/components/ui/sheet'
import { MenuCard } from './MenuCard'
import { MenuList } from './MenuList'
import { MenuForm } from './MenuForm'
import { MenuDetailsView } from './MenuDetailsView'
import { BranchMenuView } from './BranchMenuView'
import { BranchAssignment } from './BranchAssignment'
import { BranchList } from './BranchList'
import { BranchForm } from './BranchForm'
import { useMenus } from '@/hooks/useMenus'
import { useBranches } from '@/hooks/useBranches'
import type { MenuWithProductCount, MenuWithProducts, BranchWithMenus } from '@/lib/db/schema'

type ViewMode = 'grid' | 'list'

export function MenuManagement() {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { t } = useTranslation()
  
  // Use business-reactive hooks
  const { 
    menus, 
    loading: menusLoading, 
    deleteMenu, 
    getMenuWithProducts, 
    refetch: refetchMenus 
  } = useMenus(includeInactive)
  
  const { 
    branches, 
    loading: branchesLoading, 
    deleteBranch, 
    getBranchWithMenus,
    refetch: refetchBranches 
  } = useBranches(includeInactive)
  
  const loading = menusLoading || branchesLoading

  // Sheet states
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isMenuDetailsSheetOpen, setIsMenuDetailsSheetOpen] = useState(false)
  const [isBranchMenuSheetOpen, setIsBranchMenuSheetOpen] = useState(false)
  const [isBranchAssignmentSheetOpen, setIsBranchAssignmentSheetOpen] = useState(false)
  const [isCreateBranchSheetOpen, setIsCreateBranchSheetOpen] = useState(false)
  const [isEditBranchSheetOpen, setIsEditBranchSheetOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuWithProductCount | null>(null)
  const [viewingMenu, setViewingMenu] = useState<MenuWithProducts | null>(null)
  const [viewingBranch, setViewingBranch] = useState<BranchWithMenus | null>(null)
  const [assigningMenu, setAssigningMenu] = useState<MenuWithProductCount | null>(null)
  const [editingBranch, setEditingBranch] = useState<BranchWithMenus | null>(null)

  // No need for manual data loading - hooks handle this automatically

  // Event handlers

  const handleEditMenu = (menu: MenuWithProductCount) => {
    setEditingMenu(menu)
    setIsEditSheetOpen(true)
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenu(menuId)
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
      const menuWithProducts = await getMenuWithProducts(menu.id)
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
    await refetchMenus()
  }

  const handleFormCancel = () => {
    setIsCreateSheetOpen(false)
    setIsEditSheetOpen(false)
    setEditingMenu(null)
  }

  const handleBranchAssignmentSuccess = async () => {
    setIsBranchAssignmentSheetOpen(false)
    setAssigningMenu(null)
    await refetchMenus()
  }

  const handleBranchAssignmentCancel = () => {
    setIsBranchAssignmentSheetOpen(false)
    setAssigningMenu(null)
  }



  const handleMenuDetailsUpdated = async () => {
    await refetchMenus()
    // Reload the viewing menu data
    if (viewingMenu) {
      const updatedMenu = await getMenuWithProducts(viewingMenu.id)
      if (updatedMenu) {
        setViewingMenu(updatedMenu)
      }
    }
  }

  const handleBranchMenuClose = () => {
    setIsBranchMenuSheetOpen(false)
    setViewingBranch(null)
  }

  const handleBranchMenuUpdated = async () => {
    await refetchBranches()
    // Reload the viewing branch data
    if (viewingBranch) {
      const updatedBranch = await getBranchWithMenus(viewingBranch.id)
      if (updatedBranch) {
        setViewingBranch(updatedBranch)
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
      await deleteBranch(branchId)
    } catch (error) {
      console.error('Failed to delete branch:', error)
    }
  }

  const handleViewBranchMenus = async (branch: BranchWithMenus) => {
    try {
      const branchWithMenus = await getBranchWithMenus(branch.id)
      if (branchWithMenus) {
        setViewingBranch(branchWithMenus)
        setIsBranchMenuSheetOpen(true)
      }
    } catch (error) {
      console.error('Failed to load branch menu details:', error)
    }
  }

  const handleBranchFormSuccess = async () => {
    setIsCreateBranchSheetOpen(false)
    setIsEditBranchSheetOpen(false)
    setEditingBranch(null)
    await refetchBranches()
  }

  const handleBranchFormCancel = () => {
    setIsCreateBranchSheetOpen(false)
    setIsEditBranchSheetOpen(false)
    setEditingBranch(null)
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
          <h1 className="text-2xl font-bold">{t('menus.management.title')}</h1>
          <p className="text-muted-foreground">
            {t('menus.management.description')}
          </p>
        </div>
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('menus.management.createMenu')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="menus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="menus">{t('menus.management.tabs.menus')}</TabsTrigger>
          <TabsTrigger value="branches">{t('menus.management.tabs.branches')}</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('menus.management.menuFiltersView')}</CardTitle>
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
                        {t('menus.management.showInactive')}
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
                    <h3 className="text-lg font-semibold mb-2">{t('menus.management.noMenus')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('menus.management.noMenusHint')}
                    </p>
                    <Button onClick={() => setIsCreateSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('menus.management.createMenu')}
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
                <h2 className="text-xl font-semibold">{t('menus.management.branch.title')}</h2>
                <p className="text-muted-foreground">
                  {t('menus.management.branch.description')}
                </p>
              </div>
              <Button onClick={handleCreateBranch}>
                <Plus className="h-4 w-4 mr-2" />
                {t('menus.management.branch.create')}
              </Button>
            </div>

            {/* Branch Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('menus.management.branch.filtersTitle')}</CardTitle>
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
                        {t('menus.management.branch.showInactive')}
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


      </Tabs>



      {/* Edit Menu Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.editMenuSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.editMenuSheet.description')}
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
        <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.assignBranchesSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.assignBranchesSheet.description')}
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
        <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.createBranchSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.createBranchSheet.description')}
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
        <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.editBranchSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.editBranchSheet.description')}
            </SheetDescription>
          </SheetHeader>
          <BranchForm
            branch={editingBranch || undefined}
            onSuccess={handleBranchFormSuccess}
            onCancel={handleBranchFormCancel}
          />
        </SheetContent>
      </Sheet>



      {/* Menu Details Sheet */}
      <Sheet open={isMenuDetailsSheetOpen} onOpenChange={setIsMenuDetailsSheetOpen}>
        <SheetContent className="w-[1000px] sm:w-[1000px] max-w-[90vw] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.menuDetailsSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.menuDetailsSheet.description')}
            </SheetDescription>
          </SheetHeader>
          {viewingMenu && (
            <MenuDetailsView
              menu={viewingMenu}
              onMenuUpdated={handleMenuDetailsUpdated}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Branch Menu View Sheet */}
      <Sheet open={isBranchMenuSheetOpen} onOpenChange={setIsBranchMenuSheetOpen}>
        <SheetContent className="w-[1000px] sm:w-[1000px] max-w-[90vw] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('menus.management.branchMenuSheet.title')}</SheetTitle>
            <SheetDescription>
              {t('menus.management.branchMenuSheet.description')}
            </SheetDescription>
          </SheetHeader>
          {viewingBranch && (
            <BranchMenuView
              branch={viewingBranch}
              onClose={handleBranchMenuClose}
              onBranchUpdated={handleBranchMenuUpdated}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6">
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label="Create Menu"
            onClick={() => setIsCreateSheetOpen(true)}
          >
            <Plus className="text-primary-foreground m-auto flex h-8 w-8" />
          </SheetTrigger>
        <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('menus.management.createMenuSheet.title')}</SheetTitle>
              <SheetDescription>
                {t('menus.management.createMenuSheet.description')}
              </SheetDescription>
            </SheetHeader>
            <MenuForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
