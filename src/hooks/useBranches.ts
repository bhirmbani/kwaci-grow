import { useState, useEffect, useCallback } from 'react'
import { BranchService } from '@/lib/services/branchService'
import type { Branch, BranchWithMenus, NewBranch } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

interface UseBranchesResult {
  branches: BranchWithMenus[]
  loading: boolean
  error: string | null
  loadBranches: () => Promise<void>
  createBranch: (branch: NewBranch) => Promise<void>
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>
  deleteBranch: (id: string) => Promise<void>
  getBranchWithMenus: (id: string) => Promise<BranchWithMenus | null>
  refetch: () => Promise<void>
}

export function useBranches(includeInactive: boolean = false): UseBranchesResult {
  const [branches, setBranches] = useState<BranchWithMenus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const branchesData = await BranchService.getAllWithMenuCounts(includeInactive)
      setBranches(branchesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches')
      console.error('Error loading branches:', err)
    } finally {
      setLoading(false)
    }
  }, [includeInactive, currentBusinessId])

  const createBranch = useCallback(async (branch: NewBranch) => {
    try {
      setError(null)
      await BranchService.create(branch)
      await loadBranches() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create branch'
      setError(errorMessage)
      throw err
    }
  }, [loadBranches])

  const updateBranch = useCallback(async (id: string, updates: Partial<Branch>) => {
    try {
      setError(null)
      await BranchService.update(id, updates)
      await loadBranches() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branch'
      setError(errorMessage)
      throw err
    }
  }, [loadBranches])

  const deleteBranch = useCallback(async (id: string) => {
    try {
      setError(null)
      await BranchService.delete(id)
      await loadBranches() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete branch'
      setError(errorMessage)
      throw err
    }
  }, [loadBranches])

  const getBranchWithMenus = useCallback(async (id: string): Promise<BranchWithMenus | null> => {
    try {
      setError(null)
      return await BranchService.getWithMenus(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get branch with menus'
      setError(errorMessage)
      throw err
    }
  }, [])

  const refetch = useCallback(async () => {
    await loadBranches()
  }, [loadBranches])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  return {
    branches,
    loading,
    error,
    loadBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchWithMenus,
    refetch
  }
}
