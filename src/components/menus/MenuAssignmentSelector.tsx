import { useState, useEffect } from 'react'
import { Search, BookOpen, Plus, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MenuService } from '@/lib/services/menuService'
import type { Menu } from '@/lib/db/schema'

interface MenuAssignmentSelectorProps {
  branchId: string
  existingMenuIds: string[]
  onMenuAssigned: () => void
  onCancel: () => void
}

export function MenuAssignmentSelector({ 
  branchId, 
  existingMenuIds, 
  onMenuAssigned, 
  onCancel 
}: MenuAssignmentSelectorProps) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)

  // Load menus
  const loadMenus = async () => {
    try {
      setLoading(true)
      const allMenus = await MenuService.getAll(false) // Only active menus
      setMenus(allMenus)
    } catch (error) {
      console.error('Failed to load menus:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  // Filter menus
  const availableMenus = menus.filter(menu => 
    !existingMenuIds.includes(menu.id)
  )

  const filteredMenus = availableMenus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectMenu = async (menu: Menu) => {
    if (assigning) return

    try {
      setAssigning(menu.id)
      
      // Get current branches assigned to this menu
      const currentBranches = await MenuService.getAssignedBranches(menu.id)
      const currentBranchIds = currentBranches.map(b => b.id)
      
      // Add this branch to the menu's assignments
      const updatedBranchIds = [...currentBranchIds, branchId]
      
      await MenuService.assignToBranches(menu.id, updatedBranchIds)
      onMenuAssigned()
    } catch (error) {
      console.error('Failed to assign menu to branch:', error)
    } finally {
      setAssigning(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menus by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Menus Grid */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {availableMenus.length === 0 
              ? 'All menus already assigned'
              : searchQuery 
                ? 'No menus found'
                : 'No menus available'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {availableMenus.length === 0 
              ? 'All available menus have been assigned to this branch'
              : searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create some menus first to assign them to branches'
            }
          </p>
          {availableMenus.length === 0 && (
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {filteredMenus.map((menu) => (
            <Card 
              key={menu.id} 
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => handleSelectMenu(menu)}
            >
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
                  <Button 
                    size="sm" 
                    className="ml-2"
                    disabled={assigning === menu.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectMenu(menu)
                    }}
                  >
                    {assigning === menu.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                    ) : (
                      <Plus className="h-3 w-3 mr-1" />
                    )}
                    {assigning === menu.id ? 'Assigning...' : 'Assign'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Description */}
                {menu.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {menu.description}
                  </p>
                )}

                {/* Note */}
                {menu.note && (
                  <div className="mt-3 p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium">Note:</span> {menu.note}
                    </p>
                  </div>
                )}

                {/* Status and Date */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Badge 
                    variant={menu.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {menu.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(menu.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredMenus.length > 0 && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p>
            Showing {filteredMenus.length} of {availableMenus.length} available menus
            {existingMenuIds.length > 0 && (
              <span> ({existingMenuIds.length} already assigned)</span>
            )}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
