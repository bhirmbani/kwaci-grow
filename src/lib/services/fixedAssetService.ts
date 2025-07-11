import { db } from '../db'
import { type FixedAsset, type NewFixedAsset } from '../db/schema'

export class FixedAssetService {
  // Calculate current value based on straight-line depreciation
  static calculateCurrentValue(purchaseCost: number, purchaseDate: string, depreciationMonths: number): number {
    const purchase = new Date(purchaseDate)
    const now = new Date()
    
    // Calculate months elapsed
    const monthsElapsed = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth())
    
    // If fully depreciated
    if (monthsElapsed >= depreciationMonths) {
      return 0
    }
    
    // Calculate monthly depreciation
    const monthlyDepreciation = purchaseCost / depreciationMonths
    const totalDepreciation = monthlyDepreciation * monthsElapsed
    
    return Math.max(0, purchaseCost - totalDepreciation)
  }

  // Get all fixed assets with calculated current values
  static async getAll(businessId?: string): Promise<FixedAsset[]> {
    let assets: FixedAsset[]

    if (businessId) {
      // Use where().equals().toArray() and sort in JavaScript
      assets = await db.fixedAssets.where('businessId').equals(businessId).toArray()
      // Sort by createdAt in JavaScript
      assets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      assets = await db.fixedAssets.orderBy('createdAt').toArray()
    }

    // Update current values for all assets
    return assets.map(asset => ({
      ...asset,
      currentValue: this.calculateCurrentValue(asset.purchaseCost, asset.purchaseDate, asset.depreciationMonths)
    }))
  }

  // Get a single fixed asset by ID
  static async getById(id: string): Promise<FixedAsset | undefined> {
    const asset = await db.fixedAssets.get(id)
    if (!asset) return undefined
    
    return {
      ...asset,
      currentValue: this.calculateCurrentValue(asset.purchaseCost, asset.purchaseDate, asset.depreciationMonths)
    }
  }

  // Get assets by category
  static async getByCategory(categoryId: string): Promise<FixedAsset[]> {
    const assets = await db.fixedAssets.where('categoryId').equals(categoryId).toArray()
    
    return assets.map(asset => ({
      ...asset,
      currentValue: this.calculateCurrentValue(asset.purchaseCost, asset.purchaseDate, asset.depreciationMonths)
    }))
  }

  // Create a new fixed asset
  static async create(asset: NewFixedAsset): Promise<FixedAsset> {
    const now = new Date().toISOString()
    const currentValue = this.calculateCurrentValue(asset.purchaseCost, asset.purchaseDate, asset.depreciationMonths)
    
    const newAsset: FixedAsset = {
      ...asset,
      currentValue,
      createdAt: now,
      updatedAt: now,
    }

    await db.fixedAssets.put(newAsset)

    // Create corresponding depreciation entry in Fixed Costs
    await this.createDepreciationEntry(newAsset)

    return newAsset
  }

  // Update an existing fixed asset
  static async update(id: string, updates: Partial<Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>>): Promise<FixedAsset> {
    const now = new Date().toISOString()
    const existing = await db.fixedAssets.get(id)
    
    if (!existing) {
      throw new Error('Fixed asset not found')
    }

    // Calculate new current value if depreciation-related fields changed
    const updatedAsset = { ...existing, ...updates }
    const currentValue = this.calculateCurrentValue(
      updatedAsset.purchaseCost, 
      updatedAsset.purchaseDate, 
      updatedAsset.depreciationMonths
    )

    await db.fixedAssets.update(id, {
      ...updates,
      currentValue,
      updatedAt: now,
    })

    const updated = await db.fixedAssets.get(id)
    if (!updated) {
      throw new Error('Failed to update fixed asset')
    }

    // Update corresponding depreciation entry
    await this.updateDepreciationEntry(updated)

    return {
      ...updated,
      currentValue
    }
  }

  // Delete a fixed asset
  static async delete(id: string): Promise<void> {
    // Remove corresponding depreciation entry first
    await this.removeDepreciationEntry(id)
    
    // Then delete the asset
    await db.fixedAssets.delete(id)
  }

  // Create depreciation entry in Fixed Costs
  private static async createDepreciationEntry(asset: FixedAsset): Promise<void> {
    const monthlyDepreciation = asset.purchaseCost / asset.depreciationMonths
    
    const depreciationEntry = {
      id: `depreciation-${asset.id}`,
      name: `Depreciation: ${asset.name}`,
      value: Math.round(monthlyDepreciation),
      category: 'fixed_costs' as const,
      note: `Monthly depreciation for ${asset.name} (${asset.depreciationMonths} months)`,
      sourceAssetId: asset.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.financialItems.put(depreciationEntry)
  }

  // Update depreciation entry in Fixed Costs
  private static async updateDepreciationEntry(asset: FixedAsset): Promise<void> {
    const depreciationId = `depreciation-${asset.id}`
    const monthlyDepreciation = asset.purchaseCost / asset.depreciationMonths
    
    await db.financialItems.update(depreciationId, {
      name: `Depreciation: ${asset.name}`,
      value: Math.round(monthlyDepreciation),
      note: `Monthly depreciation for ${asset.name} (${asset.depreciationMonths} months)`,
      updatedAt: new Date().toISOString(),
    })
  }

  // Remove depreciation entry from Fixed Costs
  private static async removeDepreciationEntry(assetId: string): Promise<void> {
    const depreciationId = `depreciation-${assetId}`
    await db.financialItems.delete(depreciationId)
  }

  // Get summary statistics
  static async getSummary(businessId?: string): Promise<{
    totalAssets: number
    totalPurchaseCost: number
    totalCurrentValue: number
    totalDepreciation: number
  }> {
    const assets = await this.getAll(businessId)

    const totalAssets = assets.length
    const totalPurchaseCost = assets.reduce((sum, asset) => sum + asset.purchaseCost, 0)
    const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
    const totalDepreciation = totalPurchaseCost - totalCurrentValue

    return {
      totalAssets,
      totalPurchaseCost,
      totalCurrentValue,
      totalDepreciation
    }
  }
}
