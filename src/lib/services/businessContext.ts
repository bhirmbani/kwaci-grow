/**
 * Business Context Provider for Services
 * 
 * This module provides a centralized way to inject business context into all services.
 * It allows services to access the current business ID without directly importing
 * the business store, maintaining separation of concerns.
 */

import { setBusinessIdProvider as setIngredientBusinessId } from './ingredientService'
import { setBusinessIdProvider as setProductBusinessId } from './productService'
// Note: MenuService and BranchService don't export setBusinessIdProvider yet,
// they use getCurrentBusinessId directly from businessContext

// Type for the business ID provider function
type BusinessIdProvider = () => string | null

// Store the current provider
let currentProvider: BusinessIdProvider | null = null

/**
 * Initialize business context for all services
 * This should be called once during app initialization
 */
export function initializeBusinessContext(provider: BusinessIdProvider) {
  currentProvider = provider
  
  // Set up all service providers
  setIngredientBusinessId(provider)
  setProductBusinessId(provider)
  
  // TODO: Add other services as they are updated:
  // setMenuBusinessId(provider)
  // setBranchBusinessId(provider)
  // setSalesBusinessId(provider)
  // setWarehouseBusinessId(provider)
  // setPlanningBusinessId(provider)
  // setJourneyBusinessId(provider) - JourneyService now uses getCurrentBusinessId directly
  // etc.
}

/**
 * Get the current business ID
 * This can be used by services that don't have their own provider set up yet
 */
export function getCurrentBusinessId(): string | null {
  return currentProvider?.() || null
}

/**
 * Ensure a business is selected, throw error if not
 */
export function requireBusinessId(): string {
  const businessId = getCurrentBusinessId()
  if (!businessId) {
    throw new Error('No business selected. Please select a business first.')
  }
  return businessId
}

/**
 * Helper function to add business filtering to a query
 * Usage: filterByBusiness(db.someTable.where('someField').equals(value), businessId)
 */
export function filterByBusiness<T>(query: any, businessId?: string): any {
  const currentBusinessId = businessId || getCurrentBusinessId()
  if (!currentBusinessId) {
    throw new Error('No business selected. Please select a business first.')
  }
  
  return query.and((item: any) => item.businessId === currentBusinessId)
}

/**
 * Helper function to add business ID to data being created
 */
export function withBusinessId<T extends Record<string, any>>(data: T, businessId?: string): T & { businessId: string } {
  const currentBusinessId = businessId || requireBusinessId()
  
  return {
    ...data,
    businessId: currentBusinessId
  }
}
