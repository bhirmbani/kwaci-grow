import { FinancialItemsService } from './financialItemsService'
import { FINANCIAL_ITEM_CATEGORIES, type FinancialItem } from '../db/schema'
import { depreciationEvents } from '../events/depreciationEvents'
import { v4 as uuidv4 } from 'uuid'

export class DepreciationService {
  /**
   * Calculate monthly depreciation amount for a fixed asset
   */
  static calculateMonthlyDepreciation(assetValue: number, usefulLifeYears: number): number {
    if (usefulLifeYears <= 0) {
      throw new Error('Useful life must be greater than 0')
    }
    
    const annualDepreciation = assetValue / usefulLifeYears
    const monthlyDepreciation = annualDepreciation / 12
    
    return Math.round(monthlyDepreciation) // Round to nearest IDR
  }

  /**
   * Generate depreciation entry name for a fixed asset
   */
  static generateDepreciationName(assetName: string): string {
    return `Depreciation: ${assetName}`
  }

  /**
   * Find existing depreciation entry for a fixed asset
   */
  static async findDepreciationEntry(assetId: string): Promise<FinancialItem | null> {
    const fixedCostItems = await FinancialItemsService.getByCategory(FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS)
    
    return fixedCostItems.find(item => item.sourceAssetId === assetId) || null
  }

  /**
   * Create a new depreciation entry for a fixed asset
   */
  static async createDepreciationEntry(
    asset: FinancialItem,
    usefulLifeYears: number
  ): Promise<FinancialItem> {
    if (!asset.isFixedAsset) {
      throw new Error('Asset must be marked as fixed asset')
    }

    if (!usefulLifeYears || usefulLifeYears <= 0) {
      throw new Error('Useful life must be greater than 0')
    }

    // Check if depreciation entry already exists
    const existingEntry = await this.findDepreciationEntry(asset.id)
    if (existingEntry) {
      throw new Error('Depreciation entry already exists for this asset')
    }

    const monthlyDepreciation = this.calculateMonthlyDepreciation(asset.value, usefulLifeYears)
    const depreciationName = this.generateDepreciationName(asset.name)

    const depreciationEntry: FinancialItem = {
      id: uuidv4(),
      name: depreciationName,
      value: monthlyDepreciation,
      category: FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS,
      note: `Auto-generated depreciation for ${asset.name} (${usefulLifeYears} years useful life)`,
      sourceAssetId: asset.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const createdEntry = await FinancialItemsService.create(depreciationEntry)

    // Emit event for real-time UI updates
    depreciationEvents.emitDepreciationCreated(asset.id, asset.name)
    console.log(`✅ Depreciation entry created and event emitted for: ${asset.name}`)

    return createdEntry
  }

  /**
   * Update existing depreciation entry for a fixed asset
   */
  static async updateDepreciationEntry(
    asset: FinancialItem,
    usefulLifeYears: number
  ): Promise<FinancialItem> {
    if (!asset.isFixedAsset) {
      throw new Error('Asset must be marked as fixed asset')
    }

    if (!usefulLifeYears || usefulLifeYears <= 0) {
      throw new Error('Useful life must be greater than 0')
    }

    const existingEntry = await this.findDepreciationEntry(asset.id)
    if (!existingEntry) {
      throw new Error('No depreciation entry found for this asset')
    }

    const monthlyDepreciation = this.calculateMonthlyDepreciation(asset.value, usefulLifeYears)
    const depreciationName = this.generateDepreciationName(asset.name)

    const updates = {
      name: depreciationName,
      value: monthlyDepreciation,
      note: `Auto-generated depreciation for ${asset.name} (${usefulLifeYears} years useful life)`,
    }

    const updatedEntry = await FinancialItemsService.update(existingEntry.id, updates)

    // Emit event for real-time UI updates
    depreciationEvents.emitDepreciationUpdated(asset.id, asset.name)
    console.log(`✅ Depreciation entry updated and event emitted for: ${asset.name}`)

    return updatedEntry
  }

  /**
   * Delete depreciation entry for a fixed asset
   */
  static async deleteDepreciationEntry(assetId: string, assetName?: string): Promise<void> {
    const existingEntry = await this.findDepreciationEntry(assetId)
    if (existingEntry) {
      await FinancialItemsService.delete(existingEntry.id)

      // Emit event for real-time UI updates
      const name = assetName || existingEntry.name.replace('Depreciation: ', '')
      depreciationEvents.emitDepreciationDeleted(assetId, name)
      console.log(`✅ Depreciation entry deleted and event emitted for: ${name}`)
    }
  }

  /**
   * Handle fixed asset changes - create, update, or delete depreciation entry as needed
   */
  static async handleFixedAssetChange(
    previousAsset: FinancialItem | null,
    currentAsset: FinancialItem
  ): Promise<void> {
    const wasFixedAsset = previousAsset?.isFixedAsset || false
    const isFixedAsset = currentAsset.isFixedAsset || false
    const usefulLife = currentAsset.estimatedUsefulLifeYears

    // Case 1: Became a fixed asset
    if (!wasFixedAsset && isFixedAsset && usefulLife && usefulLife > 0) {
      await this.createDepreciationEntry(currentAsset, usefulLife)
      return
    }

    // Case 2: No longer a fixed asset
    if (wasFixedAsset && !isFixedAsset) {
      await this.deleteDepreciationEntry(currentAsset.id)
      return
    }

    // Case 3: Still a fixed asset but values changed
    if (isFixedAsset && usefulLife && usefulLife > 0) {
      const existingEntry = await this.findDepreciationEntry(currentAsset.id)
      
      if (existingEntry) {
        // Update existing entry
        await this.updateDepreciationEntry(currentAsset, usefulLife)
      } else {
        // Create new entry (shouldn't happen but handle gracefully)
        await this.createDepreciationEntry(currentAsset, usefulLife)
      }
    }
  }

  /**
   * Handle fixed asset deletion - remove associated depreciation entry
   */
  static async handleFixedAssetDeletion(assetId: string, assetName?: string): Promise<void> {
    await this.deleteDepreciationEntry(assetId, assetName)
  }
}
