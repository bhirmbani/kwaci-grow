import { useState, useEffect, useCallback } from 'react'
import { JourneyService, JOURNEY_STEP_INFO, type JourneyStepId, type JourneyStepInfo } from '@/lib/services/journeyService'
import type { JourneyProgress } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

export function useJourney(userId?: string) {
  const [progress, setProgress] = useState<JourneyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const journeyProgress = await JourneyService.getAllProgress(userId)
      setProgress(journeyProgress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey progress')
      console.error('Error loading journey progress:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, currentBusinessId])

  const completeStep = useCallback(async (stepId: JourneyStepId): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await JourneyService.completeStep(stepId, userId)
      await loadProgress() // Reload to reflect changes
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete step'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [userId, loadProgress])

  const isStepCompleted = useCallback((stepId: JourneyStepId): boolean => {
    return progress.some(p => p.stepId === stepId && p.completed)
  }, [progress])

  const getCompletionPercentage = useCallback((): number => {
    const completedCount = progress.filter(p => p.completed).length
    const totalSteps = Object.keys(JOURNEY_STEP_INFO).length
    return Math.round((completedCount / totalSteps) * 100)
  }, [progress])

  const getNextUnlockedStep = useCallback((): JourneyStepInfo | null => {
    const completedSteps = new Set(
      progress.filter(p => p.completed).map(p => p.stepId)
    )

    // Find the first incomplete step in order
    const orderedSteps = Object.values(JOURNEY_STEP_INFO).sort((a, b) => a.order - b.order)
    
    for (const step of orderedSteps) {
      if (!completedSteps.has(step.id)) {
        return step
      }
    }

    return null // All steps completed
  }, [progress])

  const getStepStatus = useCallback((stepId: JourneyStepId): 'locked' | 'unlocked' | 'completed' => {
    const stepInfo = JOURNEY_STEP_INFO[stepId]
    const completedSteps = new Set(
      progress.filter(p => p.completed).map(p => p.stepId)
    )

    if (completedSteps.has(stepId)) {
      return 'completed'
    }

    // Check if all previous steps are completed
    const orderedSteps = Object.values(JOURNEY_STEP_INFO).sort((a, b) => a.order - b.order)
    const currentStepIndex = orderedSteps.findIndex(s => s.id === stepId)
    
    for (let i = 0; i < currentStepIndex; i++) {
      if (!completedSteps.has(orderedSteps[i].id)) {
        return 'locked'
      }
    }

    return 'unlocked'
  }, [progress])

  const resetProgress = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await JourneyService.resetProgress(userId)
      await loadProgress() // Reload to reflect changes
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset progress'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [userId, loadProgress])

  const autoCheckCompletion = useCallback(async (): Promise<void> => {
    try {
      await JourneyService.autoCheckStepCompletion(userId)
      await loadProgress() // Reload to reflect any auto-completed steps
    } catch (err) {
      console.error('Error auto-checking completion:', err)
    }
  }, [userId, loadProgress])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    progress,
    loading,
    error,
    loadProgress,
    completeStep,
    isStepCompleted,
    getCompletionPercentage,
    getNextUnlockedStep,
    getStepStatus,
    resetProgress,
    autoCheckCompletion
  }
}

export function useJourneyStep(stepId: JourneyStepId, userId?: string) {
  const [stepProgress, setStepProgress] = useState<JourneyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadStepProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const progress = await JourneyService.getStepProgress(stepId, userId)
      setStepProgress(progress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load step progress')
      console.error('Error loading step progress:', err)
    } finally {
      setLoading(false)
    }
  }, [stepId, userId, currentBusinessId])

  const completeStep = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const completed = await JourneyService.completeStep(stepId, userId)
      setStepProgress(completed)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete step'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [stepId, userId])

  const isCompleted = stepProgress?.completed || false

  useEffect(() => {
    loadStepProgress()
  }, [loadStepProgress])

  return {
    stepProgress,
    loading,
    error,
    isCompleted,
    loadStepProgress,
    completeStep
  }
}
