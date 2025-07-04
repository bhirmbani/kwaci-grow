import { db } from '../db'
import { type AppSetting, type AppSettingKey } from '../db/schema'

export class AppSettingsService {
  // Get a setting by key
  static async get(key: AppSettingKey): Promise<string | undefined> {
    const setting = await db.appSettings.where('key').equals(key).first()
    return setting?.value
  }

  // Get a setting as a number
  static async getNumber(key: AppSettingKey, defaultValue: number = 0): Promise<number> {
    const value = await this.get(key)
    if (value === undefined) {
      return defaultValue
    }
    
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Set a setting value
  static async set(key: AppSettingKey, value: string): Promise<void> {
    const now = new Date().toISOString()

    // Check if setting exists
    const existing = await db.appSettings.where('key').equals(key).first()

    if (existing && existing.id) {
      // Update existing setting
      await db.appSettings.update(existing.id, {
        value,
        updatedAt: now,
      })
    } else {
      // Create new setting
      const newSetting: AppSetting = {
        key,
        value,
        createdAt: now,
        updatedAt: now,
      }
      await db.appSettings.add(newSetting)
    }
  }

  // Set a number value
  static async setNumber(key: AppSettingKey, value: number): Promise<void> {
    await this.set(key, value.toString())
  }

  // Get all settings as a key-value object
  static async getAll(): Promise<Record<string, string>> {
    const settings = await db.appSettings.toArray()

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
  }

  // Initialize default settings if they don't exist
  static async ensureDefaults(): Promise<void> {
    const defaults = [
      { key: 'days_per_month' as AppSettingKey, value: '22' },
      { key: 'price_per_cup' as AppSettingKey, value: '8000' },
    ]

    for (const defaultSetting of defaults) {
      const existing = await this.get(defaultSetting.key)
      if (existing === undefined) {
        await this.set(defaultSetting.key, defaultSetting.value)
      }
    }
  }
}
