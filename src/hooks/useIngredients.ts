import { useState, useEffect, useCallback } from 'react'
import { IngredientService } from '@/lib/services/ingredientService'
import type { Ingredient, IngredientWithUsage, NewIngredient } from '@/lib/db/schema'

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allIngredients = await IngredientService.getAll()
      setIngredients(allIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients')
      console.error('Error loading ingredients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createIngredient = useCallback(async (
    ingredientData: Omit<NewIngredient, 'id' | 'isActive'>
  ): Promise<{ success: boolean; ingredient?: Ingredient; error?: string }> => {
    try {
      setError(null)
      
      // Validate data
      const validation = IngredientService.validateIngredientData(ingredientData)
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ')
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      const newIngredient = await IngredientService.create(ingredientData)
      await loadIngredients() // Reload to get updated list
      return { success: true, ingredient: newIngredient }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ingredient'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadIngredients])

  const updateIngredient = useCallback(async (
    id: string,
    updates: Partial<Omit<Ingredient, 'id' | 'createdAt'>>
  ): Promise<{ success: boolean; ingredient?: Ingredient; error?: string }> => {
    try {
      setError(null)
      
      // Validate data
      const validation = IngredientService.validateIngredientData(updates)
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ')
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      const updatedIngredient = await IngredientService.update(id, updates)
      await loadIngredients() // Reload to get updated list
      return { success: true, ingredient: updatedIngredient }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ingredient'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadIngredients])

  const deleteIngredient = useCallback(async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await IngredientService.delete(id)
      await loadIngredients() // Reload to get updated list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ingredient'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadIngredients])

  useEffect(() => {
    loadIngredients()
  }, [loadIngredients])

  return {
    ingredients,
    loading,
    error,
    loadIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient
  }
}

export function useIngredient(id: string) {
  const [ingredient, setIngredient] = useState<IngredientWithUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIngredient = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const ingredientData = await IngredientService.getWithUsage(id)
      setIngredient(ingredientData || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredient')
      console.error('Error loading ingredient:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadIngredient()
  }, [loadIngredient])

  return {
    ingredient,
    loading,
    error,
    loadIngredient
  }
}

export function useIngredientsWithCounts(includeInactive: boolean = false) {
  const [ingredients, setIngredients] = useState<Array<Ingredient & { usageCount: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const ingredientsWithCounts = await IngredientService.getAllWithUsageCounts(includeInactive)
      setIngredients(ingredientsWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients')
      console.error('Error loading ingredients with counts:', err)
    } finally {
      setLoading(false)
    }
  }, [includeInactive])

  useEffect(() => {
    loadIngredients()
  }, [loadIngredients])

  return {
    ingredients,
    loading,
    error,
    loadIngredients
  }
}

export function useIngredientCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allCategories = await IngredientService.getCategories()
      setCategories(allCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const result = await IngredientService.createCategory(categoryName)
      if (result.success) {
        await loadCategories() // Reload categories
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadCategories])

  const deleteCategory = useCallback(async (categoryName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const result = await IngredientService.deleteCategory(categoryName)
      if (result.success) {
        await loadCategories() // Reload categories
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadCategories])

  const getCategoryUsageCount = useCallback(async (categoryName: string): Promise<number> => {
    try {
      return await IngredientService.getCategoryUsageCount(categoryName)
    } catch (err) {
      console.error('Error getting category usage count:', err)
      return 0
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    deleteCategory,
    getCategoryUsageCount
  }
}

export function useIngredientSearch() {
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchIngredients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const results = await IngredientService.searchByName(query)
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search ingredients')
      console.error('Error searching ingredients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setError(null)
  }, [])

  return {
    searchResults,
    loading,
    error,
    searchIngredients,
    clearSearch
  }
}

export function useStockCompatibleIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const compatibleIngredients = await IngredientService.getStockCompatibleIngredients()
      setIngredients(compatibleIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock-compatible ingredients')
      console.error('Error loading stock-compatible ingredients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIngredients()
  }, [loadIngredients])

  return {
    ingredients,
    loading,
    error,
    loadIngredients
  }
}
