import { db } from '../db'
import { type AssetCategory, type NewAssetCategory } from '../db/schema'

export class AssetCategoryService {
  // Get all asset categories
  static async getAll(businessId?: string): Promise<AssetCategory[]> {
    if (businessId) {
      // Use where().equals().toArray() and sort in JavaScript
      const categories = await db.assetCategories.where('businessId').equals(businessId).toArray()
      // Sort by name in JavaScript
      return categories.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      return await db.assetCategories.orderBy('name').toArray()
    }
  }

  // Get a single category by ID
  static async getById(id: string): Promise<AssetCategory | undefined> {
    return await db.assetCategories.get(id)
  }

  // Get category by name (for validation)
  static async getByName(name: string): Promise<AssetCategory | undefined> {
    return await db.assetCategories.where('name').equalsIgnoreCase(name).first()
  }

  // Create a new category
  static async create(category: NewAssetCategory): Promise<AssetCategory> {
    // Check if category with same name already exists
    const existing = await this.getByName(category.name)
    if (existing) {
      throw new Error(`Category "${category.name}" already exists`)
    }

    const now = new Date().toISOString()
    const newCategory: AssetCategory = {
      ...category,
      createdAt: now,
      updatedAt: now,
    }

    await db.assetCategories.put(newCategory)
    return newCategory
  }

  // Update an existing category
  static async update(id: string, updates: Partial<Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AssetCategory> {
    const now = new Date().toISOString()
    
    // If updating name, check for duplicates
    if (updates.name) {
      const existing = await this.getByName(updates.name)
      if (existing && existing.id !== id) {
        throw new Error(`Category "${updates.name}" already exists`)
      }
    }

    await db.assetCategories.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Category not found')
    }

    return updated
  }

  // Delete a category
  static async delete(id: string): Promise<void> {
    try {
      // Get category name for better error messages
      const category = await this.getById(id)
      const categoryName = category?.name || 'Unknown Category'

      // Check if category is in use
      const usageCount = await this.getUsageCount(id)
      if (usageCount > 0) {
        throw new Error(`Cannot delete "${categoryName}". It is currently used by ${usageCount} asset(s). Please reassign or delete those assets first.`)
      }

      await db.assetCategories.delete(id)
    } catch (error) {
      // Re-throw with more context if it's our custom error
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        throw error
      }

      // Handle database-level errors
      if (error instanceof Error && error.message.includes('KeyPath')) {
        throw new Error('Database indexing error. Please refresh the page and try again.')
      }

      // Generic fallback
      throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get usage count for a category (number of assets using it)
  static async getUsageCount(categoryId: string): Promise<number> {
    try {
      // Try using the indexed query first
      return await db.fixedAssets.where('categoryId').equals(categoryId).count()
    } catch (error) {
      // Fallback to manual filtering if index is not available
      console.warn('CategoryId index not available, using fallback method:', error)
      const allAssets = await db.fixedAssets.toArray()
      return allAssets.filter(asset => asset.categoryId === categoryId).length
    }
  }

  // Get categories with usage counts
  static async getAllWithUsage(): Promise<Array<AssetCategory & { usageCount: number }>> {
    const categories = await this.getAll()
    
    const categoriesWithUsage = await Promise.all(
      categories.map(async (category) => ({
        ...category,
        usageCount: await this.getUsageCount(category.id)
      }))
    )

    return categoriesWithUsage
  }

  // Generate unique ID for new category
  static generateId(): string {
    return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
