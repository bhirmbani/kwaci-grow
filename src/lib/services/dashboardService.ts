import { SalesRecordService } from './salesRecordService'
import { ProductionService } from './productionService'
import { StockService } from './stockService'
import { BranchService } from './branchService'
import { getCurrentBusinessId } from './businessContext'
import { formatISO, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { SalesRecordWithDetails, ProductionBatch, StockLevel, Branch } from '../db/schema'

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter'

export interface SalesAnalytics {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  topProduct: {
    name: string
    quantity: number
    revenue: number
  } | null
  salesByHour: Array<{
    hour: string
    revenue: number
    transactions: number
  }>
}

export interface FinancialOverview {
  availableCash: number
  totalExpenses: number
  netPosition: number
  monthlyBurnRate: number
}

export interface OperationsStatus {
  incompleteBatches: Array<{
    id: string
    batchNumber: string
    productName: string
    quantity: number
    unit: string
    status: string
    dateCreated: string
    isOverdue: boolean
    isUrgent: boolean
  }>
  totalIncomplete: number
  overdueCount: number
  urgentCount: number
}

export interface InventoryAlert {
  ingredientName: string
  currentStock: number
  threshold: number
  unit: string
  alertLevel: 'critical' | 'low' | 'normal'
  percentageRemaining: number
}

export interface BranchPerformance {
  branchId: string
  branchName: string
  location: string
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  performanceRank: number
}

export interface DashboardData {
  salesAnalytics: SalesAnalytics
  financialOverview: FinancialOverview
  operationsStatus: OperationsStatus
  inventoryAlerts: InventoryAlert[]
  branchPerformance: BranchPerformance[]
  lastUpdated: string
}

export class DashboardService {
  /**
   * Get date range for the specified time period
   */
  private static getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 2))
        endDate = endOfMonth(now)
        break
      default:
        startDate = startOfDay(now)
        endDate = endOfDay(now)
    }

    return {
      startDate: formatISO(startDate, { representation: 'date' }),
      endDate: formatISO(endDate, { representation: 'date' })
    }
  }

  /**
   * Get sales analytics for the specified time period
   */
  static async getSalesAnalytics(period: TimePeriod = 'today'): Promise<SalesAnalytics> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) {
        return {
          totalRevenue: 0,
          totalTransactions: 0,
          averageOrderValue: 0,
          topProduct: null,
          salesByHour: []
        }
      }

      const { startDate, endDate } = this.getDateRange(period)
      const salesRecords = await SalesRecordService.getRecordsForDateRange(startDate, endDate, undefined, businessId)

      const totalRevenue = salesRecords.reduce((sum, record) => sum + record.totalAmount, 0)
      const totalTransactions = salesRecords.length
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Calculate top product
      const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
      salesRecords.forEach(record => {
        const existing = productSales.get(record.productId)
        if (existing) {
          existing.quantity += record.quantity
          existing.revenue += record.totalAmount
        } else {
          productSales.set(record.productId, {
            name: record.product.name,
            quantity: record.quantity,
            revenue: record.totalAmount
          })
        }
      })

      const topProduct = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)[0] || null

      // Calculate sales by hour (for today only)
      const salesByHour: Array<{ hour: string; revenue: number; transactions: number }> = []
      if (period === 'today') {
        const hourlyMap = new Map<string, { revenue: number; transactions: number }>()
        
        // Initialize all hours
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0') + ':00'
          hourlyMap.set(hourStr, { revenue: 0, transactions: 0 })
        }

        // Aggregate sales by hour
        salesRecords.forEach(record => {
          const hour = record.saleTime.substring(0, 2) + ':00'
          const existing = hourlyMap.get(hour)
          if (existing) {
            existing.revenue += record.totalAmount
            existing.transactions += 1
          }
        })

        salesByHour.push(...Array.from(hourlyMap.entries()).map(([hour, data]) => ({
          hour,
          ...data
        })))
      }

      return {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        topProduct,
        salesByHour
      }
    } catch (error) {
      console.error('Error getting sales analytics:', error)
      throw error
    }
  }

  /**
   * Get financial overview
   */
  static async getFinancialOverview(): Promise<FinancialOverview> {
    try {
      // This is a simplified implementation
      // In a real scenario, you'd integrate with your financial calculations
      const businessId = getCurrentBusinessId()
      if (!businessId) {
        return {
          availableCash: 0,
          totalExpenses: 0,
          netPosition: 0,
          monthlyBurnRate: 0
        }
      }

      // Get sales for current month to estimate cash flow
      const { startDate, endDate } = this.getDateRange('month')
      const salesRecords = await SalesRecordService.getRecordsForDateRange(startDate, endDate, undefined, businessId)
      const monthlyRevenue = salesRecords.reduce((sum, record) => sum + record.totalAmount, 0)

      // Placeholder calculations - you would integrate with your actual financial data
      const estimatedExpenses = monthlyRevenue * 0.7 // Assume 70% expense ratio
      const netPosition = monthlyRevenue - estimatedExpenses
      const monthlyBurnRate = estimatedExpenses

      return {
        availableCash: netPosition > 0 ? netPosition : 0,
        totalExpenses: estimatedExpenses,
        netPosition,
        monthlyBurnRate
      }
    } catch (error) {
      console.error('Error getting financial overview:', error)
      throw error
    }
  }

  /**
   * Get operations status
   */
  static async getOperationsStatus(): Promise<OperationsStatus> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) {
        return {
          incompleteBatches: [],
          totalIncomplete: 0,
          overdueCount: 0,
          urgentCount: 0
        }
      }

      const allBatches = await ProductionService.getAllBatches()
      const incompleteBatches = allBatches.filter(batch => 
        batch.status !== 'Completed' && batch.status !== 'Cancelled'
      )

      const now = new Date()
      const threeDaysAgo = subDays(now, 3)
      const oneDayAgo = subDays(now, 1)

      const processedBatches = incompleteBatches.map(batch => {
        const createdDate = new Date(batch.dateCreated)
        const isOverdue = createdDate < threeDaysAgo
        const isUrgent = createdDate < oneDayAgo && !isOverdue

        return {
          id: batch.id,
          batchNumber: batch.batchNumber,
          productName: batch.productName || 'Unknown Product',
          quantity: batch.outputQuantity || 0,
          unit: batch.outputUnit || 'units',
          status: batch.status,
          dateCreated: batch.dateCreated,
          isOverdue,
          isUrgent
        }
      })

      return {
        incompleteBatches: processedBatches,
        totalIncomplete: incompleteBatches.length,
        overdueCount: processedBatches.filter(b => b.isOverdue).length,
        urgentCount: processedBatches.filter(b => b.isUrgent).length
      }
    } catch (error) {
      console.error('Error getting operations status:', error)
      throw error
    }
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) {
        return []
      }

      const stockLevels = await StockService.getAllStockLevels()
      
      return stockLevels
        .filter(stock => stock.currentStock <= stock.lowStockThreshold)
        .map(stock => {
          const percentageRemaining = stock.lowStockThreshold > 0 
            ? (stock.currentStock / stock.lowStockThreshold) * 100 
            : 0

          let alertLevel: 'critical' | 'low' | 'normal' = 'normal'
          if (stock.currentStock === 0) {
            alertLevel = 'critical'
          } else if (percentageRemaining <= 50) {
            alertLevel = 'critical'
          } else if (percentageRemaining <= 100) {
            alertLevel = 'low'
          }

          return {
            ingredientName: stock.ingredientName,
            currentStock: stock.currentStock,
            threshold: stock.lowStockThreshold,
            unit: stock.unit,
            alertLevel,
            percentageRemaining
          }
        })
        .sort((a, b) => a.percentageRemaining - b.percentageRemaining)
    } catch (error) {
      console.error('Error getting inventory alerts:', error)
      throw error
    }
  }

  /**
   * Get branch performance for the specified time period
   */
  static async getBranchPerformance(period: TimePeriod = 'today'): Promise<BranchPerformance[]> {
    try {
      const businessId = getCurrentBusinessId()
      if (!businessId) {
        return []
      }

      const [branches, { startDate, endDate }] = await Promise.all([
        BranchService.getAll(),
        Promise.resolve(this.getDateRange(period))
      ])

      const branchPerformancePromises = branches.map(async (branch) => {
        const salesRecords = await SalesRecordService.getRecordsForDateRange(
          startDate, 
          endDate, 
          branch.id, 
          businessId
        )

        const totalRevenue = salesRecords.reduce((sum, record) => sum + record.totalAmount, 0)
        const totalTransactions = salesRecords.length
        const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

        return {
          branchId: branch.id,
          branchName: branch.name,
          location: branch.location,
          totalRevenue,
          totalTransactions,
          averageOrderValue,
          performanceRank: 0 // Will be set after sorting
        }
      })

      const branchPerformance = await Promise.all(branchPerformancePromises)
      
      // Sort by revenue and assign ranks
      branchPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue)
      branchPerformance.forEach((branch, index) => {
        branch.performanceRank = index + 1
      })

      return branchPerformance
    } catch (error) {
      console.error('Error getting branch performance:', error)
      throw error
    }
  }

  /**
   * Get complete dashboard data
   */
  static async getDashboardData(period: TimePeriod = 'today'): Promise<DashboardData> {
    try {
      const [
        salesAnalytics,
        financialOverview,
        operationsStatus,
        inventoryAlerts,
        branchPerformance
      ] = await Promise.all([
        this.getSalesAnalytics(period),
        this.getFinancialOverview(),
        this.getOperationsStatus(),
        this.getInventoryAlerts(),
        this.getBranchPerformance(period)
      ])

      return {
        salesAnalytics,
        financialOverview,
        operationsStatus,
        inventoryAlerts,
        branchPerformance,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      throw error
    }
  }
}
