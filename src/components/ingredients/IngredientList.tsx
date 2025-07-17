import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  ingredients: Array<Ingredient & { usageCount: number; categoryName?: string }>
  onIngredientsChange: () => void
}

export function IngredientList({ ingredients, onIngredientsChange }: IngredientListProps) {
  const { t } = useTranslation()
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
                         (ingredient.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ingredient.categoryName === categoryFilter
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
            {t('ingredients.list.title', { count: filteredIngredients.length })}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('ingredients.list.allCategories')}</SelectItem>
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
                placeholder={t('ingredients.list.searchPlaceholder')}
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
              {searchQuery || categoryFilter !== 'all' ? t('ingredients.list.noIngredientsFound') : t('ingredients.list.createFirst')}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all'
                ? t('ingredients.list.tryAdjustSearch')
                : t('ingredients.list.createFirst')
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('ingredients.list.table.name')}</TableHead>
                <TableHead>{t('ingredients.list.table.category')}</TableHead>
                <TableHead>{t('ingredients.list.table.unit')}</TableHead>
                <TableHead>{t('ingredients.list.table.unitCost')}</TableHead>
                <TableHead>{t('ingredients.list.table.usage')}</TableHead>
                <TableHead>{t('ingredients.list.table.status')}</TableHead>
                <TableHead>{t('ingredients.list.table.actions')}</TableHead>
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
                      {ingredient.categoryName ? (
                        <Badge variant="outline">{ingredient.categoryName}</Badge>
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
                        {t('ingredients.overview.usedInProducts', { count: ingredient.usageCount })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ingredient.isActive ? 'default' : 'secondary'}>
                        {ingredient.isActive ? t('ingredients.list.badge.active') : t('ingredients.list.badge.inactive')}
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
                              <AlertDialogTitle>{t('ingredients.list.deleteTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('ingredients.list.deleteDescription', { name: ingredient.name })}
                                {ingredient.usageCount > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {' '}{t('ingredients.list.deleteInUse', { count: ingredient.usageCount })}
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ingredient)}
                                disabled={ingredient.usageCount > 0}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                              >
                                {t('common.delete')}
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
              <SheetTitle>{t('ingredients.list.editSheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('ingredients.list.editSheetDescription')}
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
              <SheetTitle>{t('ingredients.list.viewSheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('ingredients.list.viewSheetDescription')}
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
