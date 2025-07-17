import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, CheckCircle, AlertCircle } from 'lucide-react'
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
  const { t } = useTranslation()

  const {
    expenses,
    loading,
    error,
    // categories,
    monthlyTotal,
    yearlyTotal,
    categoryTotals,
    createExpense,
    updateExpense,
    deleteExpense,
    softDeleteExpense,
    restoreExpense,
    // refresh,
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
        ? t('recurringExpenses.messages.updateSuccess')
        : t('recurringExpenses.messages.createSuccess'),
    })
    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingExpense(null)
  }

  const handleFormSubmit = async (data: NewRecurringExpense) => {
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
    } catch (err) {
      console.error('Form submission error:', err)
      throw err // Re-throw to let the form handle the error display
    }
  }

  const handleDeleteExpense = async (expense: RecurringExpense) => {
    try {
      await deleteExpense(expense.id)
      setMessage({
        type: 'success',
        text: t('recurringExpenses.messages.deleteSuccess'),
      })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: t('recurringExpenses.messages.deleteError'),
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
          text: t('recurringExpenses.messages.deactivateSuccess'),
        })
      } else {
        await restoreExpense(expense.id)
        setMessage({
          type: 'success',
          text: t('recurringExpenses.messages.activateSuccess'),
        })
      }
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: t('recurringExpenses.messages.statusError'),
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('recurringExpenses.page.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('recurringExpenses.page.description')}
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
              {t('recurringExpenses.page.showInactive')}
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
      <div className="fixed right-6 bottom-6">
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label={t('recurringExpenses.sheet.createTitle')}
            onClick={handleCreateExpense}
          >
            <Plus className="text-primary-foreground m-auto flex h-8 w-8" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-background !important">
            <SheetHeader>
              <SheetTitle>
                {editingExpense
                  ? t('recurringExpenses.sheet.editTitle')
                  : t('recurringExpenses.sheet.createTitle')}
              </SheetTitle>
              <SheetDescription>
                {editingExpense
                  ? t('recurringExpenses.sheet.editDescription')
                  : t('recurringExpenses.sheet.createDescription')}
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
    </div>
  )
}
