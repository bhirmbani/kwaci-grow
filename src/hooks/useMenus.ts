import { useState, useEffect, useCallback } from 'react'
import { MenuService } from '@/lib/services/menuService'
import type { Menu, MenuWithProductCount, MenuWithProducts, NewMenu } from '@/lib/db/schema'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'

interface UseMenusResult {
  menus: MenuWithProductCount[]
  loading: boolean
  error: string | null
  loadMenus: () => Promise<void>
  createMenu: (menu: NewMenu) => Promise<void>
  updateMenu: (id: string, updates: Partial<Menu>) => Promise<void>
  deleteMenu: (id: string) => Promise<void>
  getMenuWithProducts: (id: string) => Promise<MenuWithProducts | null>
  assignToBranches: (menuId: string, branchIds: string[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useMenus(includeInactive: boolean = false): UseMenusResult {
  const [menus, setMenus] = useState<MenuWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  const loadMenus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const menusData = await MenuService.getAllWithProductCounts(includeInactive)
      setMenus(menusData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menus')
      console.error('Error loading menus:', err)
    } finally {
      setLoading(false)
    }
  }, [includeInactive, currentBusinessId])

  const createMenu = useCallback(async (menu: NewMenu) => {
    try {
      setError(null)
      await MenuService.create(menu)
      await loadMenus() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create menu'
      setError(errorMessage)
      throw err
    }
  }, [loadMenus])

  const updateMenu = useCallback(async (id: string, updates: Partial<Menu>) => {
    try {
      setError(null)
      await MenuService.update(id, updates)
      await loadMenus() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update menu'
      setError(errorMessage)
      throw err
    }
  }, [loadMenus])

  const deleteMenu = useCallback(async (id: string) => {
    try {
      setError(null)
      await MenuService.delete(id)
      await loadMenus() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu'
      setError(errorMessage)
      throw err
    }
  }, [loadMenus])

  const getMenuWithProducts = useCallback(async (id: string): Promise<MenuWithProducts | null> => {
    try {
      setError(null)
      return await MenuService.getWithProducts(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get menu with products'
      setError(errorMessage)
      throw err
    }
  }, [])

  const assignToBranches = useCallback(async (menuId: string, branchIds: string[]) => {
    try {
      setError(null)
      await MenuService.assignToBranches(menuId, branchIds)
      await loadMenus() // Reload to reflect changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign menu to branches'
      setError(errorMessage)
      throw err
    }
  }, [loadMenus])

  const refetch = useCallback(async () => {
    await loadMenus()
  }, [loadMenus])

  useEffect(() => {
    loadMenus()
  }, [loadMenus])

  return {
    menus,
    loading,
    error,
    loadMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    getMenuWithProducts,
    assignToBranches,
    refetch
  }
}
