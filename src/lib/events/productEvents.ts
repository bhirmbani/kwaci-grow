// Event system for real-time product data synchronization

type ProductEventType =
  | 'product-created'
  | 'product-updated'
  | 'product-deleted'
  | 'product-ingredients-changed'
  | 'menu-product-pricing-changed'
  | 'menu-created'
  | 'menu-updated'
  | 'menu-deleted'
  | 'menu-product-added'
  | 'menu-product-removed'

interface ProductEvent {
  type: ProductEventType
  productId?: string
  productName?: string
  menuId?: string
  menuName?: string
  timestamp: number
}

type ProductEventListener = (event: ProductEvent) => void

class ProductEventEmitter {
  private listeners: Map<ProductEventType, Set<ProductEventListener>> = new Map()

  // Subscribe to product events
  on(eventType: ProductEventType, listener: ProductEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    this.listeners.get(eventType)!.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener)
    }
  }

  // Emit product events
  emit(event: ProductEvent): void {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in product event listener:', error)
        }
      })
    }
  }

  // Convenience methods for common events
  productCreated(productId: string, productName: string): void {
    this.emit({
      type: 'product-created',
      productId,
      productName,
      timestamp: Date.now()
    })
  }

  productUpdated(productId: string, productName?: string): void {
    this.emit({
      type: 'product-updated',
      productId,
      productName,
      timestamp: Date.now()
    })
  }

  productDeleted(productId: string): void {
    this.emit({
      type: 'product-deleted',
      productId,
      timestamp: Date.now()
    })
  }

  productIngredientsChanged(productId: string): void {
    this.emit({
      type: 'product-ingredients-changed',
      productId,
      timestamp: Date.now()
    })
  }

  menuProductPricingChanged(productId: string): void {
    this.emit({
      type: 'menu-product-pricing-changed',
      productId,
      timestamp: Date.now()
    })
  }

  menuCreated(menuId: string, menuName: string): void {
    this.emit({
      type: 'menu-created',
      menuId,
      menuName,
      timestamp: Date.now()
    })
  }

  menuUpdated(menuId: string, menuName?: string): void {
    this.emit({
      type: 'menu-updated',
      menuId,
      menuName,
      timestamp: Date.now()
    })
  }

  menuDeleted(menuId: string): void {
    this.emit({
      type: 'menu-deleted',
      menuId,
      timestamp: Date.now()
    })
  }

  menuProductAdded(menuId: string, productId: string): void {
    this.emit({
      type: 'menu-product-added',
      menuId,
      productId,
      timestamp: Date.now()
    })
  }

  menuProductRemoved(menuId: string, productId: string): void {
    this.emit({
      type: 'menu-product-removed',
      menuId,
      productId,
      timestamp: Date.now()
    })
  }
}

// Global event emitter instance
export const productEvents = new ProductEventEmitter()

// Hook for subscribing to product events
export function useProductEvents(
  eventTypes: ProductEventType | ProductEventType[],
  listener: ProductEventListener
): void {
  const events = Array.isArray(eventTypes) ? eventTypes : [eventTypes]
  
  // Subscribe to events on mount and unsubscribe on unmount
  React.useEffect(() => {
    const unsubscribeFunctions = events.map(eventType => 
      productEvents.on(eventType, listener)
    )
    
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    }
  }, [events, listener])
}

// Import React for useEffect
import React from 'react'
