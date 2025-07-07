import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { ChartContainer, getCommonChartProps, getChartColors } from './BaseChart'
import { formatCurrency } from '@/utils/formatters'

interface ProductData {
  name: string
  quantity: number
  revenue: number
  percentage: number
}

interface ProductPopularityChartProps {
  data: ProductData[]
  height?: number
  showRevenue?: boolean
}

export function ProductPopularityChart({ 
  data, 
  height = 400, 
  showRevenue = false 
}: ProductPopularityChartProps) {
  const { theme } = useTheme()
  const chartProps = getCommonChartProps(theme)
  const colors = getChartColors(theme)

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={chartProps.tooltipProps.contentStyle}>
          <p style={chartProps.tooltipProps.labelStyle}>
            <strong>{data.name}</strong>
          </p>
          <p style={{ color: payload[0].color }}>
            Quantity: {data.quantity} items
          </p>
          <p style={{ color: payload[0].color }}>
            Revenue: {formatCurrency(data.revenue)}
          </p>
          <p style={{ color: payload[0].color }}>
            Share: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label formatter
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={Math.min(height * 0.35, 120)}
            fill="#8884d8"
            dataKey={showRevenue ? "revenue" : "quantity"}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            {...chartProps.legendProps}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
