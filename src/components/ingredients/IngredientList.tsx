import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Search, Package, Filter } from 'lucide-react'
import { useIngredients, useIngredientCategories } from '@/hooks/useIngredients'
import { IngredientForm } from './IngredientForm'
import { IngredientUsage } from './IngredientUsage'
import { formatCurrency } from '@/utils/formatters'
import type { Ingredient } from '@/lib/db/schema'

interface IngredientListProps {
  ingredients: Array<Ingredient & { usageCount: number }>
  onIngredientsChange: () => void
}

export function IngredientList({ ingredients, onIngredientsChange }: IngredientListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false)
  const { deleteIngredient } = useIngredients()
  const { categories } = useIngredientCategories()

  // Filter ingredients based on search query and category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ingredient.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ingredient.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setIsEditSheetOpen(true)
  }

  const handleView = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsViewSheetOpen(true)
  }

  const handleDelete = async (ingredient: Ingredient) => {
    const result = await deleteIngredient(ingredient.id)
    if (result.success) {
      onIngredientsChange()
    }
  }

  const handleEditSuccess = () => {
    setIsEditSheetOpen(false)
    setEditingIngredient(null)
    onIngredientsChange()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ingredients ({filteredIngredients.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || categoryFilter !== 'all' ? 'No ingredients found' : 'No ingredients yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Create your first ingredient to get started'
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients.map((ingredient) => {
                const unitCost = ingredient.baseUnitQuantity > 0 
                  ? ingredient.baseUnitCost / ingredient.baseUnitQuantity 
                  : 0

                return (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>
                      {ingredient.category ? (
                        <Badge variant="outline">{ingredient.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ingredient.unit}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(unitCost)}</TableCell>
                    <TableCell>
                      <Badge variant={ingredient.usageCount > 0 ? 'default' : 'secondary'}>
                        {ingredient.usageCount} products
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ingredient.isActive ? 'default' : 'secondary'}>
                        {ingredient.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View Usage */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(ingredient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ingredient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{ingredient.name}"? 
                                {ingredient.usageCount > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {' '}This ingredient is used in {ingredient.usageCount} products and cannot be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ingredient)}
                                disabled={ingredient.usageCount > 0}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Edit Ingredient Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Ingredient</SheetTitle>
              <SheetDescription>
                Update ingredient information
              </SheetDescription>
            </SheetHeader>
            {editingIngredient && (
              <IngredientForm
                ingredient={editingIngredient}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditSheetOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* View Ingredient Usage Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent className="w-[800px] sm:w-[800px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Ingredient Usage</SheetTitle>
              <SheetDescription>
                View which products use this ingredient
              </SheetDescription>
            </SheetHeader>
            {selectedIngredient && (
              <IngredientUsage
                ingredientId={selectedIngredient.id}
                ingredientName={selectedIngredient.name}
                onClose={() => setIsViewSheetOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}
