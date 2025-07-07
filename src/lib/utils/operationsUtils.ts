import type { SalesRecordWithDetails } from '@/lib/db/schema'

/**
 * Calculate variance between actual and target values
 */
export function calculateVariance(actual: number, target: number): {
  absolute: number
  percentage: number
} {
  const absolute = actual - target
  const percentage = target > 0 ? (absolute / target) * 100 : 0
  
  return { absolute, percentage }
}

/**
 * Calculate time-based progress percentage
 */
export function calculateTimeProgress(date: string): number {
  const now = new Date()
  const targetDate = new Date(date)
  
  // If not today, return 100% (full day elapsed)
  if (targetDate.toDateString() !== now.toDateString()) {
    return targetDate < now ? 100 : 0
  }
  
  // Calculate percentage of day elapsed
  const totalMinutesInDay = 24 * 60
  const elapsedMinutes = now.getHours() * 60 + now.getMinutes()
  
  return (elapsedMinutes / totalMinutesInDay) * 100
}

/**
 * Group sales records by hour
 */
export function groupSalesByHour(salesRecords: SalesRecordWithDetails[]): Map<string, {
  revenue: number
  quantity: number
  count: number
}> {
  const hourlyMap = new Map<string, { revenue: number; quantity: number; count: number }>()
  
  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0') + ':00'
    hourlyMap.set(hourStr, { revenue: 0, quantity: 0, count: 0 })
  }
  
  // Aggregate sales by hour
  salesRecords.forEach(record => {
    const hour = record.saleTime.substring(0, 2) + ':00'
    const existing = hourlyMap.get(hour) || { revenue: 0, quantity: 0, count: 0 }
    
    existing.revenue += record.totalAmount
    existing.quantity += record.quantity
    existing.count += 1
    
    hourlyMap.set(hour, existing)
  })
  
  return hourlyMap
}

/**
 * Group sales records by product
 */
export function groupSalesByProduct(salesRecords: SalesRecordWithDetails[]): Map<string, {
  name: string
  revenue: number
  quantity: number
  count: number
}> {
  const productMap = new Map<string, { name: string; revenue: number; quantity: number; count: number }>()
  
  salesRecords.forEach(record => {
    const existing = productMap.get(record.productId)
    
    if (existing) {
      existing.revenue += record.totalAmount
      existing.quantity += record.quantity
      existing.count += 1
    } else {
      productMap.set(record.productId, {
        name: record.product.name,
        revenue: record.totalAmount,
        quantity: record.quantity,
        count: 1
      })
    }
  })
  
  return productMap
}

/**
 * Calculate performance status based on actual vs target and time progress
 */
export function calculatePerformanceStatus(
  actualPercentage: number,
  timeProgress: number
): 'ahead' | 'on-track' | 'behind' | 'at-risk' {
  const expectedProgress = timeProgress
  
  if (actualPercentage >= expectedProgress + 10) {
    return 'ahead'
  } else if (actualPercentage < expectedProgress - 20) {
    return 'at-risk'
  } else if (actualPercentage < expectedProgress - 10) {
    return 'behind'
  }
  
  return 'on-track'
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(salesRecords: SalesRecordWithDetails[]): number {
  if (salesRecords.length === 0) return 0
  
  const totalRevenue = salesRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  return totalRevenue / salesRecords.length
}

/**
 * Find peak sales hour
 */
export function findPeakSalesHour(salesRecords: SalesRecordWithDetails[]): {
  hour: string
  revenue: number
  quantity: number
} | null {
  const hourlyData = groupSalesByHour(salesRecords)
  
  let peakHour: string | null = null
  let peakRevenue = 0
  let peakQuantity = 0
  
  hourlyData.forEach((data, hour) => {
    if (data.revenue > peakRevenue) {
      peakHour = hour
      peakRevenue = data.revenue
      peakQuantity = data.quantity
    }
  })
  
  return peakHour ? { hour: peakHour, revenue: peakRevenue, quantity: peakQuantity } : null
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(revenue: number, cogs: number): number {
  if (revenue === 0) return 0
  return ((revenue - cogs) / revenue) * 100
}

/**
 * Format performance percentage with color coding
 */
export function formatPerformancePercentage(percentage: number): {
  value: string
  color: 'green' | 'yellow' | 'red'
} {
  const value = `${percentage.toFixed(1)}%`
  
  let color: 'green' | 'yellow' | 'red'
  if (percentage >= 100) {
    color = 'green'
  } else if (percentage >= 80) {
    color = 'yellow'
  } else {
    color = 'red'
  }
  
  return { value, color }
}

/**
 * Generate time series data for progress tracking
 */
export function generateProgressTimeSeries(
  salesRecords: SalesRecordWithDetails[],
  targetAmount: number,
  date: string
): Array<{ time: string; actual: number; target: number; percentage: number }> {
  const timeSeriesData: Array<{ time: string; actual: number; target: number; percentage: number }> = []
  
  // Sort records by time
  const sortedRecords = salesRecords
    .filter(record => record.saleDate === date)
    .sort((a, b) => a.saleTime.localeCompare(b.saleTime))
  
  let cumulativeRevenue = 0
  
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0') + ':00'
    
    // Add revenue from this hour
    const hourRecords = sortedRecords.filter(record => 
      record.saleTime.startsWith(hour.toString().padStart(2, '0'))
    )
    cumulativeRevenue += hourRecords.reduce((sum, record) => sum + record.totalAmount, 0)
    
    // Calculate expected progress (linear)
    const expectedProgress = (hour / 24) * targetAmount
    const percentage = targetAmount > 0 ? (cumulativeRevenue / targetAmount) * 100 : 0
    
    timeSeriesData.push({
      time: hourStr,
      actual: cumulativeRevenue,
      target: expectedProgress,
      percentage
    })
  }
  
  return timeSeriesData
}
