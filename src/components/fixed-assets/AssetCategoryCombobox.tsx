import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useAssetCategories } from '@/hooks/useAssetCategories'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  value: string
  label: string
  isNew?: boolean
}

interface AssetCategoryComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showManagement?: boolean
}

export function AssetCategoryCombobox({
  value,
  onValueChange,
  placeholder = "Select or create category...",
  className,
  disabled = false,
  showManagement = true,
}: AssetCategoryComboboxProps) {
  const { categories, createCategory, deleteCategory, getCategoryUsageCount } = useAssetCategories()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [deleteUsageCount, setDeleteUsageCount] = useState(0)

  // Convert categories to combobox options
  const options: ComboboxOption[] = categories.map(category => ({
    value: category.id,
    label: category.name,
  }))

  const handleCreateCategory = async (categoryName: string) => {
    setIsCreating(true)
    try {
      const result = await createCategory(categoryName)
      if (result.success) {
        // Find the newly created category and select it
        const newCategory = categories.find(cat => cat.name === categoryName)
        if (newCategory) {
          onValueChange?.(newCategory.id)
        }
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

  const handleDeleteCategory = async (categoryId: string) => {
    // Get usage count first
    const usageCount = await getCategoryUsageCount(categoryId)
    setDeleteUsageCount(usageCount)
    setCategoryToDelete(categoryId)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      await deleteCategory(categoryToDelete)

      // If the deleted category was selected, clear the selection
      if (value === categoryToDelete) {
        onValueChange?.('')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      // Show the specific error message from the service
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category. Please try again.'
      alert(errorMessage)
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
      </div>

      {showManagement && categories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Manage Categories</h4>
          <div className="grid gap-2 max-h-32 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{category.name}</p>
                  {category.description && (
                    <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {category.name}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        {deleteUsageCount > 0 ? (
                          <>
                            Cannot delete "{categories.find(c => c.id === categoryToDelete)?.name}". 
                            It is currently used by {deleteUsageCount} asset(s).
                            <br /><br />
                            Please reassign or delete those assets first.
                          </>
                        ) : (
                          <>
                            Are you sure you want to delete "{categories.find(c => c.id === categoryToDelete)?.name}"? 
                            This action cannot be undone.
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                        Cancel
                      </AlertDialogCancel>
                      {deleteUsageCount === 0 && (
                        <AlertDialogAction
                          onClick={confirmDeleteCategory}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      )}
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
