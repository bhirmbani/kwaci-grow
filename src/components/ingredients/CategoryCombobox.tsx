import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useIngredientCategories } from '@/hooks/useIngredients'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  value: string
  label: string
  isNew?: boolean
}

interface CategoryComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showManagement?: boolean
}

export function CategoryCombobox({
  value,
  onValueChange,
  placeholder = "Select or create category...",
  className,
  disabled = false,
  showManagement = true,
}: CategoryComboboxProps) {
  const { categories, createCategory, deleteCategory, getCategoryUsageCount } = useIngredientCategories()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [deleteUsageCount, setDeleteUsageCount] = useState(0)

  // Convert categories to combobox options
  const options: ComboboxOption[] = categories.map(category => ({
    value: category,
    label: category,
  }))

  const handleCreateCategory = async (categoryName: string) => {
    setIsCreating(true)
    try {
      const result = await createCategory(categoryName)
      if (result.success) {
        onValueChange?.(categoryName)
      } else {
        console.error('Failed to create category:', result.error)
        // TODO: Show toast notification
        alert(`Failed to create category: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('An unexpected error occurred while creating the category')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCategory = async (categoryName: string) => {
    // Get usage count first
    const usageCount = await getCategoryUsageCount(categoryName)
    setDeleteUsageCount(usageCount)
    setCategoryToDelete(categoryName)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    setIsDeleting(true)
    try {
      const result = await deleteCategory(categoryToDelete)
      if (result.success) {
        // If the deleted category was selected, clear the selection
        if (value === categoryToDelete) {
          onValueChange?.('')
        }
      } else {
        console.error('Failed to delete category:', result.error)
        alert(`Failed to delete category: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
      setCategoryToDelete(null)
      setDeleteUsageCount(0)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Combobox
          options={options}
          value={value}
          onValueChange={onValueChange}
          onCreateNew={handleCreateCategory}
          placeholder={isCreating ? "Creating category..." : placeholder}
          searchPlaceholder="Search categories..."
          emptyText="No categories found."
          className={cn("flex-1", className)}
          disabled={disabled || isCreating}
          allowCreate={true}
        />
        
        {showManagement && categories.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={disabled || isDeleting}
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a category to delete. You can only delete categories that are not in use.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center justify-between p-2 border rounded">
                    <span>{category}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category "{categoryToDelete}"</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteUsageCount > 0 ? (
                <>
                  This category is used by {deleteUsageCount} ingredient(s). 
                  You cannot delete a category that is in use.
                </>
              ) : (
                <>
                  Are you sure you want to delete this category? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {deleteUsageCount === 0 && (
              <AlertDialogAction
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
