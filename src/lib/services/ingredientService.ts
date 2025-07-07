import { db } from '../db'
import type { Ingredient, NewIngredient, IngredientWithUsage } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'

export class IngredientService {
  /**
   * Get all ingredients (active and inactive)
   */
  static async getAll(includeInactive: boolean = false): Promise<Ingredient[]> {
    try {
      if (includeInactive) {
        return await db.ingredients.orderBy('name').toArray()
      } else {
        return await db.ingredients
          .filter(ingredient => ingredient.isActive === true)
          .sortBy('name')
      }
    } catch (error) {
      console.error('IngredientService.getAll() - Database error:', error)

      // Only check for actual IDBKeyRange errors, not general database errors
      if (error instanceof Error && error.name === 'DataError' && error.message && error.message.includes('IDBKeyRange')) {
        throw new Error(
          'Database corruption detected (IDBKeyRange error). A database reset is required to fix this issue.'
        )
      }

      // For other errors, provide a generic message but don't assume corruption
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to retrieve ingredients: ${errorMessage}`)
    }
  }

  /**
   * Get a single ingredient by ID
   */
  static async getById(id: string): Promise<Ingredient | undefined> {
    return await db.ingredients.get(id)
  }

  /**
   * Get ingredient with usage information (which products use it)
   */
  static async getWithUsage(id: string): Promise<IngredientWithUsage | undefined> {
    const ingredient = await this.getById(id)
    if (!ingredient) return undefined

    // Get product ingredients that use this ingredient
    const productIngredients = await db.productIngredients
      .where('ingredientId')
      .equals(id)
      .toArray()

    const usageWithProducts = await Promise.all(
      productIngredients.map(async (pi) => {
        const product = await db.products.get(pi.productId)
        return {
          ...pi,
          product: product!
        }
      })
    )

    return {
      ...ingredient,
      usageInProducts: usageWithProducts
    }
  }

  /**
   * Create a new ingredient
   */
  static async create(ingredientData: Omit<NewIngredient, 'id' | 'isActive'>): Promise<Ingredient> {
    const now = new Date().toISOString()
    const newIngredient: Ingredient = {
      id: uuidv4(),
      ...ingredientData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.ingredients.add(newIngredient)
    
    return newIngredient
  }

  /**
   * Update an existing ingredient
   */
  static async update(id: string, updates: Partial<Omit<Ingredient, 'id' | 'createdAt'>>): Promise<Ingredient> {
    const now = new Date().toISOString()

    await db.ingredients.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Ingredient not found')
    }

    return updated
  }

  /**
   * Soft delete an ingredient (set isActive to false)
   */
  static async delete(id: string): Promise<void> {
    // Check if ingredient is used in any products
    const isUsedInProducts = await this.isUsedInProducts(id)
    if (isUsedInProducts) {
      throw new Error('Cannot delete ingredient that is used in products')
    }

    const now = new Date().toISOString()
    await db.ingredients.update(id, {
      isActive: false,
      updatedAt: now,
    })
  }

  /**
   * Check if ingredient is used in any products
   */
  static async isUsedInProducts(ingredientId: string): Promise<boolean> {
    const count = await db.productIngredients
      .where('ingredientId')
      .equals(ingredientId)
      .count()
    
    return count > 0
  }

  /**
   * Get ingredients by category
   */
  static async getByCategory(category: string): Promise<Ingredient[]> {
    return await db.ingredients
      .filter(ingredient => ingredient.category === category && ingredient.isActive === true)
      .sortBy('name')
  }

  /**
   * Get all unique categories
   */
  static async getCategories(): Promise<string[]> {
    const categories = await db.ingredientCategories.orderBy('name').toArray()
    return categories.map(cat => cat.name)
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const trimmedName = categoryName.trim()
      if (!trimmedName) {
        return { success: false, error: 'Category name cannot be empty' }
      }

      // Check if category already exists
      const existingCategories = await this.getCategories()
      if (existingCategories.includes(trimmedName)) {
        return { success: false, error: 'Category already exists' }
      }

      const now = new Date().toISOString()
      const categoryId = `cat-${trimmedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      
      await db.ingredientCategories.add({
        id: categoryId,
        name: trimmedName,
        description: `Category for ${trimmedName}`,
        createdAt: now,
        updatedAt: now
      })

      return { success: true }
    } catch (error) {
      console.error('Error creating category:', error)
      return { success: false, error: 'Failed to create category' }
    }
  }

  /**
   * Delete a category by checking for ingredient usage and removing from categories table
   */
  static async deleteCategory(categoryName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if any ingredients are using this category
      const activeIngredients = await db.ingredients
        .where('category')
        .equals(categoryName)
        .and(ing => ing.isActive)
        .count()
      
      const inactiveIngredients = await db.ingredients
        .where('category')
        .equals(categoryName)
        .and(ing => !ing.isActive)
        .count()
      
      if (activeIngredients > 0) {
        return { 
          success: false, 
          error: `Cannot delete category "${categoryName}" because it has ${activeIngredients} active ingredient(s)` 
        }
      }
      
      if (inactiveIngredients > 0) {
        return { 
          success: false, 
          error: `Cannot delete category "${categoryName}" because it has ${inactiveIngredients} inactive ingredient(s)` 
        }
      }
      
      // Delete the category from the categories table
      const category = await db.ingredientCategories.where('name').equals(categoryName).first()
      if (category) {
        await db.ingredientCategories.delete(category.id)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: 'Failed to delete category' }
    }
  }

  /**
   * Get ingredients count by category
   */
  static async getCategoryUsageCount(categoryName: string): Promise<number> {
    const ingredients = await db.ingredients
      .where('category')
      .equals(categoryName)
      .count()
    return ingredients
  }

  /**
   * Search ingredients by name
   */
  static async searchByName(query: string): Promise<Ingredient[]> {
    const allIngredients = await this.getAll()
    const lowerQuery = query.toLowerCase()
    
    return allIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get ingredients with their usage counts
   */
  static async getAllWithUsageCounts(includeInactive: boolean = false): Promise<Array<Ingredient & { usageCount: number }>> {
    try {
      const ingredients = await this.getAll(includeInactive)

      // If no ingredients exist, return empty array
      if (ingredients.length === 0) {
        return []
      }

      const ingredientsWithCounts = await Promise.all(
        ingredients.map(async (ingredient) => {
          try {
            const usageCount = await db.productIngredients
              .where('ingredientId')
              .equals(ingredient.id)
              .count()

            return {
              ...ingredient,
              usageCount
            }
          } catch (error) {
            console.error(`IngredientService.getAllWithUsageCounts() - Error counting usage for ingredient ${ingredient.id}:`, error)
            // Return ingredient with 0 count if there's an error
            return {
              ...ingredient,
              usageCount: 0
            }
          }
        })
      )

      return ingredientsWithCounts
    } catch (error) {
      console.error('IngredientService.getAllWithUsageCounts() - Database error:', error)

      // Re-throw the error from getAll() if it's already a helpful message
      if (error instanceof Error && error.message.includes('Database corruption detected')) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to retrieve ingredients with usage counts: ${errorMessage}`)
    }
  }

  /**
   * Calculate unit cost for an ingredient
   */
  static calculateUnitCost(ingredient: Ingredient): number {
    if (ingredient.baseUnitQuantity <= 0) return 0
    return ingredient.baseUnitCost / ingredient.baseUnitQuantity
  }

  /**
   * Validate ingredient data
   */
  static validateIngredientData(data: Partial<Ingredient>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required')
    }

    if (data.baseUnitCost !== undefined && data.baseUnitCost < 0) {
      errors.push('Base unit cost cannot be negative')
    }

    if (data.baseUnitQuantity !== undefined && data.baseUnitQuantity <= 0) {
      errors.push('Base unit quantity must be greater than 0')
    }

    if (!data.unit || data.unit.trim() === '') {
      errors.push('Unit is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get ingredients that are compatible with warehouse stock
   * (ingredients that have matching names in stock levels)
   */
  static async getStockCompatibleIngredients(): Promise<Ingredient[]> {
    const ingredients = await this.getAll()
    const stockLevels = await db.stockLevels.toArray()

    return ingredients.filter(ingredient =>
      stockLevels.some(stock =>
        stock.ingredientName === ingredient.name &&
        stock.unit === ingredient.unit
      )
    )
  }

  /**
   * Bulk update ingredients
   */
  static async bulkUpdate(updates: Array<{ id: string; data: Partial<Omit<Ingredient, 'id' | 'createdAt'>> }>): Promise<void> {
    const now = new Date().toISOString()
    
    await db.transaction('rw', db.ingredients, async () => {
      for (const update of updates) {
        await db.ingredients.update(update.id, {
          ...update.data,
          updatedAt: now
        })
      }
    })
  }
}
