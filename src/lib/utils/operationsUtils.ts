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
 * Calculate time-based progress percentage based on business hours
 */
export function calculateBusinessTimeProgress(
  date: string,
  businessHoursStart: string = '06:00',
  businessHoursEnd: string = '22:00'
): number {
  const now = new Date()
  const targetDate = new Date(date)

  // If not today, return 100% (full day elapsed)
  if (targetDate.toDateString() !== now.toDateString()) {
    return targetDate < now ? 100 : 0
  }

  // Parse business hours
  const [startHour, startMin] = businessHoursStart.split(':').map(Number)
  const [endHour, endMin] = businessHoursEnd.split(':').map(Number)

  const businessStartMinutes = startHour * 60 + startMin
  const businessEndMinutes = endHour * 60 + endMin
  const totalBusinessMinutes = businessEndMinutes - businessStartMinutes

  // Current time in minutes since midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // If before business hours, return 0%
  if (currentMinutes < businessStartMinutes) {
    return 0
  }

  // If after business hours, return 100%
  if (currentMinutes > businessEndMinutes) {
    return 100
  }

  // Calculate percentage of business day elapsed
  const elapsedBusinessMinutes = currentMinutes - businessStartMinutes
  return (elapsedBusinessMinutes / totalBusinessMinutes) * 100
}

/**
 * Calculate time-based progress percentage (legacy function for 24-hour calculation)
 * @deprecated Use calculateBusinessTimeProgress instead
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
 * Calculate realistic expected progress based on business type and time elapsed
 */
export function calculateExpectedProgress(
  timeProgress: number,
  businessType: 'coffee-shop' | 'restaurant' | 'retail' | 'linear' = 'coffee-shop'
): number {
  switch (businessType) {
    case 'coffee-shop':
      // Coffee shop sales curve (front-loaded due to morning rush)
      if (timeProgress <= 25) {
        // Morning rush: 60% of sales by 25% of business day
        return timeProgress * 2.4
      } else if (timeProgress <= 50) {
        // Lunch period: 90% of sales by 50% of business day
        return 60 + (timeProgress - 25) * 1.2
      } else {
        // Afternoon/evening: remaining 10% over latter half
        return Math.min(100, 90 + (timeProgress - 50) * 0.2)
      }

    case 'restaurant':
      // Restaurant sales curve (lunch and dinner peaks)
      if (timeProgress <= 20) {
        // Early hours: 15% of sales
        return timeProgress * 0.75
      } else if (timeProgress <= 40) {
        // Lunch rush: 50% of sales by 40% of day
        return 15 + (timeProgress - 20) * 1.75
      } else if (timeProgress <= 60) {
        // Afternoon lull: 65% of sales by 60% of day
        return 50 + (timeProgress - 40) * 0.75
      } else {
        // Dinner rush: remaining 35% over last 40%
        return 65 + (timeProgress - 60) * 0.875
      }

    case 'retail':
      // Retail sales curve (steady throughout day with evening peak)
      if (timeProgress <= 70) {
        // Steady sales: 70% by 70% of day
        return timeProgress
      } else {
        // Evening peak: remaining 30% over last 30%
        return 70 + (timeProgress - 70)
      }

    case 'linear':
    default:
      // Linear progression (original behavior)
      return timeProgress
  }
}

/**
 * Format business hours for display (converts 24-hour to 12-hour format)
 */
export function formatBusinessHours(start: string, end: string): string {
  if (!start || !end) return 'Not set'

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return `${formatTime(start)} - ${formatTime(end)}`
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
