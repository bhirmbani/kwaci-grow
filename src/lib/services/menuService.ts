import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { ProductService } from './productService'
import { productEvents } from '../events/productEvents'
import type { 
  Menu, 
  MenuProduct, 
  MenuWithProducts, 
  MenuWithProductCount,
  NewMenu, 
  NewMenuProduct,

  Branch
} from '../db/schema'

export class MenuService {
  /**
   * Get all menus (active and inactive)
   */
  static async getAll(includeInactive: boolean = false): Promise<Menu[]> {
    try {
      if (includeInactive) {
        return await db.menus.orderBy('name').toArray()
      } else {
        return await db.menus
          .filter(menu => menu.status === 'active')
          .sortBy('name')
      }
    } catch (error) {
      console.error('MenuService.getAll() - Database error:', error)
      
      if (error.name === 'DataError' && error.message && error.message.includes('IDBKeyRange')) {
        throw new Error(
          'Database corruption detected (IDBKeyRange error). A database reset is required to fix this issue.'
        )
      }
      
      throw error
    }
  }

  /**
   * Get menu by ID
   */
  static async getById(id: string): Promise<Menu | null> {
    try {
      const menu = await db.menus.get(id)
      return menu || null
    } catch (error) {
      console.error('MenuService.getById() - Database error:', error)
      throw error
    }
  }

  /**
   * Get all menus with their products and product details
   */
  static async getAllMenusWithProducts(includeInactive: boolean = false): Promise<MenuWithProducts[]> {
    try {
      const menus = await this.getAll(includeInactive)
      const menusWithProducts: MenuWithProducts[] = []

      for (const menu of menus) {
        const menuWithProducts = await this.getWithProducts(menu.id)
        if (menuWithProducts) {
          menusWithProducts.push(menuWithProducts)
        }
      }

      return menusWithProducts
    } catch (error) {
      console.error('MenuService.getAllMenusWithProducts() - Database error:', error)
      throw error
    }
  }

  /**
   * Get menu with all its products and product details
   */
  static async getWithProducts(id: string): Promise<MenuWithProducts | null> {
    try {
      const menu = await db.menus.get(id)
      if (!menu) return null

      // Get menu products with product details
      const menuProducts = await db.menuProducts
        .where('menuId')
        .equals(id)
        .toArray()

      // Get product details for each menu product with COGS data
      const productsWithDetails = await Promise.all(
        menuProducts.map(async (menuProduct) => {
          const product = await db.products.get(menuProduct.productId)
          
          // Calculate COGS per cup for this product
          let cogsPerCup = 0
          try {
            const productWithIngredients = await ProductService.getWithIngredients(menuProduct.productId)
            if (productWithIngredients && productWithIngredients.ingredients.length > 0) {
              cogsPerCup = productWithIngredients.ingredients.reduce((total, pi) => {
                const ingredient = pi.ingredient

                // Add null checks for ingredient and its properties
                if (!ingredient || !ingredient.baseUnitCost || !ingredient.baseUnitQuantity || ingredient.baseUnitQuantity === 0) {
                  // Only warn if ingredient is completely missing, not just missing cost data
                  if (!ingredient) {
                    console.warn('Missing ingredient record for product ingredient:', pi)
                  }
                  return total
                }

                const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
                return total + costPerCup
              }, 0)
            }
          } catch (cogsError) {
            console.error(`MenuService.getWithProducts() - Error calculating COGS for product ${menuProduct.productId}:`, cogsError)
            // COGS remains 0 if calculation fails
          }
          
          return {
            ...menuProduct,
            product: {
              ...product!,
              cogsPerCup: Math.round(cogsPerCup) // Round to nearest IDR
            }
          }
        })
      )

      // Get assigned branches
      const menuBranches = await db.menuBranches
        .where('menuId')
        .equals(id)
        .toArray()

      const branches = await Promise.all(
        menuBranches.map(async (mb) => {
          const branch = await db.branches.get(mb.branchId)
          return branch!
        })
      )

      return {
        ...menu,
        products: productsWithDetails.sort((a, b) => a.displayOrder - b.displayOrder),
        productCount: productsWithDetails.length,
        branches
      }
    } catch (error) {
      console.error('MenuService.getWithProducts() - Database error:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get all menus with product counts
   */
  static async getAllWithProductCounts(includeInactive: boolean = false): Promise<MenuWithProductCount[]> {
    try {
      const menus = await this.getAll(includeInactive)

      const menusWithCounts = await Promise.all(
        menus.map(async (menu) => {
          try {
            const productCount = await db.menuProducts
              .where('menuId')
              .equals(menu.id)
              .count()

            const branchCount = await db.menuBranches
              .where('menuId')
              .equals(menu.id)
              .count()

            return {
              ...menu,
              productCount,
              branchCount
            }
          } catch (error) {
            console.error(`MenuService.getAllWithProductCounts() - Error counting for menu ${menu.id}:`, error)
            return {
              ...menu,
              productCount: 0,
              branchCount: 0
            }
          }
        })
      )

      return menusWithCounts
    } catch (error) {
      console.error('MenuService.getAllWithProductCounts() - Database error:', error)
      
      if (error.message.includes('Database corruption detected')) {
        throw error
      }
      
      throw new Error('Failed to fetch menus with counts')
    }
  }

  /**
   * Create a new menu
   */
  static async create(menuData: Omit<NewMenu, 'id' | 'status'>): Promise<Menu> {
    const now = new Date().toISOString()
    const newMenu: Menu = {
      id: uuidv4(),
      ...menuData,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }

    try {
      await db.menus.add(newMenu)

      // Emit menu created event
      productEvents.menuCreated(newMenu.id, newMenu.name)

      return newMenu
    } catch (error) {
      console.error('Error creating menu:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Update an existing menu
   */
  static async update(id: string, updates: Partial<Omit<Menu, 'id' | 'createdAt'>>): Promise<Menu> {
    const now = new Date().toISOString()

    await db.menus.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Menu not found')
    }

    // Emit menu updated event
    productEvents.menuUpdated(id, updated.name)

    return updated
  }

  /**
   * Soft delete a menu (set status to inactive)
   */
  static async delete(id: string): Promise<void> {
    const now = new Date().toISOString()
    await db.menus.update(id, {
      status: 'inactive',
      updatedAt: now,
    })

    // Emit menu deleted event
    productEvents.menuDeleted(id)
  }

  /**
   * Add a product to a menu
   */
  static async addProduct(menuId: string, productData: Omit<NewMenuProduct, 'id' | 'menuId'>): Promise<MenuProduct> {
    const now = new Date().toISOString()
    
    // Get the next display order
    const existingProducts = await db.menuProducts
      .where('menuId')
      .equals(menuId)
      .toArray()
    
    const maxOrder = existingProducts.length > 0 
      ? Math.max(...existingProducts.map(p => p.displayOrder))
      : 0

    const newMenuProduct: MenuProduct = {
      id: uuidv4(),
      menuId,
      ...productData,
      displayOrder: productData.displayOrder || (maxOrder + 1),
      createdAt: now,
      updatedAt: now,
    }

    await db.menuProducts.add(newMenuProduct)
    return newMenuProduct
  }

  /**
   * Remove a product from a menu
   */
  static async removeProduct(menuId: string, productId: string): Promise<void> {
    const menuProduct = await db.menuProducts
      .where('[menuId+productId]')
      .equals([menuId, productId])
      .first()

    if (menuProduct) {
      await db.menuProducts.delete(menuProduct.id)
    }
  }

  /**
   * Update product in menu
   */
  static async updateProduct(menuProductId: string, updates: Partial<Omit<MenuProduct, 'id' | 'menuId' | 'productId' | 'createdAt'>>): Promise<void> {
    const now = new Date().toISOString()
    await db.menuProducts.update(menuProductId, {
      ...updates,
      updatedAt: now,
    })
  }

  /**
   * Update product price in menu
   */
  static async updateProductPrice(menuProductId: string, price: number): Promise<void> {
    const now = new Date().toISOString()

    // Get the menu product to find the productId
    const menuProduct = await db.menuProducts.get(menuProductId)

    await db.menuProducts.update(menuProductId, {
      price,
      updatedAt: now,
    })

    // Emit pricing changed event if we found the product
    if (menuProduct) {
      productEvents.menuProductPricingChanged(menuProduct.productId)
    }
  }

  /**
   * Assign menu to branches
   */
  static async assignToBranches(menuId: string, branchIds: string[]): Promise<void> {
    const now = new Date().toISOString()

    // Remove existing assignments
    await db.menuBranches.where('menuId').equals(menuId).delete()

    // Add new assignments
    const assignments = branchIds.map(branchId => ({
      id: uuidv4(),
      menuId,
      branchId,
      createdAt: now,
      updatedAt: now,
    }))

    if (assignments.length > 0) {
      await db.menuBranches.bulkAdd(assignments)
    }
  }

  /**
   * Get branches assigned to a menu
   */
  static async getAssignedBranches(menuId: string): Promise<Branch[]> {
    try {
      const menuBranches = await db.menuBranches
        .where('menuId')
        .equals(menuId)
        .toArray()

      const branches = await Promise.all(
        menuBranches.map(async (mb) => {
          const branch = await db.branches.get(mb.branchId)
          return branch!
        })
      )

      return branches.filter(Boolean)
    } catch (error) {
      console.error('MenuService.getAssignedBranches() - Database error:', error)
      throw error
    }
  }
}
