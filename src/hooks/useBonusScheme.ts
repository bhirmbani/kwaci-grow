import { useState, useEffect, useCallback, useMemo } from 'react'
import { BonusSchemeService } from '../lib/services/bonusSchemeService'
import type { BonusScheme as AppBonusScheme } from '../types'
import type { BonusScheme as DbBonusScheme } from '../lib/db/schema'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

interface UseBonusSchemeResult {
  scheme: AppBonusScheme | null
  loading: boolean
  error: string | null
  updateScheme: (scheme: AppBonusScheme) => Promise<void>
  refetch: () => Promise<void>
}

// Convert database BonusScheme to app BonusScheme
function dbToAppScheme(dbScheme: DbBonusScheme): AppBonusScheme {
  return {
    target: dbScheme.target,
    perCup: dbScheme.perCup,
    baristaCount: dbScheme.baristaCount,
    note: dbScheme.note || '',
  }
}

export function useBonusScheme(): UseBonusSchemeResult {
  const [scheme, setScheme] = useState<AppBonusScheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const fetchScheme = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dbScheme = await BonusSchemeService.getCurrent()
      if (dbScheme) {
        setScheme(dbToAppScheme(dbScheme))
      } else {
        // Initialize with default if none exists
        const defaultScheme = await BonusSchemeService.ensureExists()
        setScheme(dbToAppScheme(defaultScheme))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bonus scheme')
      console.error('Error fetching bonus scheme:', err)
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  const updateScheme = useCallback(async (newScheme: AppBonusScheme) => {
    // Store previous scheme for potential rollback
    const previousScheme = scheme

    try {
      setError(null)

      // Optimistic update - update UI immediately
      setScheme(newScheme)

      // Update database in background
      await BonusSchemeService.update(newScheme)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bonus scheme')
      console.error('Error updating bonus scheme:', err)
      // Revert optimistic update
      setScheme(previousScheme)
      throw err
    }
  }, [scheme])

  const refetch = useCallback(async () => {
    await fetchScheme()
  }, [fetchScheme])

  useEffect(() => {
    fetchScheme()
  }, [fetchScheme])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    scheme,
    loading,
    error,
    updateScheme,
    refetch,
  }), [scheme, loading, error, updateScheme, refetch])
}
