import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { SalesRecord, SalesRecordWithDetails, NewSalesRecord } from '@/lib/db/schema'

export interface SalesRecordSummary {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  topProduct: {
    name: string
    quantity: number
  } | null
}

export class SalesRecordService {
  /**
   * Create a new sales record
   */
  static async createRecord(recordData: Omit<NewSalesRecord, 'id'>): Promise<SalesRecord> {
    const now = new Date().toISOString()

    const newRecord: SalesRecord = {
      id: uuidv4(),
      ...recordData,
      createdAt: now,
      updatedAt: now,
    }

    await db.salesRecords.add(newRecord)
    return newRecord
  }

  /**
   * Get all sales records for a business
   */
  static async getRecordsByBusiness(businessId: string): Promise<SalesRecord[]> {
    try {
      return await db.salesRecords
        .where('businessId')
        .equals(businessId)
        .sortBy('saleDate')
    } catch (error) {
      console.error('SalesRecordService.getRecordsByBusiness() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales records for a specific date and branch
   */
  static async getRecordsForDate(
    saleDate: string, 
    branchId?: string
  ): Promise<SalesRecordWithDetails[]> {
    try {
      let records = await db.salesRecords
        .where('saleDate')
        .equals(saleDate)
        .toArray()

      if (branchId) {
        records = records.filter(record => record.branchId === branchId)
      }

      // Get related data for each record
      const recordsWithDetails: SalesRecordWithDetails[] = []
      
      for (const record of records) {
        const [menu, product, branch] = await Promise.all([
          db.menus.get(record.menuId),
          db.products.get(record.productId),
          db.branches.get(record.branchId)
        ])

        if (menu && product && branch) {
          recordsWithDetails.push({
            ...record,
            menu,
            product,
            branch
          })
        }
      }

      // Sort by sale time (most recent first)
      return recordsWithDetails.sort((a, b) => b.saleTime.localeCompare(a.saleTime))
    } catch (error) {
      console.error('SalesRecordService.getRecordsForDate() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales records for a date range
   */
  static async getRecordsForDateRange(
    startDate: string,
    endDate: string,
    branchId?: string
  ): Promise<SalesRecordWithDetails[]> {
    try {
      const records = await db.salesRecords
        .where('saleDate')
        .between(startDate, endDate, true, true)
        .toArray()

      const filteredRecords = branchId 
        ? records.filter(record => record.branchId === branchId)
        : records

      // Get related data for each record
      const recordsWithDetails: SalesRecordWithDetails[] = []
      
      for (const record of filteredRecords) {
        const [menu, product, branch] = await Promise.all([
          db.menus.get(record.menuId),
          db.products.get(record.productId),
          db.branches.get(record.branchId)
        ])

        if (menu && product && branch) {
          recordsWithDetails.push({
            ...record,
            menu,
            product,
            branch
          })
        }
      }

      return recordsWithDetails.sort((a, b) => {
        const dateCompare = b.saleDate.localeCompare(a.saleDate)
        if (dateCompare === 0) {
          return b.saleTime.localeCompare(a.saleTime)
        }
        return dateCompare
      })
    } catch (error) {
      console.error('SalesRecordService.getRecordsForDateRange() - Database error:', error)
      throw error
    }
  }

  /**
   * Get sales summary for a specific date
   */
  static async getSalesSummary(
    saleDate: string,
    branchId?: string
  ): Promise<SalesRecordSummary> {
    try {
      const records = await this.getRecordsForDate(saleDate, branchId)
      
      if (records.length === 0) {
        return {
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          topProduct: null
        }
      }

      const totalSales = records.reduce((sum, record) => sum + record.quantity, 0)
      const totalRevenue = records.reduce((sum, record) => sum + record.totalAmount, 0)
      const averageOrderValue = totalRevenue / records.length

      // Find top product by quantity
      const productSales = new Map<string, { name: string; quantity: number }>()
      
      records.forEach(record => {
        const existing = productSales.get(record.productId)
        if (existing) {
          existing.quantity += record.quantity
        } else {
          productSales.set(record.productId, {
            name: record.product.name,
            quantity: record.quantity
          })
        }
      })

      const topProduct = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)[0] || null

      return {
        totalSales,
        totalRevenue,
        averageOrderValue,
        topProduct
      }
    } catch (error) {
      console.error('SalesRecordService.getSalesSummary() - Database error:', error)
      throw error
    }
  }

  /**
   * Update a sales record
   */
  static async updateRecord(
    recordId: string, 
    updates: Partial<Omit<SalesRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<SalesRecord> {
    const now = new Date().toISOString()
    
    await db.salesRecords.update(recordId, {
      ...updates,
      updatedAt: now,
    })
    
    const updated = await db.salesRecords.get(recordId)
    if (!updated) {
      throw new Error('Sales record not found after update')
    }
    
    return updated
  }

  /**
   * Delete a sales record
   */
  static async deleteRecord(recordId: string): Promise<void> {
    await db.salesRecords.delete(recordId)
  }

  /**
   * Get hourly sales data for analytics
   */
  static async getHourlySalesData(
    saleDate: string,
    branchId?: string
  ): Promise<Array<{ hour: string; revenue: number; sales: number }>> {
    try {
      const records = await this.getRecordsForDate(saleDate, branchId)
      
      const hourlyData = new Map<string, { revenue: number; sales: number }>()
      
      // Initialize all hours
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00'
        hourlyData.set(hourStr, { revenue: 0, sales: 0 })
      }
      
      // Aggregate data by hour
      records.forEach(record => {
        const hour = record.saleTime.substring(0, 2) + ':00'
        const existing = hourlyData.get(hour) || { revenue: 0, sales: 0 }
        existing.revenue += record.totalAmount
        existing.sales += record.quantity
        hourlyData.set(hour, existing)
      })
      
      return Array.from(hourlyData.entries()).map(([hour, data]) => ({
        hour,
        revenue: data.revenue,
        sales: data.sales
      }))
    } catch (error) {
      console.error('SalesRecordService.getHourlySalesData() - Database error:', error)
      throw error
    }
  }
}
