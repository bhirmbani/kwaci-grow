import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { ChartContainer, getCommonChartProps, getChartColors } from './BaseChart'
import { formatCurrency } from '@/utils/formatters'

interface HourlyData {
  hour: string
  revenue: number
  profit: number
  sales: number
}

interface HourlyProfitabilityChartProps {
  data: HourlyData[]
  height?: number
}

export function HourlyProfitabilityChart({ data, height = 400 }: HourlyProfitabilityChartProps) {
  const { theme } = useTheme()
  const chartProps = getCommonChartProps(theme)
  const colors = getChartColors(theme)

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={chartProps.tooltipProps.contentStyle}>
          <p style={chartProps.tooltipProps.labelStyle}>
            <strong>{`Hour: ${label}`}</strong>
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' && `Revenue: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'profit' && `Profit: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'sales' && `Sales: ${entry.value} items`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} {...chartProps}>
          <CartesianGrid {...chartProps.gridProps} />
          <XAxis 
            dataKey="hour" 
            {...chartProps.axisProps}
          />
          <YAxis 
            {...chartProps.axisProps}
            tickFormatter={(value) => formatCurrency(value, true)} // Short format
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend {...chartProps.legendProps} />
          <Bar 
            dataKey="revenue" 
            fill={colors[0]} 
            name="Revenue"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="profit" 
            fill={colors[1]} 
            name="Profit"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
