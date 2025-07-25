import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Beaker } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { TempIngredientForm } from './TempIngredientForm'
import type { TempIngredient } from './types'

interface TempIngredientListProps {
  ingredients: TempIngredient[]
  onAdd: (ingredient: Omit<TempIngredient, 'id'>) => void
  onEdit: (id: string, ingredient: Omit<TempIngredient, 'id'>) => void
  onDelete: (id: string) => void
}

export function TempIngredientList({ ingredients, onAdd, onEdit, onDelete }: TempIngredientListProps) {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<TempIngredient | undefined>()

  const handleAdd = (ingredient: Omit<TempIngredient, 'id'>) => {
    onAdd(ingredient)
    setIsFormOpen(false)
  }

  const handleEdit = (ingredient: Omit<TempIngredient, 'id'>) => {
    if (editingIngredient) {
      onEdit(editingIngredient.id, ingredient)
      setEditingIngredient(undefined)
    }
  }

  const startEdit = (ingredient: TempIngredient) => {
    setEditingIngredient(ingredient)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingIngredient(undefined)
  }

  const calculateUnitCost = (ingredient: TempIngredient) => {
    return ingredient.baseUnitCost / ingredient.baseUnitQuantity
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              {t('cogs.tempIngredientList.title')}
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {t('cogs.tempIngredientList.sandboxBadge')}
            </Badge>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('cogs.tempIngredientList.addIngredient')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('cogs.tempIngredientList.description')}
        </p>
      </CardHeader>
      <CardContent>
        {ingredients.length === 0 ? (
          <div className="text-center py-8">
            <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('cogs.tempIngredientList.emptyMessage')}</p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t('cogs.tempIngredientList.addFirst')}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('cogs.tempIngredientList.table.name')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.category')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.baseCost')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.baseQuantity')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.unitCost')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.unit')}</TableHead>
                <TableHead>{t('cogs.tempIngredientList.table.status')}</TableHead>
                <TableHead className="w-[100px]">{t('cogs.tempIngredientList.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                    {ingredient.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ingredient.note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {ingredient.category ? (
                      <Badge variant="outline">{ingredient.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(ingredient.baseUnitCost)}</TableCell>
                  <TableCell>{ingredient.baseUnitQuantity}</TableCell>
                  <TableCell>{formatCurrency(calculateUnitCost(ingredient))}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ingredient.unit}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ingredient.isActive ? "default" : "secondary"}>
                      {ingredient.isActive ? t('cogs.tempIngredientList.table.active') : t('cogs.tempIngredientList.table.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(ingredient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(ingredient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <TempIngredientForm
        isOpen={isFormOpen || !!editingIngredient}
        onClose={handleFormClose}
        onSave={editingIngredient ? handleEdit : handleAdd}
        ingredient={editingIngredient}
      />
    </Card>
  )
}
