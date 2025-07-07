import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { 
  Branch, 
  BranchWithMenus,
  NewBranch,
  Menu
} from '../db/schema'

export class BranchService {
  /**
   * Get all branches (active and inactive)
   */
  static async getAll(includeInactive: boolean = false): Promise<Branch[]> {
    try {
      if (includeInactive) {
        return await db.branches.orderBy('name').toArray()
      } else {
        return await db.branches
          .filter(branch => branch.isActive === true)
          .sortBy('name')
      }
    } catch (error) {
      console.error('BranchService.getAll() - Database error:', error)
      
      if (error.name === 'DataError' && error.message && error.message.includes('IDBKeyRange')) {
        throw new Error(
          'Database corruption detected (IDBKeyRange error). A database reset is required to fix this issue.'
        )
      }
      
      throw error
    }
  }

  /**
   * Get branch by ID
   */
  static async getById(id: string): Promise<Branch | null> {
    try {
      const branch = await db.branches.get(id)
      return branch || null
    } catch (error) {
      console.error('BranchService.getById() - Database error:', error)
      throw error
    }
  }

  /**
   * Get branch with assigned menus
   */
  static async getWithMenus(id: string): Promise<BranchWithMenus | null> {
    try {
      const branch = await db.branches.get(id)
      if (!branch) return null

      // Get menu assignments for this branch
      const menuBranches = await db.menuBranches
        .where('branchId')
        .equals(id)
        .toArray()

      // Get menu details
      const menus = await Promise.all(
        menuBranches.map(async (mb) => {
          const menu = await db.menus.get(mb.menuId)
          return menu!
        })
      )

      return {
        ...branch,
        menus: menus.filter(Boolean),
        menuCount: menus.length
      }
    } catch (error) {
      console.error('BranchService.getWithMenus() - Database error:', error)
      throw error
    }
  }

  /**
   * Get all branches with menu counts
   */
  static async getAllWithMenuCounts(includeInactive: boolean = false): Promise<BranchWithMenus[]> {
    try {
      const branches = await this.getAll(includeInactive)

      const branchesWithCounts = await Promise.all(
        branches.map(async (branch) => {
          try {
            const menuCount = await db.menuBranches
              .where('branchId')
              .equals(branch.id)
              .count()

            // Get actual menus for this branch
            const menuBranches = await db.menuBranches
              .where('branchId')
              .equals(branch.id)
              .toArray()

            const menus = await Promise.all(
              menuBranches.map(async (mb) => {
                const menu = await db.menus.get(mb.menuId)
                return menu!
              })
            )

            return {
              ...branch,
              menus: menus.filter(Boolean),
              menuCount
            }
          } catch (error) {
            console.error(`BranchService.getAllWithMenuCounts() - Error counting for branch ${branch.id}:`, error)
            return {
              ...branch,
              menus: [],
              menuCount: 0
            }
          }
        })
      )

      return branchesWithCounts
    } catch (error) {
      console.error('BranchService.getAllWithMenuCounts() - Database error:', error)
      
      if (error.message.includes('Database corruption detected')) {
        throw error
      }
      
      throw new Error('Failed to fetch branches with menu counts')
    }
  }

  /**
   * Create a new branch
   */
  static async create(branchData: Omit<NewBranch, 'id' | 'isActive'>): Promise<Branch> {
    const now = new Date().toISOString()
    const newBranch: Branch = {
      id: uuidv4(),
      ...branchData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.branches.add(newBranch)
    return newBranch
  }

  /**
   * Update an existing branch
   */
  static async update(id: string, updates: Partial<Omit<Branch, 'id' | 'createdAt'>>): Promise<Branch> {
    const now = new Date().toISOString()

    await db.branches.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Branch not found')
    }

    return updated
  }

  /**
   * Soft delete a branch (set isActive to false)
   */
  static async delete(id: string): Promise<void> {
    // Check if branch is used in any menu assignments
    const isUsedInMenus = await this.isUsedInMenus(id)
    if (isUsedInMenus) {
      throw new Error('Cannot delete branch that is assigned to menus')
    }

    const now = new Date().toISOString()
    await db.branches.update(id, {
      isActive: false,
      updatedAt: now,
    })
  }

  /**
   * Check if branch is used in any menu assignments
   */
  static async isUsedInMenus(branchId: string): Promise<boolean> {
    try {
      const count = await db.menuBranches
        .where('branchId')
        .equals(branchId)
        .count()
      
      return count > 0
    } catch (error) {
      console.error('BranchService.isUsedInMenus() - Database error:', error)
      return false
    }
  }

  /**
   * Get menus assigned to a branch
   */
  static async getMenusForBranch(branchId: string): Promise<Menu[]> {
    try {
      const menuBranches = await db.menuBranches
        .where('branchId')
        .equals(branchId)
        .toArray()

      const menus = await Promise.all(
        menuBranches.map(async (mb) => {
          const menu = await db.menus.get(mb.menuId)
          return menu!
        })
      )

      return menus.filter(Boolean)
    } catch (error) {
      console.error('BranchService.getMenusForBranch() - Database error:', error)
      throw error
    }
  }

  /**
   * Remove all menu assignments for a branch
   */
  static async removeAllMenuAssignments(branchId: string): Promise<void> {
    try {
      await db.menuBranches.where('branchId').equals(branchId).delete()
    } catch (error) {
      console.error('BranchService.removeAllMenuAssignments() - Database error:', error)
      throw error
    }
  }
}
