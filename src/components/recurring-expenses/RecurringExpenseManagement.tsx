import { useState } from 'react'
import { Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses'
import { RecurringExpenseForm } from './RecurringExpenseForm'
import { RecurringExpenseTable } from './RecurringExpenseTable'
import { RecurringExpenseSummary } from './RecurringExpenseSummary'
import { type RecurringExpense, type NewRecurringExpense } from '@/lib/db/schema'

export function RecurringExpenseManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    expenses,
    loading,
    error,
    categories,
    monthlyTotal,
    yearlyTotal,
    categoryTotals,
    createExpense,
    updateExpense,
    deleteExpense,
    softDeleteExpense,
    restoreExpense,
    refresh,
  } = useRecurringExpenses(showInactive)

  const handleCreateExpense = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  const handleEditExpense = (expense: RecurringExpense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingExpense(null)
    setMessage({
      type: 'success',
      text: editingExpense
        ? 'The recurring expense has been updated successfully.'
        : 'The new recurring expense has been created successfully.',
    })
    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingExpense(null)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          name: data.name,
          description: data.description || undefined,
          amount: data.amount,
          frequency: data.frequency,
          category: data.category,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          note: data.note || '',
          isActive: editingExpense.isActive, // Preserve current active state
        })
      } else {
        const newExpense: NewRecurringExpense = {
          id: Date.now().toString(),
          name: data.name,
          description: data.description || undefined,
          amount: data.amount,
          frequency: data.frequency,
          category: data.category,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          note: data.note || '',
          isActive: true,
        }
        await createExpense(newExpense)
      }
      handleFormSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      throw error // Re-throw to let the form handle the error display
    }
  }

  const handleDeleteExpense = async (expense: RecurringExpense) => {
    try {
      await deleteExpense(expense.id)
      setMessage({
        type: 'success',
        text: 'The recurring expense has been permanently deleted.',
      })
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete the expense. Please try again.',
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleToggleActive = async (expense: RecurringExpense) => {
    try {
      if (expense.isActive) {
        await softDeleteExpense(expense.id)
        setMessage({
          type: 'success',
          text: 'The recurring expense has been deactivated.',
        })
      } else {
        await restoreExpense(expense.id)
        setMessage({
          type: 'success',
          text: 'The recurring expense has been activated.',
        })
      }
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update the expense status. Please try again.',
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
          <p className="text-muted-foreground">
            Manage your monthly and yearly recurring operational expenses
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">
              Show inactive
            </Label>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Summary Section */}
      <RecurringExpenseSummary
        expenses={expenses}
        monthlyTotal={monthlyTotal}
        yearlyTotal={yearlyTotal}
        categoryTotals={categoryTotals}
        loading={loading}
      />

      {/* Table Section */}
      <RecurringExpenseTable
        expenses={expenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onToggleActive={handleToggleActive}
        loading={loading}
        showInactive={showInactive}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleCreateExpense}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Recurring Expense</span>
        </Button>
      </div>

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-background !important">
          <SheetHeader>
            <SheetTitle>
              {editingExpense ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}
            </SheetTitle>
            <SheetDescription>
              {editingExpense
                ? 'Update the expense information and settings.'
                : 'Add a new recurring expense to track your operational costs.'
              }
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <RecurringExpenseForm
              expense={editingExpense || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              onSubmit={handleFormSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
