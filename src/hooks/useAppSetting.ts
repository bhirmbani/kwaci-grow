import { useState, useEffect, useCallback, useMemo } from 'react'
import { AppSettingsService } from '../lib/services/appSettingsService'
import type { AppSettingKey } from '../lib/db/schema'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

interface UseAppSettingResult {
  value: number
  loading: boolean
  error: string | null
  updateValue: (value: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useAppSetting(key: AppSettingKey, defaultValue: number): UseAppSettingResult {
  const [value, setValue] = useState<number>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const fetchValue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dbValue = await AppSettingsService.getNumber(key, defaultValue)
      setValue(dbValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch app setting')
      console.error('Error fetching app setting:', err)
      setValue(defaultValue) // Fallback to default
    } finally {
      setLoading(false)
    }
  }, [key, defaultValue, currentBusinessId])

  const updateValue = useCallback(async (newValue: number) => {
    // Store previous value for potential rollback
    const previousValue = value

    try {
      setError(null)

      // Optimistic update - update UI immediately
      setValue(newValue)

      // Update database in background
      await AppSettingsService.setNumber(key, newValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update app setting')
      console.error('Error updating app setting:', err)
      // Revert optimistic update
      setValue(previousValue)
      throw err
    }
  }, [key, value])

  const refetch = useCallback(async () => {
    await fetchValue()
  }, [fetchValue])

  useEffect(() => {
    fetchValue()
  }, [fetchValue])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    value,
    loading,
    error,
    updateValue,
    refetch,
  }), [value, loading, error, updateValue, refetch])
}
