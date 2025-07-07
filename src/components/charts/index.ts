export { ChartContainer, getChartTheme, getCommonChartProps, getChartColors } from './BaseChart'
export { HourlyProfitabilityChart } from './HourlyProfitabilityChart'
export { ProductPopularityChart } from './ProductPopularityChart'
export { SalesProgressChart } from './SalesProgressChart'

// Chart data types
export interface HourlyData {
  hour: string
  revenue: number
  profit: number
  sales: number
}

export interface ProductData {
  name: string
  quantity: number
  revenue: number
  percentage: number
}

export interface ProgressData {
  time: string
  actual: number
  target: number
  percentage: number
}
