import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { getCurrentBusinessId } from './businessContext'
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

export interface MenuTargetSummary {
  menuId: string
  branchId: string
  targetDate: string
  targetAmount: number
  menu: Menu
  branch: Branch
}

export class DailyProductSalesTargetService {
  /**
   * Get all product targets for a specific date (all branches)
   */
  static async getAllTargetsForDate(
    targetDate: string,
    businessId?: string
  ): Promise<DailyProductSalesTargetWithDetails[]> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      const targets = await db.dailyProductSalesTargets
        .where('targetDate')
        .equals(targetDate)
        .toArray()

      // Filter by business ID through related entities
      const businessFilteredTargets = []
      for (const target of targets) {
        const branch = await db.branches.get(target.branchId)
        if (branch && branch.businessId === currentBusinessId) {
          businessFilteredTargets.push(target)
        }
      }

      // Get related data for each target
      const targetsWithDetails: DailyProductSalesTargetWithDetails[] = []

      for (const target of businessFilteredTargets) {
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
      console.error('Failed to get all targets for date:', error)
      return []
    }
  }

  /**
   * Get all product targets for a specific date and branch
   */
  static async getTargetsForDate(
    targetDate: string,
    branchId: string,
    businessId?: string
  ): Promise<DailyProductSalesTargetWithDetails[]> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // Verify branch belongs to current business
      const branch = await db.branches.get(branchId)
      if (!branch || branch.businessId !== currentBusinessId) {
        throw new Error('Branch not found or does not belong to current business.')
      }

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
   * Alias for getTargetsForDate - for backward compatibility
   */
  static async getTargetsForDateAndBranch(
    targetDate: string,
    branchId: string,
    businessId?: string
  ): Promise<DailyProductSalesTargetWithDetails[]> {
    return this.getTargetsForDate(targetDate, branchId, businessId)
  }

  /**
   * Get all menus with their products and targets for a specific date and branch
   */
  static async getMenusWithProductTargets(
    targetDate: string,
    branchId: string,
    businessId?: string
  ): Promise<ProductTargetForDate[]> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // Verify branch belongs to current business
      const branch = await db.branches.get(branchId)
      if (!branch) {
        throw new Error(`Branch with ID '${branchId}' not found.`)
      }
      if (branch.businessId !== currentBusinessId) {
        throw new Error(`Branch '${branch.name}' does not belong to the current business.`)
      }

      // Get all active menus for the branch
      const menuBranches = await db.menuBranches
        .where({ branchId })
        .toArray()

      const menuIds = menuBranches.map(mb => mb.menuId)

      const menus = await db.menus
        .where('id')
        .anyOf(menuIds)
        .and(menu => menu.status === 'active' && menu.businessId === currentBusinessId)
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
    note: string = '',
    businessId?: string
  ): Promise<DailyProductSalesTarget> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // Verify all entities belong to current business
      const [menu, product, branch] = await Promise.all([
        db.menus.get(menuId),
        db.products.get(productId),
        db.branches.get(branchId)
      ])

      if (!menu || menu.businessId !== currentBusinessId) {
        throw new Error('Menu not found or does not belong to current business.')
      }
      if (!product || product.businessId !== currentBusinessId) {
        throw new Error('Product not found or does not belong to current business.')
      }
      if (!branch || branch.businessId !== currentBusinessId) {
        throw new Error('Branch not found or does not belong to current business.')
      }

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

  /**
   * Convert product-level targets to menu-level summaries for analytics
   */
  static async getMenuTargetSummariesForDate(
    targetDate: string,
    branchId?: string
  ): Promise<MenuTargetSummary[]> {
    try {
      const productTargets = branchId
        ? await this.getTargetsForDate(targetDate, branchId)
        : await this.getAllTargetsForDate(targetDate)

      // Group by menu and branch, then calculate total target amount
      const menuTargetMap = new Map<string, MenuTargetSummary>()

      for (const target of productTargets) {
        const key = `${target.menuId}-${target.branchId}`

        if (!menuTargetMap.has(key)) {
          menuTargetMap.set(key, {
            menuId: target.menuId,
            branchId: target.branchId,
            targetDate: target.targetDate,
            targetAmount: 0,
            menu: target.menu,
            branch: target.branch
          })
        }

        const menuTarget = menuTargetMap.get(key)!

        // Get the menu product to find the price
        const menuProduct = await db.menuProducts
          .where({ menuId: target.menuId, productId: target.productId })
          .first()

        if (menuProduct) {
          // Calculate target amount: quantity * price
          menuTarget.targetAmount += target.targetQuantity * menuProduct.price
        }
      }

      return Array.from(menuTargetMap.values())
    } catch (error) {
      console.error('Failed to get menu target summaries:', error)
      return []
    }
  }
}
