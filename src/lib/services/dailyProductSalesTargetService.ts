import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type {
  DailyProductSalesTarget,
  DailyProductSalesTargetWithDetails,
  Menu,
  Product,
  Branch,
  MenuProduct
} from '../db/schema'

export interface ProductTargetForDate {
  menuId: string
  productId: string
  branchId: string
  targetDate: string
  targetQuantity: number
  note: string
  menu: Menu
  product: Product
  branch: Branch
  menuProduct: MenuProduct
}

export class DailyProductSalesTargetService {
  /**
   * Get all product targets for a specific date and branch
   */
  static async getTargetsForDate(
    targetDate: string, 
    branchId: string
  ): Promise<DailyProductSalesTargetWithDetails[]> {
    try {
      const targets = await db.dailyProductSalesTargets
        .where({ targetDate, branchId })
        .toArray()

      // Get related data for each target
      const targetsWithDetails: DailyProductSalesTargetWithDetails[] = []
      
      for (const target of targets) {
        const [menu, product, branch] = await Promise.all([
          db.menus.get(target.menuId),
          db.products.get(target.productId),
          db.branches.get(target.branchId)
        ])

        if (menu && product && branch) {
          targetsWithDetails.push({
            ...target,
            menu,
            product,
            branch
          })
        }
      }

      return targetsWithDetails
    } catch (error) {
      console.error('Error fetching targets for date:', error)
      throw error
    }
  }

  /**
   * Get all menus with their products and targets for a specific date and branch
   */
  static async getMenusWithProductTargets(
    targetDate: string,
    branchId: string
  ): Promise<ProductTargetForDate[]> {
    try {
      // Get all active menus for the branch
      const menuBranches = await db.menuBranches
        .where({ branchId })
        .toArray()

      const menuIds = menuBranches.map(mb => mb.menuId)
      
      const menus = await db.menus
        .where('id')
        .anyOf(menuIds)
        .and(menu => menu.status === 'active')
        .toArray()

      const results: ProductTargetForDate[] = []

      for (const menu of menus) {
        // Get all products for this menu
        const menuProducts = await db.menuProducts
          .where({ menuId: menu.id })
          .toArray()

        for (const menuProduct of menuProducts) {
          const product = await db.products.get(menuProduct.productId)
          const branch = await db.branches.get(branchId)
          
          if (product && product.isActive && branch) {
            // Check if target exists
            const existingTarget = await db.dailyProductSalesTargets
              .where({
                menuId: menu.id,
                productId: product.id,
                branchId,
                targetDate
              })
              .first()

            results.push({
              menuId: menu.id,
              productId: product.id,
              branchId,
              targetDate,
              targetQuantity: existingTarget?.targetQuantity || 0,
              note: existingTarget?.note || '',
              menu,
              product,
              branch,
              menuProduct
            })
          }
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching menus with product targets:', error)
      throw error
    }
  }

  /**
   * Create or update a product target
   */
  static async createOrUpdateTarget(
    menuId: string,
    productId: string,
    branchId: string,
    targetDate: string,
    targetQuantity: number,
    note: string = ''
  ): Promise<DailyProductSalesTarget> {
    try {
      const now = new Date().toISOString()

      // Check if target already exists
      const existingTarget = await db.dailyProductSalesTargets
        .where({
          menuId,
          productId,
          branchId,
          targetDate
        })
        .first()

      if (existingTarget) {
        // Update existing target
        const updatedTarget: DailyProductSalesTarget = {
          ...existingTarget,
          targetQuantity,
          note,
          updatedAt: now
        }

        await db.dailyProductSalesTargets.put(updatedTarget)
        return updatedTarget
      } else {
        // Create new target
        const newTarget: DailyProductSalesTarget = {
          id: uuidv4(),
          menuId,
          productId,
          branchId,
          targetDate,
          targetQuantity,
          note,
          createdAt: now,
          updatedAt: now
        }

        await db.dailyProductSalesTargets.add(newTarget)
        return newTarget
      }
    } catch (error) {
      console.error('Error creating/updating target:', error)
      throw error
    }
  }

  /**
   * Delete a product target
   */
  static async deleteTarget(id: string): Promise<void> {
    try {
      await db.dailyProductSalesTargets.delete(id)
    } catch (error) {
      console.error('Error deleting target:', error)
      throw error
    }
  }

  /**
   * Get a specific target by menu, product, branch, and date
   */
  static async getTarget(
    menuId: string,
    productId: string,
    branchId: string,
    targetDate: string
  ): Promise<DailyProductSalesTarget | undefined> {
    try {
      return await db.dailyProductSalesTargets
        .where({
          menuId,
          productId,
          branchId,
          targetDate
        })
        .first()
    } catch (error) {
      console.error('Error fetching target:', error)
      throw error
    }
  }

  /**
   * Get all targets for a specific product across all dates
   */
  static async getTargetsForProduct(
    menuId: string,
    productId: string,
    branchId: string
  ): Promise<DailyProductSalesTarget[]> {
    try {
      return await db.dailyProductSalesTargets
        .where({
          menuId,
          productId,
          branchId
        })
        .toArray()
    } catch (error) {
      console.error('Error fetching targets for product:', error)
      throw error
    }
  }

  /**
   * Bulk create or update targets
   */
  static async bulkCreateOrUpdateTargets(
    targets: Array<{
      menuId: string
      productId: string
      branchId: string
      targetDate: string
      targetQuantity: number
      note?: string
    }>
  ): Promise<DailyProductSalesTarget[]> {
    try {
      const results: DailyProductSalesTarget[] = []
      
      for (const target of targets) {
        const result = await this.createOrUpdateTarget(
          target.menuId,
          target.productId,
          target.branchId,
          target.targetDate,
          target.targetQuantity,
          target.note || ''
        )
        results.push(result)
      }

      return results
    } catch (error) {
      console.error('Error bulk creating/updating targets:', error)
      throw error
    }
  }
}
