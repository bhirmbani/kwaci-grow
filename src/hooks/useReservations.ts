import { useState, useEffect, useCallback } from 'react'
import { StockService } from '@/lib/services/stockService'

export interface ReservationWithPurpose {
  ingredientName: string
  unit: string
  quantity: number
  purpose: string
  reservationId?: string
  productionBatchId?: string
  transactionDate: string
}

export function useReservations() {
  const [reservations, setReservations] = useState<ReservationWithPurpose[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const reservationsData = await StockService.getReservationsWithPurpose()
      setReservations(reservationsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations')
      console.error('Error loading reservations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const releaseReservation = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reservationId?: string,
    purpose?: string,
    productionBatchId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const result = await StockService.unreserveStock(
        ingredientName,
        unit,
        quantity,
        `Released reservation: ${purpose || 'Manual release'}`,
        reservationId,
        purpose,
        productionBatchId
      )
      
      if (result.success) {
        // Reload reservations to reflect the change
        await loadReservations()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release reservation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadReservations])

  const createManualReservation = useCallback(async (
    ingredientName: string,
    unit: string,
    quantity: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const result = await StockService.reserveStock(
        ingredientName,
        unit,
        quantity,
        reason,
        undefined, // no specific reservation ID
        'Manual Reservation' // purpose
      )
      
      if (result.success) {
        // Reload reservations to reflect the change
        await loadReservations()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadReservations])

  // Group reservations by purpose for better organization
  const groupedReservations = useCallback(() => {
    const groups: Record<string, ReservationWithPurpose[]> = {}
    
    reservations.forEach(reservation => {
      const purpose = reservation.purpose || 'Manual Reservation'
      if (!groups[purpose]) {
        groups[purpose] = []
      }
      groups[purpose].push(reservation)
    })
    
    return groups
  }, [reservations])

  // Get summary statistics
  const getReservationStats = useCallback(() => {
    const stats = {
      totalReservations: reservations.length,
      manualReservations: 0,
      productionReservations: 0,
      totalQuantityByUnit: {} as Record<string, number>
    }
    
    reservations.forEach(reservation => {
      if (reservation.purpose === 'Manual Reservation') {
        stats.manualReservations++
      } else if (reservation.purpose.startsWith('Production Batch')) {
        stats.productionReservations++
      }
      
      const unitKey = reservation.unit
      stats.totalQuantityByUnit[unitKey] = (stats.totalQuantityByUnit[unitKey] || 0) + reservation.quantity
    })
    
    return stats
  }, [reservations])

  // Load reservations on mount
  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  return {
    reservations,
    loading,
    error,
    loadReservations,
    releaseReservation,
    createManualReservation,
    groupedReservations,
    getReservationStats
  }
}
