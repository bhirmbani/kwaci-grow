import { db } from '../db'
import type { Product, NewProduct, ProductWithIngredients, Ingredient, ProductIngredient } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'

export class ProductService {
  /**
   * Get all products (active and inactive)
   */
  static async getAll(includeInactive: boolean = false): Promise<Product[]> {
    try {
      if (includeInactive) {
        return await db.products.orderBy('name').toArray()
      } else {
        return await db.products
          .filter(product => product.isActive === true)
          .sortBy('name')
      }
    } catch (error) {
      console.error('ProductService.getAll() - Database error:', error)

      // Only check for actual IDBKeyRange errors, not general database errors
      if (error.name === 'DataError' && error.message && error.message.includes('IDBKeyRange')) {
        throw new Error(
          'Database corruption detected (IDBKeyRange error). A database reset is required to fix this issue.'
        )
      }

      // For other errors, provide a generic message but don't assume corruption
      throw new Error(`Failed to retrieve products: ${error.message}`)
    }
  }

  /**
   * Get a single product by ID
   */
  static async getById(id: string): Promise<Product | undefined> {
    return await db.products.get(id)
  }

  /**
   * Get product ingredients for a product (just the relationships)
   */
  static async getProductIngredients(productId: string): Promise<Array<ProductIngredient & { ingredientName: string }>> {
    const productIngredients = await db.productIngredients
      .where('productId')
      .equals(productId)
      .toArray()

    const ingredientsWithNames = await Promise.all(
      productIngredients.map(async (pi) => {
        const ingredient = await db.ingredients.get(pi.ingredientId)
        return {
          ...pi,
          ingredientName: ingredient?.name || 'Unknown Ingredient'
        }
      })
    )

    return ingredientsWithNames
  }

  /**
   * Get product with all its ingredients
   */
  static async getWithIngredients(id: string): Promise<ProductWithIngredients | undefined> {
    const product = await this.getById(id)
    if (!product) return undefined

    // Get product ingredients with ingredient details
    const productIngredients = await db.productIngredients
      .where('productId')
      .equals(id)
      .toArray()

    const ingredientsWithDetails = await Promise.all(
      productIngredients.map(async (pi) => {
        const ingredient = await db.ingredients.get(pi.ingredientId)
        return {
          ...pi,
          ingredient: ingredient!
        }
      })
    )

    return {
      ...product,
      ingredients: ingredientsWithDetails
    }
  }

  /**
   * Create a new product
   */
  static async create(productData: Omit<NewProduct, 'id' | 'isActive'>): Promise<Product> {
    const now = new Date().toISOString()
    const newProduct: Product = {
      id: uuidv4(),
      ...productData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.products.add(newProduct)
    return newProduct
  }

  /**
   * Update an existing product
   */
  static async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    const now = new Date().toISOString()

    await db.products.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Product not found')
    }

    return updated
  }

  /**
   * Soft delete a product (set isActive to false)
   */
  static async delete(id: string): Promise<void> {
    // Check if product is used in any production batches
    const isUsedInProduction = await this.isUsedInProduction(id)
    if (isUsedInProduction) {
      throw new Error('Cannot delete product that is used in production batches')
    }

    const now = new Date().toISOString()
    await db.products.update(id, {
      isActive: false,
      updatedAt: now,
    })
  }

  /**
   * Check if product is used in any production batches
   */
  static async isUsedInProduction(productId: string): Promise<boolean> {
    // This would need to be implemented when we add product tracking to production batches
    // For now, return false to allow deletion
    return false
  }

  /**
   * Add ingredient to product
   */
  static async addIngredient(
    productId: string,
    ingredientId: string,
    usagePerCup: number,
    note: string = ''
  ): Promise<ProductIngredient> {
    // Check if relationship already exists
    const existing = await db.productIngredients
      .where('productId')
      .equals(productId)
      .and(pi => pi.ingredientId === ingredientId)
      .first()

    if (existing) {
      throw new Error('Ingredient is already added to this product')
    }

    const now = new Date().toISOString()
    const productIngredient: ProductIngredient = {
      id: uuidv4(),
      productId,
      ingredientId,
      usagePerCup,
      note,
      createdAt: now,
      updatedAt: now,
    }

    await db.productIngredients.add(productIngredient)
    return productIngredient
  }

  /**
   * Update ingredient usage in product
   */
  static async updateIngredientUsage(
    productId: string,
    ingredientId: string,
    usagePerCup: number,
    note?: string
  ): Promise<ProductIngredient> {
    const existing = await db.productIngredients
      .where('productId')
      .equals(productId)
      .and(pi => pi.ingredientId === ingredientId)
      .first()

    if (!existing) {
      throw new Error('Product ingredient relationship not found')
    }

    const now = new Date().toISOString()
    const updates: Partial<ProductIngredient> = {
      usagePerCup,
      updatedAt: now,
    }

    if (note !== undefined) {
      updates.note = note
    }

    await db.productIngredients.update(existing.id, updates)

    const updated = await db.productIngredients.get(existing.id)
    if (!updated) {
      throw new Error('Failed to update product ingredient')
    }

    return updated
  }

  /**
   * Remove ingredient from product
   */
  static async removeIngredient(productId: string, ingredientId: string): Promise<void> {
    const existing = await db.productIngredients
      .where('productId')
      .equals(productId)
      .and(pi => pi.ingredientId === ingredientId)
      .first()

    if (!existing) {
      throw new Error('Product ingredient relationship not found')
    }

    await db.productIngredients.delete(existing.id)
  }

  /**
   * Get COGS breakdown for a product
   */
  static async getCOGSBreakdown(productId: string): Promise<{
    totalCostPerCup: number
    ingredients: Array<{
      id: string
      name: string
      costPerCup: number
      percentage: number
      usagePerCup: number
      unit: string
    }>
  }> {
    const productWithIngredients = await this.getWithIngredients(productId)
    if (!productWithIngredients) {
      throw new Error('Product not found')
    }

    const ingredients = productWithIngredients.ingredients.map(pi => {
      const ingredient = pi.ingredient
      const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
      
      return {
        id: ingredient.id,
        name: ingredient.name,
        costPerCup,
        usagePerCup: pi.usagePerCup,
        unit: ingredient.unit,
        percentage: 0 // Will be calculated below
      }
    })

    const totalCostPerCup = ingredients.reduce((sum, ing) => sum + ing.costPerCup, 0)

    // Calculate percentages
    ingredients.forEach(ing => {
      ing.percentage = totalCostPerCup > 0 ? (ing.costPerCup / totalCostPerCup) * 100 : 0
    })

    return {
      totalCostPerCup,
      ingredients
    }
  }

  /**
   * Get all products with their ingredient counts and COGS calculations
   */
  static async getAllWithIngredientCounts(includeInactive: boolean = false): Promise<Array<Product & { ingredientCount: number, cogsPerCup: number }>> {
    try {
      const products = await this.getAll(includeInactive)

      // If no products exist, return empty array
      if (products.length === 0) {
        return []
      }

      const productsWithCounts = await Promise.all(
        products.map(async (product) => {
          try {
            const ingredientCount = await db.productIngredients
              .where('productId')
              .equals(product.id)
              .count()

            // Calculate COGS per cup for this product
            let cogsPerCup = 0
            try {
              const productWithIngredients = await this.getWithIngredients(product.id)
              if (productWithIngredients && productWithIngredients.ingredients.length > 0) {
                cogsPerCup = productWithIngredients.ingredients.reduce((total, pi) => {
                  const ingredient = pi.ingredient
                  const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
                  return total + costPerCup
                }, 0)
              }
            } catch (cogsError) {
              console.error(`ProductService.getAllWithIngredientCounts() - Error calculating COGS for product ${product.id}:`, cogsError)
              // COGS remains 0 if calculation fails
            }

            return {
              ...product,
              ingredientCount,
              cogsPerCup: Math.round(cogsPerCup) // Round to nearest IDR
            }
          } catch (error) {
            console.error(`ProductService.getAllWithIngredientCounts() - Error processing product ${product.id}:`, error)
            // Return product with 0 count and COGS if there's an error
            return {
              ...product,
              ingredientCount: 0,
              cogsPerCup: 0
            }
          }
        })
      )

      return productsWithCounts
    } catch (error) {
      console.error('ProductService.getAllWithIngredientCounts() - Database error:', error)

      // Re-throw the error from getAll() if it's already a helpful message
      if (error.message.includes('Database corruption detected')) {
        throw error
      }

      throw new Error(`Failed to retrieve products with ingredient counts: ${error.message}`)
    }
  }
}
