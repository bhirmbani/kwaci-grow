import { db } from '../db'
import { type AssetCategory, type NewAssetCategory } from '../db/schema'

export class AssetCategoryService {
  // Get all asset categories
  static async getAll(): Promise<AssetCategory[]> {
    return await db.assetCategories.orderBy('name').toArray()
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
    // Check if category is in use
    const usageCount = await this.getUsageCount(id)
    if (usageCount > 0) {
      throw new Error(`Cannot delete category. It is used by ${usageCount} asset(s).`)
    }

    await db.assetCategories.delete(id)
  }

  // Get usage count for a category (number of assets using it)
  static async getUsageCount(categoryId: string): Promise<number> {
    return await db.fixedAssets.where('categoryId').equals(categoryId).count()
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
