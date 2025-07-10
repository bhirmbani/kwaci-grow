/**
 * Business Context Provider for Services
 * 
 * This module provides a centralized way to inject business context into all services.
 * It allows services to access the current business ID without directly importing
 * the business store, maintaining separation of concerns.
 */

import { setBusinessIdProvider as setIngredientBusinessId } from './ingredientService'
import { setBusinessIdProvider as setProductBusinessId } from './productService'
import { setBusinessIdProvider as setPlanningBusinessId } from './planningService'
import { setBusinessIdProvider as setPlanTemplateBusinessId } from './planTemplateService'
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
  setPlanningBusinessId(provider)
  setPlanTemplateBusinessId(provider)

  // TODO: Add other services as they are updated:
  // setMenuBusinessId(provider)
  // setBranchBusinessId(provider)
  // setSalesBusinessId(provider)
  // setWarehouseBusinessId(provider)
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
 * Usage: filterByBusiness(db.someTable, businessId) - for simple table queries
 * or: filterByBusiness(db.someTable.where('someField').equals(value), businessId) - for complex queries
 */
export function filterByBusiness<T>(query: any, businessId?: string): any {
  const currentBusinessId = businessId || getCurrentBusinessId()
  if (!currentBusinessId) {
    throw new Error('No business selected. Please select a business first.')
  }

  // For simple table queries (like db.someTable)
  if (query.where && typeof query.where === 'function') {
    return query.where('businessId').equals(currentBusinessId)
  }

  // For queries that already have a where clause and support and()
  if (query.and && typeof query.and === 'function') {
    return query.and((item: any) => item.businessId === currentBusinessId)
  }

  // For collection queries, try to filter directly
  if (query.filter && typeof query.filter === 'function') {
    return query.filter((item: any) => item.businessId === currentBusinessId)
  }

  // Fallback: assume it's a table and add where clause
  try {
    return query.where('businessId').equals(currentBusinessId)
  } catch (error) {
    console.error('filterByBusiness: Unable to apply business filter to query:', error)
    throw new Error('Unable to apply business filter to the provided query')
  }
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
