import React from 'react'

/**
 * Simple event system for cross-category updates
 * This allows Initial Capital changes to notify Fixed Costs component
 */

type DepreciationEventType = 'depreciation-changed'

interface DepreciationEvent {
  type: DepreciationEventType
  assetId: string
  assetName: string
  action: 'created' | 'updated' | 'deleted'
}

type EventListener = (event: DepreciationEvent) => void

class DepreciationEventEmitter {
  private listeners: EventListener[] = []

  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(event: DepreciationEvent): void {
    console.log('📡 DepreciationEvent emitted:', event)
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in depreciation event listener:', error)
      }
    })
  }

  // Convenience methods
  emitDepreciationCreated(assetId: string, assetName: string): void {
    this.emit({
      type: 'depreciation-changed',
      assetId,
      assetName,
      action: 'created'
    })
  }

  emitDepreciationUpdated(assetId: string, assetName: string): void {
    this.emit({
      type: 'depreciation-changed',
      assetId,
      assetName,
      action: 'updated'
    })
  }

  emitDepreciationDeleted(assetId: string, assetName: string): void {
    this.emit({
      type: 'depreciation-changed',
      assetId,
      assetName,
      action: 'deleted'
    })
  }
}

// Global instance
export const depreciationEvents = new DepreciationEventEmitter()

// Hook for components to listen to depreciation events
export function useDepreciationEvents(callback: EventListener): void {
  React.useEffect(() => {
    const unsubscribe = depreciationEvents.subscribe(callback)
    return unsubscribe
  }, [callback])
}
