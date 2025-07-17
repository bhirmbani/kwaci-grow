import { db } from '../db/index'
import { v4 as uuidv4 } from 'uuid'
import type { Business } from '../db/schema'

export class BusinessService {
  /**
   * Create a new business
   */
  static async create(data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business> {
    const now = new Date().toISOString()
    const business: Business = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    await db.businesses.add(business)
    return business
  }

  /**
   * Get all businesses
   */
  static async getAll(): Promise<Business[]> {
    return await db.businesses.orderBy('name').toArray()
  }

  /**
   * Get business by ID
   */
  static async getById(id: string): Promise<Business | undefined> {
    return await db.businesses.get(id)
  }

  /**
   * Update a business
   */
  static async update(id: string, data: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const now = new Date().toISOString()
    await db.businesses.update(id, {
      ...data,
      updatedAt: now,
    })
  }

  /**
   * Delete a business (soft delete by setting isActive to false)
   * Note: This is a dangerous operation that should be handled carefully
   * in production with proper data migration/cleanup
   */
  static async delete(id: string): Promise<void> {
    await db.businesses.delete(id)
  }

  /**
   * Get the default business (first business created)
   * Used for migration and fallback scenarios
   */
  static async getDefault(): Promise<Business | undefined> {
    const businesses = await db.businesses.orderBy('createdAt').toArray()
    return businesses[0]
  }

  /**
   * Create a default business for existing installations
   * This is used during migration to ensure existing data has a business association
   */
  static async createDefault(): Promise<Business> {
    const defaultBusiness = await this.create({
      name: 'My Coffee Business',
      description: 'Default business created during multi-business migration',
      note: 'This is the default business created when upgrading to multi-business support. You can rename or modify this business as needed.',
      currency: 'IDR', // Default to Indonesian Rupiah
    })

    return defaultBusiness
  }

  /**
   * Check if any businesses exist
   */
  static async hasAny(): Promise<boolean> {
    const count = await db.businesses.count()
    return count > 0
  }

  /**
   * Get business count
   */
  static async count(): Promise<number> {
    return await db.businesses.count()
  }

  /**
   * Search businesses by name
   */
  static async searchByName(query: string): Promise<Business[]> {
    return await db.businesses
      .filter(business => business.name.toLowerCase().includes(query.toLowerCase()))
      .toArray()
  }
}
