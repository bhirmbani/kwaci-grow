import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { 
  DailySalesTarget, 
  NewDailySalesTarget,
  Menu,
  Branch
} from '../db/schema'

export interface SalesTargetWithDetails extends DailySalesTarget {
  menu: Menu
  branch: Branch
}

export class SalesTargetService {
  /**
   * Get all sales targets for a menu (optionally filtered by branch)
   */
  static async getTargetsForMenu(menuId: string, branchId?: string): Promise<DailySalesTarget[]> {
    try {
      let query = db.dailySalesTargets.where('menuId').equals(menuId)
      
      if (branchId) {
        // Filter by both menuId and branchId
        const allTargets = await query.toArray()
        return allTargets.filter(target => target.branchId === branchId)
      }
      
      return await query.toArray()
    } catch (error) {
      console.error('SalesTargetService.getTargetsForMenu() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales targets for a specific branch
   */
  static async getTargetsForBranch(branchId: string): Promise<DailySalesTarget[]> {
    try {
      return await db.dailySalesTargets
        .where('branchId')
        .equals(branchId)
        .toArray()
    } catch (error) {
      console.error('SalesTargetService.getTargetsForBranch() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales target for a specific date, menu, and branch
   */
  static async getTargetForDate(menuId: string, branchId: string, date: string): Promise<DailySalesTarget | null> {
    try {
      const targets = await db.dailySalesTargets
        .where('menuId')
        .equals(menuId)
        .toArray()
      
      const target = targets.find(t => t.branchId === branchId && t.targetDate === date)
      return target || null
    } catch (error) {
      console.error('SalesTargetService.getTargetForDate() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales targets for a date range
   */
  static async getTargetsForDateRange(
    menuId: string, 
    branchId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailySalesTarget[]> {
    try {
      const targets = await db.dailySalesTargets
        .where('menuId')
        .equals(menuId)
        .toArray()
      
      return targets.filter(target => 
        target.branchId === branchId &&
        target.targetDate >= startDate &&
        target.targetDate <= endDate
      )
    } catch (error) {
      console.error('SalesTargetService.getTargetsForDateRange() - Database error:', error)
      throw error
    }
  }

  /**
   * Get all sales targets with menu and branch details
   */
  static async getAllWithDetails(): Promise<SalesTargetWithDetails[]> {
    try {
      const targets = await db.dailySalesTargets.toArray()
      
      const targetsWithDetails = await Promise.all(
        targets.map(async (target) => {
          const [menu, branch] = await Promise.all([
            db.menus.get(target.menuId),
            db.branches.get(target.branchId)
          ])
          
          return {
            ...target,
            menu: menu!,
            branch: branch!
          }
        })
      )
      
      return targetsWithDetails.filter(target => target.menu && target.branch)
    } catch (error) {
      console.error('SalesTargetService.getAllWithDetails() - Database error:', error)
      throw error
    }
  }

  /**
   * Set or update a sales target
   */
  static async setTarget(targetData: Omit<NewDailySalesTarget, 'id'>): Promise<DailySalesTarget> {
    const now = new Date().toISOString()
    
    // Check if target already exists for this date/menu/branch combination
    const existingTarget = await this.getTargetForDate(
      targetData.menuId, 
      targetData.branchId, 
      targetData.targetDate
    )
    
    if (existingTarget) {
      // Update existing target
      await db.dailySalesTargets.update(existingTarget.id, {
        targetAmount: targetData.targetAmount,
        note: targetData.note,
        updatedAt: now,
      })
      
      const updated = await db.dailySalesTargets.get(existingTarget.id)
      return updated!
    } else {
      // Create new target
      const newTarget: DailySalesTarget = {
        id: uuidv4(),
        ...targetData,
        createdAt: now,
        updatedAt: now,
      }
      
      await db.dailySalesTargets.add(newTarget)
      return newTarget
    }
  }

  /**
   * Update an existing sales target
   */
  static async updateTarget(id: string, updates: Partial<Omit<DailySalesTarget, 'id' | 'createdAt'>>): Promise<DailySalesTarget> {
    const now = new Date().toISOString()

    await db.dailySalesTargets.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await db.dailySalesTargets.get(id)
    if (!updated) {
      throw new Error('Sales target not found')
    }

    return updated
  }

  /**
   * Get all sales targets for a specific date
   */
  static async getAllTargetsForDate(date: string): Promise<SalesTargetWithDetails[]> {
    try {
      const targets = await db.dailySalesTargets
        .where('targetDate')
        .equals(date)
        .toArray()

      // Get related data for each target
      const targetsWithDetails: SalesTargetWithDetails[] = []

      for (const target of targets) {
        const [menu, branch] = await Promise.all([
          db.menus.get(target.menuId),
          db.branches.get(target.branchId)
        ])

        if (menu && branch) {
          targetsWithDetails.push({
            ...target,
            menu,
            branch
          })
        }
      }

      return targetsWithDetails
    } catch (error) {
      console.error('SalesTargetService.getAllTargetsForDate() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete a sales target
   */
  static async deleteTarget(id: string): Promise<void> {
    try {
      await db.dailySalesTargets.delete(id)
    } catch (error) {
      console.error('SalesTargetService.deleteTarget() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete all targets for a menu
   */
  static async deleteTargetsForMenu(menuId: string): Promise<void> {
    try {
      await db.dailySalesTargets.where('menuId').equals(menuId).delete()
    } catch (error) {
      console.error('SalesTargetService.deleteTargetsForMenu() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete all targets for a branch
   */
  static async deleteTargetsForBranch(branchId: string): Promise<void> {
    try {
      await db.dailySalesTargets.where('branchId').equals(branchId).delete()
    } catch (error) {
      console.error('SalesTargetService.deleteTargetsForBranch() - Database error:', error)
      throw error
    }
  }

  /**
   * Get targets summary for a menu across all branches
   */
  static async getTargetsSummaryForMenu(menuId: string, date?: string): Promise<{
    totalTargets: number
    totalAmount: number
    branchCount: number
    targets: SalesTargetWithDetails[]
  }> {
    try {
      let targets = await this.getTargetsForMenu(menuId)
      
      if (date) {
        targets = targets.filter(target => target.targetDate === date)
      }
      
      const targetsWithDetails = await Promise.all(
        targets.map(async (target) => {
          const [menu, branch] = await Promise.all([
            db.menus.get(target.menuId),
            db.branches.get(target.branchId)
          ])
          
          return {
            ...target,
            menu: menu!,
            branch: branch!
          }
        })
      )
      
      const validTargets = targetsWithDetails.filter(target => target.menu && target.branch)
      const uniqueBranches = new Set(validTargets.map(target => target.branchId))
      
      return {
        totalTargets: validTargets.length,
        totalAmount: validTargets.reduce((sum, target) => sum + target.targetAmount, 0),
        branchCount: uniqueBranches.size,
        targets: validTargets
      }
    } catch (error) {
      console.error('SalesTargetService.getTargetsSummaryForMenu() - Database error:', error)
      throw error
    }
  }

  /**
   * Bulk set targets for multiple dates
   */
  static async bulkSetTargets(targets: Omit<NewDailySalesTarget, 'id'>[]): Promise<DailySalesTarget[]> {
    try {
      const results = await Promise.all(
        targets.map(targetData => this.setTarget(targetData))
      )
      
      return results
    } catch (error) {
      console.error('SalesTargetService.bulkSetTargets() - Database error:', error)
      throw error
    }
  }
}
