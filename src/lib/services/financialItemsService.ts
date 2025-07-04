import { db } from '../db'
import { type FinancialItem, type NewFinancialItem, type FinancialItemCategory } from '../db/schema'

export class FinancialItemsService {
  // Get all financial items by category
  static async getByCategory(category: FinancialItemCategory): Promise<FinancialItem[]> {
    return await db.financialItems
      .where('category')
      .equals(category)
      .sortBy('createdAt')
  }

  // Get a single financial item by ID
  static async getById(id: string): Promise<FinancialItem | undefined> {
    return await db.financialItems.get(id)
  }

  // Create a new financial item
  static async create(item: NewFinancialItem): Promise<FinancialItem> {
    const now = new Date().toISOString()
    const newItem: FinancialItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    }

    await db.financialItems.put(newItem)

    // Return the created item
    const created = await this.getById(item.id)
    if (!created) {
      throw new Error('Failed to create financial item')
    }

    return created
  }

  // Update an existing financial item
  static async update(id: string, updates: Partial<Omit<FinancialItem, 'id' | 'createdAt'>>): Promise<FinancialItem> {
    const now = new Date().toISOString()

    await db.financialItems.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Financial item not found')
    }

    return updated
  }

  // Delete a financial item
  static async delete(id: string): Promise<void> {
    await db.financialItems.delete(id)
  }

  // Update multiple items for a category (used for bulk updates)
  static async updateCategory(category: FinancialItemCategory, items: Array<Omit<FinancialItem, 'category' | 'createdAt' | 'updatedAt'>>): Promise<FinancialItem[]> {
    const now = new Date().toISOString()

    // Use Dexie transaction
    return await db.transaction('rw', db.financialItems, async () => {
      // Delete existing items in this category
      await db.financialItems.where('category').equals(category).delete()

      // Insert new items
      const newItems: FinancialItem[] = items.map(item => ({
        ...item,
        category,
        createdAt: now,
        updatedAt: now,
      }))

      if (newItems.length > 0) {
        await db.financialItems.bulkPut(newItems)
      }

      // Return the updated items
      return await db.financialItems
        .where('category')
        .equals(category)
        .sortBy('createdAt')
    })
  }
}
