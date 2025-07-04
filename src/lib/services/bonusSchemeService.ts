import { db } from '../db'
import { type BonusScheme, type NewBonusScheme } from '../db/schema'

export class BonusSchemeService {
  // Get the current bonus scheme (there should only be one)
  static async getCurrent(): Promise<BonusScheme | undefined> {
    const schemes = await db.bonusSchemes.orderBy('createdAt').limit(1).toArray()
    return schemes[0]
  }

  // Create a new bonus scheme (replaces the existing one)
  static async create(scheme: Omit<NewBonusScheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<BonusScheme> {
    const now = new Date().toISOString()

    return await db.transaction('rw', db.bonusSchemes, async () => {
      // Delete existing bonus scheme
      await db.bonusSchemes.clear()

      // Insert new bonus scheme
      const newScheme: BonusScheme = {
        ...scheme,
        createdAt: now,
        updatedAt: now,
      }

      const id = await db.bonusSchemes.add(newScheme)

      // Return the created scheme
      const created = await db.bonusSchemes.get(id)

      if (!created) {
        throw new Error('Failed to create bonus scheme')
      }

      return created
    })
  }

  // Update the current bonus scheme
  static async update(updates: Partial<Omit<BonusScheme, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BonusScheme> {
    const current = await this.getCurrent()
    if (!current || !current.id) {
      throw new Error('No bonus scheme found to update')
    }

    const now = new Date().toISOString()

    await db.bonusSchemes.update(current.id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getCurrent()
    if (!updated) {
      throw new Error('Failed to update bonus scheme')
    }

    return updated
  }

  // Initialize with default values if no scheme exists
  static async ensureExists(): Promise<BonusScheme> {
    const current = await this.getCurrent()
    if (current) {
      return current
    }

    // Create default bonus scheme
    return await this.create({
      target: 1320,
      perCup: 500,
      baristaCount: 1,
      note: '',
    })
  }
}
