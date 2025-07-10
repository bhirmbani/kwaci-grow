import { useState, useEffect, useCallback } from 'react'
import { SalesRecordService, type SalesRecordSummary } from '@/lib/services/salesRecordService'
import type { SalesRecord, SalesRecordWithDetails, NewSalesRecord } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

interface UseSalesRecordsResult {
  salesRecords: SalesRecordWithDetails[]
  salesSummary: SalesRecordSummary
  loading: boolean
  error: string | null
  loadSalesData: (date: string, branchId?: string) => Promise<void>
  createRecord: (record: Omit<NewSalesRecord, 'id'>) => Promise<SalesRecord>
  updateRecord: (id: string, updates: Partial<SalesRecord>) => Promise<SalesRecord>
  deleteRecord: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useSalesRecords(
  selectedDate?: string,
  selectedBranch?: string
): UseSalesRecordsResult {
  const [salesRecords, setSalesRecords] = useState<SalesRecordWithDetails[]>([])
  const [salesSummary, setSalesSummary] = useState<SalesRecordSummary>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProduct: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadSalesData = useCallback(async (date: string, branchId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const [records, summary] = await Promise.all([
        SalesRecordService.getRecordsForDate(date, branchId),
        SalesRecordService.getSalesSummary(date, branchId),
      ])

      setSalesRecords(records)
      setSalesSummary(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales data')
      console.error('Error loading sales data:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const createRecord = useCallback(async (record: Omit<NewSalesRecord, 'id'>): Promise<SalesRecord> => {
    try {
      setError(null)
      const newRecord = await SalesRecordService.createRecord(record)
      
      // Reload data if we're viewing the same date/branch
      if (selectedDate && record.saleDate === selectedDate) {
        await loadSalesData(selectedDate, selectedBranch)
      }
      
      return newRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sales record'
      setError(errorMessage)
      throw err
    }
  }, [selectedDate, selectedBranch, loadSalesData])

  const updateRecord = useCallback(async (
    id: string, 
    updates: Partial<SalesRecord>
  ): Promise<SalesRecord> => {
    try {
      setError(null)
      const updatedRecord = await SalesRecordService.updateRecord(id, updates)
      
      // Reload data to reflect changes
      if (selectedDate) {
        await loadSalesData(selectedDate, selectedBranch)
      }
      
      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sales record'
      setError(errorMessage)
      throw err
    }
  }, [selectedDate, selectedBranch, loadSalesData])

  const deleteRecord = useCallback(async (id: string) => {
    try {
      setError(null)
      await SalesRecordService.deleteRecord(id)
      
      // Reload data to reflect changes
      if (selectedDate) {
        await loadSalesData(selectedDate, selectedBranch)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sales record'
      setError(errorMessage)
      throw err
    }
  }, [selectedDate, selectedBranch, loadSalesData])

  const refetch = useCallback(async () => {
    if (selectedDate) {
      await loadSalesData(selectedDate, selectedBranch)
    }
  }, [selectedDate, selectedBranch, loadSalesData])

  // Load data when date, branch, or business changes
  useEffect(() => {
    if (selectedDate) {
      loadSalesData(selectedDate, selectedBranch)
    }
  }, [selectedDate, selectedBranch, loadSalesData])

  return {
    salesRecords,
    salesSummary,
    loading,
    error,
    loadSalesData,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch
  }
}
