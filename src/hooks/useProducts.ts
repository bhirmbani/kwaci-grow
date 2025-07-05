import { useState, useEffect, useCallback } from 'react'
import { ProductService } from '@/lib/services/productService'
import type { Product, ProductWithIngredients, NewProduct } from '@/lib/db/schema'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allProducts = await ProductService.getAll()
      setProducts(allProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (
    productData: Omit<NewProduct, 'id' | 'isActive'>
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      setError(null)
      const newProduct = await ProductService.create(productData)
      await loadProducts() // Reload to get updated list
      return { success: true, product: newProduct }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadProducts])

  const updateProduct = useCallback(async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'isActive'>>
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      setError(null)
      const updatedProduct = await ProductService.update(id, updates)
      await loadProducts() // Reload to get updated list
      return { success: true, product: updatedProduct }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadProducts])

  const deleteProduct = useCallback(async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductService.delete(id)
      await loadProducts() // Reload to get updated list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadProducts])

  const addIngredientToProduct = useCallback(async (
    productId: string,
    ingredientId: string,
    usagePerCup: number,
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductService.addIngredient(productId, ingredientId, usagePerCup, note || '')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add ingredient to product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateIngredientUsage = useCallback(async (
    productId: string,
    ingredientId: string,
    usagePerCup: number,
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductService.updateIngredientUsage(productId, ingredientId, usagePerCup, note)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ingredient usage'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const removeIngredientFromProduct = useCallback(async (
    productId: string,
    ingredientId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await ProductService.removeIngredient(productId, ingredientId)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove ingredient from product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addIngredientToProduct,
    updateIngredientUsage,
    removeIngredientFromProduct
  }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductWithIngredients | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const productData = await ProductService.getWithIngredients(id)
      setProduct(productData || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
      console.error('Error loading product:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  return {
    product,
    loading,
    error,
    loadProduct
  }
}

export function useProductCOGS(productId: string) {
  const [cogsData, setCOGSData] = useState<{
    totalCostPerCup: number
    ingredients: Array<{
      id: string
      name: string
      costPerCup: number
      percentage: number
      usagePerCup: number
      unit: string
    }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCOGS = useCallback(async () => {
    if (!productId) return
    
    try {
      setLoading(true)
      setError(null)
      const cogsBreakdown = await ProductService.getCOGSBreakdown(productId)
      setCOGSData(cogsBreakdown)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load COGS data')
      console.error('Error loading COGS data:', err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadCOGS()
  }, [loadCOGS])

  return {
    cogsData,
    loading,
    error,
    loadCOGS
  }
}

export function useProductsWithCounts() {
  const [products, setProducts] = useState<Array<Product & { ingredientCount: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const productsWithCounts = await ProductService.getAllWithIngredientCounts()
      setProducts(productsWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Error loading products with counts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return {
    products,
    loading,
    error,
    loadProducts
  }
}
