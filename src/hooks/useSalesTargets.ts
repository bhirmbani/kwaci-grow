import { useState, useEffect, useCallback } from 'react'
import { DailyProductSalesTargetService, type MenuTargetSummary } from '@/lib/services/dailyProductSalesTargetService'
import type { DailyProductSalesTarget, DailyProductSalesTargetWithDetails } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

interface UseSalesTargetsResult {
  targets: DailyProductSalesTargetWithDetails[]
  menuTargets: MenuTargetSummary[]
  loading: boolean
  error: string | null
  loadTargets: (date: string, branchId?: string) => Promise<void>
  loadMenuTargets: (date: string, branchId: string) => Promise<void>
  createOrUpdateTarget: (
    menuId: string,
    productId: string,
    branchId: string,
    targetDate: string,
    targetQuantity: number,
    note?: string
  ) => Promise<DailyProductSalesTarget>
  deleteTarget: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useSalesTargets(
  selectedDate?: string,
  selectedBranch?: string
): UseSalesTargetsResult {
  const [targets, setTargets] = useState<DailyProductSalesTargetWithDetails[]>([])
  const [menuTargets, setMenuTargets] = useState<MenuTargetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadTargets = useCallback(async (date: string, branchId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const targetsData = branchId
        ? await DailyProductSalesTargetService.getTargetsForDateAndBranch(date, branchId)
        : await DailyProductSalesTargetService.getAllTargetsForDate(date)

      setTargets(targetsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales targets')
      console.error('Error loading sales targets:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const loadMenuTargets = useCallback(async (date: string, branchId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const menuTargetsData = await DailyProductSalesTargetService.getMenusWithProductTargets(date, branchId)
      setMenuTargets(menuTargetsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu targets')
      console.error('Error loading menu targets:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const createOrUpdateTarget = useCallback(async (
    menuId: string,
    productId: string,
    branchId: string,
    targetDate: string,
    targetQuantity: number,
    note: string = ''
  ): Promise<DailyProductSalesTarget> => {
    try {
      setError(null)
      const target = await DailyProductSalesTargetService.createOrUpdateTarget(
        menuId,
        productId,
        branchId,
        targetDate,
        targetQuantity,
        note
      )
      
      // Reload data to reflect changes
      if (selectedDate) {
        await loadTargets(selectedDate, selectedBranch)
        if (selectedBranch) {
          await loadMenuTargets(selectedDate, selectedBranch)
        }
      }
      
      return target
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create/update sales target'
      setError(errorMessage)
      throw err
    }
  }, [selectedDate, selectedBranch, loadTargets, loadMenuTargets])

  const deleteTarget = useCallback(async (id: string) => {
    try {
      setError(null)
      await DailyProductSalesTargetService.deleteTarget(id)
      
      // Reload data to reflect changes
      if (selectedDate) {
        await loadTargets(selectedDate, selectedBranch)
        if (selectedBranch) {
          await loadMenuTargets(selectedDate, selectedBranch)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sales target'
      setError(errorMessage)
      throw err
    }
  }, [selectedDate, selectedBranch, loadTargets, loadMenuTargets])

  const refetch = useCallback(async () => {
    if (selectedDate) {
      await loadTargets(selectedDate, selectedBranch)
      if (selectedBranch) {
        await loadMenuTargets(selectedDate, selectedBranch)
      }
    }
  }, [selectedDate, selectedBranch, loadTargets, loadMenuTargets])

  // Load data when date, branch, or business changes
  useEffect(() => {
    if (selectedDate) {
      loadTargets(selectedDate, selectedBranch)
      if (selectedBranch) {
        loadMenuTargets(selectedDate, selectedBranch)
      }
    }
  }, [selectedDate, selectedBranch, loadTargets, loadMenuTargets])

  return {
    targets,
    menuTargets,
    loading,
    error,
    loadTargets,
    loadMenuTargets,
    createOrUpdateTarget,
    deleteTarget,
    refetch
  }
}
