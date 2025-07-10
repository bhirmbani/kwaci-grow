import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Business } from '../db/schema'
import { BusinessService } from '../services/businessService'

interface BusinessState {
  // Current selected business
  currentBusiness: Business | null

  // All available businesses
  businesses: Business[]

  // Loading states
  isLoading: boolean
  isInitialized: boolean
  isBusinessSwitching: boolean

  // Actions
  setCurrentBusiness: (business: Business | null) => void
  switchBusiness: (business: Business) => Promise<void>
  loadBusinesses: () => Promise<void>
  addBusiness: (business: Business) => void
  updateBusiness: (id: string, updates: Partial<Business>) => void
  removeBusiness: (id: string) => void
  initializeStore: () => Promise<void>

  // Getters
  getCurrentBusinessId: () => string | null
  isBusinessSelected: () => boolean
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      currentBusiness: null,
      businesses: [],
      isLoading: false,
      isInitialized: false,
      isBusinessSwitching: false,

      setCurrentBusiness: (business) => {
        set({ currentBusiness: business })
      },

      switchBusiness: async (business) => {
        const currentBusiness = get().currentBusiness

        // Only proceed if this is actually a different business
        if (currentBusiness?.id === business.id) {
          return
        }

        try {
          // Set switching state to show loading
          set({ isBusinessSwitching: true })

          // Update the current business
          set({ currentBusiness: business })

          // Wait a minimum duration for better UX (prevents flicker)
          await new Promise(resolve => setTimeout(resolve, 500))

        } finally {
          // Clear switching state
          set({ isBusinessSwitching: false })
        }
      },

      loadBusinesses: async () => {
        set({ isLoading: true })
        try {
          const businesses = await BusinessService.getAll()
          set({ businesses })
          
          // If no current business is selected but businesses exist, select the first one
          const { currentBusiness } = get()
          if (!currentBusiness && businesses.length > 0) {
            set({ currentBusiness: businesses[0] })
          }
        } catch (error) {
          console.error('Failed to load businesses:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addBusiness: (business) => {
        set((state) => ({
          businesses: [...state.businesses, business]
        }))
      },

      updateBusiness: (id, updates) => {
        set((state) => ({
          businesses: state.businesses.map(business =>
            business.id === id ? { ...business, ...updates } : business
          ),
          currentBusiness: state.currentBusiness?.id === id 
            ? { ...state.currentBusiness, ...updates }
            : state.currentBusiness
        }))
      },

      removeBusiness: (id) => {
        set((state) => {
          const newBusinesses = state.businesses.filter(business => business.id !== id)
          const newCurrentBusiness = state.currentBusiness?.id === id 
            ? (newBusinesses.length > 0 ? newBusinesses[0] : null)
            : state.currentBusiness
          
          return {
            businesses: newBusinesses,
            currentBusiness: newCurrentBusiness
          }
        })
      },

      initializeStore: async () => {
        if (get().isInitialized) return
        
        set({ isLoading: true })
        try {
          // Load all businesses
          await get().loadBusinesses()
          
          // Check if we need to create a default business (for migration)
          const { businesses } = get()
          if (businesses.length === 0) {
            const defaultBusiness = await BusinessService.createDefault()
            set({ 
              businesses: [defaultBusiness],
              currentBusiness: defaultBusiness
            })
          }
          
          set({ isInitialized: true })
        } catch (error) {
          console.error('Failed to initialize business store:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      getCurrentBusinessId: () => {
        return get().currentBusiness?.id || null
      },

      isBusinessSelected: () => {
        return get().currentBusiness !== null
      },
    }),
    {
      name: 'business-store',
      // Only persist the current business selection, not the full businesses array
      partialize: (state) => ({ 
        currentBusiness: state.currentBusiness 
      }),
    }
  )
)

// Helper hooks for common use cases
export const useCurrentBusiness = () => useBusinessStore((state) => state.currentBusiness)
export const useCurrentBusinessId = () => useBusinessStore((state) => state.getCurrentBusinessId())
export const useBusinesses = () => useBusinessStore((state) => state.businesses)
export const useIsBusinessSelected = () => useBusinessStore((state) => state.isBusinessSelected())
export const useIsBusinessSwitching = () => useBusinessStore((state) => state.isBusinessSwitching)
