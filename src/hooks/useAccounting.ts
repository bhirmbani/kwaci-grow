/**
 * useAccounting Hook
 * 
 * React hook for unified transaction management that provides:
 * - Loading states and error handling
 * - Real-time updates with business context
 * - CRUD operations for all transaction types
 * - Financial summary calculations
 * - Filtering and search capabilities
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { AccountingService } from '@/lib/services/accountingService'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type {
  UnifiedTransaction,
  TransactionType,
  FinancialSummary,
  TransactionFilters,
  CreateTransactionData,
  UpdateTransactionData
} from '@/lib/types/accounting'

interface UseAccountingResult {
  // Data
  transactions: UnifiedTransaction[]
  financialSummary: FinancialSummary | null
  
  // Loading states
  loading: boolean
  summaryLoading: boolean
  
  // Error states
  error: string | null
  summaryError: string | null
  
  // CRUD operations
  createTransaction: (data: CreateTransactionData) => Promise<void>
  updateTransaction: (id: string, updates: UpdateTransactionData) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // Data fetching
  refetch: () => Promise<void>
  refetchSummary: () => Promise<void>
  
  // Filtering
  applyFilters: (filters: TransactionFilters) => void
  clearFilters: () => void
  currentFilters: TransactionFilters | null
  
  // Utilities
  getTransactionsByType: (type: TransactionType) => UnifiedTransaction[]
  getTotalsByType: () => Record<TransactionType, number>
}

interface UseAccountingOptions {
  initialFilters?: TransactionFilters
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
  enableRealTimeUpdates?: boolean
}

export function useAccounting(options: UseAccountingOptions = {}): UseAccountingResult {
  const {
    initialFilters,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options

  const currentBusinessId = useCurrentBusinessId()
  
  // State management
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters | null>(initialFilters || null)

  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fetch transactions - stable function that doesn't depend on filters
  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    if (!currentBusinessId) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      setLoading(true)

      // Use provided filters or current filters
      const filtersToUse = filters !== undefined ? filters : currentFilters
      const appliedFilters = filtersToUse ? { ...filtersToUse, businessId: currentBusinessId } : undefined

      const data = await AccountingService.getAllTransactions(currentBusinessId, appliedFilters)

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTransactions(data)
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions'
        setError(errorMessage)
        console.error('useAccounting.fetchTransactions() - Error:', err)
      }
    } finally {
      // Always reset loading state - this is critical for UI responsiveness
      setLoading(false)
    }
  }, [currentBusinessId, currentFilters])

  // Fetch financial summary - stable function that doesn't create dependency loops
  const fetchFinancialSummary = useCallback(async (dateRange?: { start: string; end: string }) => {
    if (!currentBusinessId) {
      setFinancialSummary(null)
      setSummaryLoading(false)
      return
    }

    try {
      setSummaryError(null)
      setSummaryLoading(true)

      // Use provided date range or current filters date range
      const dateRangeToUse = dateRange !== undefined ? dateRange : currentFilters?.dateRange
      const summary = await AccountingService.getFinancialSummary(currentBusinessId, dateRangeToUse)

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setFinancialSummary(summary)
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial summary'
        setSummaryError(errorMessage)
        console.error('useAccounting.fetchFinancialSummary() - Error:', err)
      }
    } finally {
      // Always reset loading state - this is critical for UI responsiveness
      setSummaryLoading(false)
    }
  }, [currentBusinessId, currentFilters?.dateRange])

  // Create transaction
  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    if (!currentBusinessId) {
      throw new Error('No business selected')
    }

    try {
      setError(null)
      
      const transactionData = {
        ...data,
        businessId: currentBusinessId
      }
      
      await AccountingService.createTransaction(transactionData)
      
      // Refresh data after creation
      await Promise.all([fetchTransactions(), fetchFinancialSummary()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction'
      setError(errorMessage)
      console.error('useAccounting.createTransaction() - Error:', err)
      throw err
    }
  }, [currentBusinessId, fetchTransactions, fetchFinancialSummary])

  // Update transaction
  const updateTransaction = useCallback(async (id: string, updates: UpdateTransactionData) => {
    try {
      setError(null)
      
      await AccountingService.updateTransaction(id, updates)
      
      // Refresh data after update
      await Promise.all([fetchTransactions(), fetchFinancialSummary()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction'
      setError(errorMessage)
      console.error('useAccounting.updateTransaction() - Error:', err)
      throw err
    }
  }, [fetchTransactions, fetchFinancialSummary])

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null)
      
      await AccountingService.deleteTransaction(id)
      
      // Refresh data after deletion
      await Promise.all([fetchTransactions(), fetchFinancialSummary()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction'
      setError(errorMessage)
      console.error('useAccounting.deleteTransaction() - Error:', err)
      throw err
    }
  }, [fetchTransactions, fetchFinancialSummary])

  // Apply filters
  const applyFilters = useCallback((filters: TransactionFilters) => {
    setCurrentFilters(filters)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setCurrentFilters(null)
  }, [])

  // Refetch functions
  const refetch = useCallback(async () => {
    await fetchTransactions(currentFilters)
  }, [fetchTransactions, currentFilters])

  const refetchSummary = useCallback(async () => {
    await fetchFinancialSummary(currentFilters?.dateRange)
  }, [fetchFinancialSummary, currentFilters?.dateRange])

  // Utility functions
  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactions.filter(transaction => transaction.type === type)
  }, [transactions])

  const getTotalsByType = useCallback(() => {
    const totals: Record<TransactionType, number> = {
      'CAPITAL_INVESTMENT': 0,
      'SALES_INCOME': 0,
      'OPERATING_EXPENSE': 0,
      'FIXED_COST': 0,
      'VARIABLE_COST': 0,
      'ASSET_PURCHASE': 0,
      'ASSET_DEPRECIATION': 0,
      'RECURRING_EXPENSE': 0
    }

    transactions.forEach(transaction => {
      totals[transaction.type] += transaction.amount
    })

    return totals
  }, [transactions])

  // Effect for initial data loading and business context changes
  useEffect(() => {
    if (currentBusinessId && isMountedRef.current) {
      // Clear previous data immediately when switching businesses
      setTransactions([])
      setFinancialSummary(null)
      setError(null)
      setSummaryError(null)

      // Fetch new data without filters (fresh start)
      Promise.all([
        fetchTransactions(null), // Pass null to use current filters
        fetchFinancialSummary(undefined) // Pass undefined to use current date range
      ]).catch(err => {
        console.error('useAccounting - Business switch data fetch error:', err)
      })
    } else if (!currentBusinessId && isMountedRef.current) {
      setTransactions([])
      setFinancialSummary(null)
      setLoading(false)
      setSummaryLoading(false)
      setError(null)
      setSummaryError(null)
    }
  }, [currentBusinessId]) // Remove function dependencies to prevent loops

  // Effect for filter changes - separate to prevent infinite loops
  useEffect(() => {
    if (currentBusinessId && currentFilters && isMountedRef.current) {
      // Debounce filter changes to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          Promise.all([
            fetchTransactions(currentFilters),
            fetchFinancialSummary(currentFilters.dateRange)
          ]).catch(err => {
            console.error('useAccounting - Filter change data fetch error:', err)
          })
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [currentFilters, currentBusinessId]) // Remove function dependencies

  // Effect for auto-refresh
  useEffect(() => {
    if (!autoRefresh || !currentBusinessId || !isMountedRef.current) return

    const interval = setInterval(() => {
      if (isMountedRef.current) {
        Promise.all([
          fetchTransactions(currentFilters),
          fetchFinancialSummary(currentFilters?.dateRange)
        ]).catch(err => {
          console.error('useAccounting - Auto-refresh data fetch error:', err)
        })
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, currentBusinessId]) // Remove function dependencies

  // Memoized return value for performance
  return useMemo(() => ({
    // Data
    transactions,
    financialSummary,
    
    // Loading states
    loading,
    summaryLoading,
    
    // Error states
    error,
    summaryError,
    
    // CRUD operations
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Data fetching
    refetch,
    refetchSummary,
    
    // Filtering
    applyFilters,
    clearFilters,
    currentFilters,
    
    // Utilities
    getTransactionsByType,
    getTotalsByType
  }), [
    transactions,
    financialSummary,
    loading,
    summaryLoading,
    error,
    summaryError,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch,
    refetchSummary,
    applyFilters,
    clearFilters,
    currentFilters,
    getTransactionsByType,
    getTotalsByType
  ])
}

/**
 * Specialized hook for financial summary only
 */
export function useFinancialSummary(dateRange?: { start: string; end: string }) {
  const currentBusinessId = useCurrentBusinessId()
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    if (!currentBusinessId) {
      setSummary(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      setLoading(true)
      
      const data = await AccountingService.getFinancialSummary(currentBusinessId, dateRange)
      setSummary(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial summary'
      setError(errorMessage)
      console.error('useFinancialSummary.fetchSummary() - Error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId, dateRange])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  }
}
