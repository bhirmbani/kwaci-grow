import { useState, useEffect, useCallback } from 'react'
import { AssetCategoryService } from '../lib/services/assetCategoryService'
import { type AssetCategory, type NewAssetCategory } from '../lib/db/schema'

interface UseAssetCategoriesResult {
  categories: AssetCategory[]
  loading: boolean
  error: string | null
  createCategory: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>
  updateCategory: (id: string, updates: Partial<Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategoryUsageCount: (id: string) => Promise<number>
  refetch: () => Promise<void>
}

export function useAssetCategories(): UseAssetCategoriesResult {
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const categoriesData = await AssetCategoryService.getAll()
      setCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset categories')
      console.error('Error fetching asset categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (name: string, description?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      const newCategory: NewAssetCategory = {
        id: AssetCategoryService.generateId(),
        name: name.trim(),
        description: description?.trim()
      }

      // Optimistic update - add to UI immediately
      const tempCategory: AssetCategory = {
        ...newCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCategories(prevCategories => [...prevCategories, tempCategory].sort((a, b) => a.name.localeCompare(b.name)))

      // Create in database in background
      await AssetCategoryService.create(newCategory)
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category'
      setError(errorMessage)
      console.error('Error creating category:', err)
      // Revert optimistic update by refetching
      await fetchCategories()
      return { success: false, error: errorMessage }
    }
  }, [fetchCategories])

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>>) => {
    // Store previous categories for potential rollback
    const previousCategories = categories

    try {
      setError(null)

      // Optimistic update - update UI immediately
      const updatedCategories = categories.map(category => 
        category.id === id 
          ? { ...category, ...updates, updatedAt: new Date().toISOString() }
          : category
      ).sort((a, b) => a.name.localeCompare(b.name))
      
      setCategories(updatedCategories)

      // Update database in background
      await AssetCategoryService.update(id, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      console.error('Error updating category:', err)
      // Revert optimistic update
      setCategories(previousCategories)
      throw err
    }
  }, [categories])

  const deleteCategory = useCallback(async (id: string) => {
    // Store previous categories for potential rollback
    const previousCategories = categories

    try {
      setError(null)

      // Optimistic update - remove from UI immediately
      const updatedCategories = categories.filter(category => category.id !== id)
      setCategories(updatedCategories)

      // Delete from database in background
      await AssetCategoryService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      console.error('Error deleting category:', err)
      // Revert optimistic update
      setCategories(previousCategories)
      throw err
    }
  }, [categories])

  const getCategoryUsageCount = useCallback(async (id: string): Promise<number> => {
    try {
      return await AssetCategoryService.getUsageCount(id)
    } catch (err) {
      console.error('Error getting category usage count:', err)
      return 0
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryUsageCount,
    refetch
  }
}
