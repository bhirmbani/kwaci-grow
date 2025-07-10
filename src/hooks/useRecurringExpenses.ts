import { useState, useEffect, useCallback } from 'react'
import { RecurringExpensesService } from '../lib/services/recurringExpensesService'
import { type RecurringExpense, type NewRecurringExpense } from '../lib/db/schema'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

interface UseRecurringExpensesReturn {
  expenses: RecurringExpense[]
  loading: boolean
  error: string | null
  categories: string[]
  monthlyTotal: number
  yearlyTotal: number
  categoryTotals: { category: string; monthly: number; yearly: number }[]
  
  // CRUD operations
  createExpense: (expense: NewRecurringExpense) => Promise<RecurringExpense>
  updateExpense: (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) => Promise<RecurringExpense>
  deleteExpense: (id: string) => Promise<void>
  softDeleteExpense: (id: string) => Promise<RecurringExpense>
  restoreExpense: (id: string) => Promise<RecurringExpense>
  
  // Filtering
  filterByCategory: (category: string) => RecurringExpense[]
  filterByFrequency: (frequency: 'monthly' | 'yearly') => RecurringExpense[]
  filterActive: () => RecurringExpense[]
  
  // Refresh data
  refresh: () => Promise<void>
}

export function useRecurringExpenses(includeInactive = false): UseRecurringExpensesReturn {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [yearlyTotal, setYearlyTotal] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState<{ category: string; monthly: number; yearly: number }[]>([])
  const currentBusinessId = useCurrentBusinessId()

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load expenses
      const expensesData = includeInactive 
        ? await RecurringExpensesService.getAll()
        : await RecurringExpensesService.getActive()
      
      setExpenses(expensesData)

      // Load categories
      const categoriesData = await RecurringExpensesService.getCategories()
      setCategories(categoriesData)

      // Load totals
      const monthlyTotalData = await RecurringExpensesService.getMonthlyTotal()
      const yearlyTotalData = await RecurringExpensesService.getYearlyTotal()
      setMonthlyTotal(monthlyTotalData)
      setYearlyTotal(yearlyTotalData)

      // Load category totals
      const categoryTotalsData = await RecurringExpensesService.getTotalsByCategory()
      setCategoryTotals(categoryTotalsData)

    } catch (err) {
      console.error('Failed to load recurring expenses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recurring expenses')
    } finally {
      setLoading(false)
    }
  }, [includeInactive, currentBusinessId])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // CRUD operations
  const createExpense = useCallback(async (expense: NewRecurringExpense): Promise<RecurringExpense> => {
    try {
      setError(null)
      const created = await RecurringExpensesService.create(expense)
      await loadData() // Refresh all data
      return created
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadData])

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>): Promise<RecurringExpense> => {
    try {
      setError(null)
      const updated = await RecurringExpensesService.update(id, updates)
      await loadData() // Refresh all data
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadData])

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await RecurringExpensesService.delete(id)
      await loadData() // Refresh all data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadData])

  const softDeleteExpense = useCallback(async (id: string): Promise<RecurringExpense> => {
    try {
      setError(null)
      const updated = await RecurringExpensesService.softDelete(id)
      await loadData() // Refresh all data
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate expense'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadData])

  const restoreExpense = useCallback(async (id: string): Promise<RecurringExpense> => {
    try {
      setError(null)
      const updated = await RecurringExpensesService.restore(id)
      await loadData() // Refresh all data
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore expense'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadData])

  // Filtering functions (client-side filtering for performance)
  const filterByCategory = useCallback((category: string): RecurringExpense[] => {
    return expenses.filter(expense => expense.category === category)
  }, [expenses])

  const filterByFrequency = useCallback((frequency: 'monthly' | 'yearly'): RecurringExpense[] => {
    return expenses.filter(expense => expense.frequency === frequency)
  }, [expenses])

  const filterActive = useCallback((): RecurringExpense[] => {
    return expenses.filter(expense => expense.isActive)
  }, [expenses])

  // Refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await loadData()
  }, [loadData])

  return {
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
    filterByCategory,
    filterByFrequency,
    filterActive,
    refresh,
  }
}

// Hook for getting predefined expense categories
export function useExpenseCategories() {
  return [
    'Salary',
    'Rent',
    'Utilities',
    'Insurance',
    'Subscriptions',
    'Marketing',
    'Maintenance',
    'Equipment',
    'Software',
    'Professional Services',
    'Transportation',
    'Communication',
    'Office Supplies',
    'Training',
    'Other'
  ]
}
