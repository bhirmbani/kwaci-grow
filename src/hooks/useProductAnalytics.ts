import { useState, useEffect, useCallback } from 'react'
import { MenuService } from '@/lib/services/menuService'
import { useProductEvents } from '@/lib/events/productEvents'

interface MenuProductProjection {
  menuId: string
  menuName: string
  productId: string
  productName: string
  cogsPerCup: number
  menuPrice: number
  grossProfitPerCup: number
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  targetQuantityPerDay: number
}

interface MenuAnalytics {
  menuId: string
  menuName: string
  products: MenuProductProjection[]
  totalDailyRevenue: number
  totalWeeklyRevenue: number
  totalMonthlyRevenue: number
  totalDailyProfit: number
  totalWeeklyProfit: number
  totalMonthlyProfit: number
}



export function useMenuAnalytics(daysPerMonth: number, targetQuantities: Map<string, number>) {
  const [menuAnalytics, setMenuAnalytics] = useState<MenuAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const calculateMenuAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all menus with products as primary data source
      const menusWithProducts = await MenuService.getAllMenusWithProducts(false)

      // Calculate analytics for each menu
      const calculatedMenuAnalytics: MenuAnalytics[] = []

      for (const menu of menusWithProducts) {
        const menuProductProjections: MenuProductProjection[] = []
        let totalDailyRevenue = 0
        let totalWeeklyRevenue = 0
        let totalMonthlyRevenue = 0
        let totalDailyProfit = 0
        let totalWeeklyProfit = 0
        let totalMonthlyProfit = 0

        // Process each product in the menu
        for (const menuProduct of menu.products) {
          const product = menuProduct.product

          // Use COGS data already calculated by MenuService
          const cogsPerCup = product.cogsPerCup || 0

          // Include all products that are in the menu, regardless of COGS
          // This ensures analytics dropdown matches what's shown in menus route
          const menuPrice = menuProduct.price
          const grossProfitPerCup = menuPrice - cogsPerCup

          // Get target quantity for this product (default to 10 if not set)
          const targetQuantityPerDay = targetQuantities.get(product.id) || 10

          // Calculate projections
          const dailyRevenue = targetQuantityPerDay * menuPrice
          const dailyProfit = targetQuantityPerDay * grossProfitPerCup
          const weeklyRevenue = dailyRevenue * 7
          const weeklyProfit = dailyProfit * 7
          const monthlyRevenue = dailyRevenue * daysPerMonth
          const monthlyProfit = dailyProfit * daysPerMonth

          const projection: MenuProductProjection = {
            menuId: menu.id,
            menuName: menu.name,
            productId: product.id,
            productName: product.name,
            cogsPerCup: Math.round(cogsPerCup),
            menuPrice,
            grossProfitPerCup,
            dailyRevenue,
            weeklyRevenue,
            monthlyRevenue,
            dailyProfit,
            weeklyProfit,
            monthlyProfit,
            targetQuantityPerDay
          }

          menuProductProjections.push(projection)

          // Add to menu totals
          totalDailyRevenue += dailyRevenue
          totalWeeklyRevenue += weeklyRevenue
          totalMonthlyRevenue += monthlyRevenue
          totalDailyProfit += dailyProfit
          totalWeeklyProfit += weeklyProfit
          totalMonthlyProfit += monthlyProfit
        }

        // Only include menus that have products
        if (menuProductProjections.length > 0) {
          // Sort products by name within each menu
          menuProductProjections.sort((a, b) => a.productName.localeCompare(b.productName))

          calculatedMenuAnalytics.push({
            menuId: menu.id,
            menuName: menu.name,
            products: menuProductProjections,
            totalDailyRevenue,
            totalWeeklyRevenue,
            totalMonthlyRevenue,
            totalDailyProfit,
            totalWeeklyProfit,
            totalMonthlyProfit
          })
        }
      } // Close the outer for loop

      // Sort menus by name
      calculatedMenuAnalytics.sort((a, b) => a.menuName.localeCompare(b.menuName))

      setMenuAnalytics(calculatedMenuAnalytics)
      setLastRefresh(Date.now())
    } catch (err) {
      console.error('Error calculating menu analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to calculate menu analytics')
    } finally {
      setLoading(false)
    }
  }, [daysPerMonth, targetQuantities])

  // Manual refetch function for real-time synchronization
  const refetch = useCallback(() => {
    calculateMenuAnalytics()
  }, [calculateMenuAnalytics])

  // Listen for product and menu events and auto-refresh
  useProductEvents(
    [
      'product-created', 'product-updated', 'product-deleted', 'product-ingredients-changed',
      'menu-product-pricing-changed', 'menu-created', 'menu-updated', 'menu-deleted',
      'menu-product-added', 'menu-product-removed'
    ],
    useCallback(() => {
      console.log('Product/Menu event detected, refreshing analytics...')
      refetch()
    }, [refetch])
  )

  useEffect(() => {
    calculateMenuAnalytics()
  }, [calculateMenuAnalytics])

  return {
    menuAnalytics,
    loading,
    error,
    refetch,
    lastRefresh
  }
}
