import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { ChartContainer, getCommonChartProps, getChartColors } from './BaseChart'
import { formatCurrency } from '@/utils/formatters'

interface ProgressData {
  time: string
  actual: number
  target: number
  percentage: number
}

interface SalesProgressChartProps {
  data: ProgressData[]
  height?: number
  targetAmount: number
}

export function SalesProgressChart({ 
  data, 
  height = 400, 
  targetAmount 
}: SalesProgressChartProps) {
  const { theme } = useTheme()
  const chartProps = getCommonChartProps(theme)
  const colors = getChartColors(theme)

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={chartProps.tooltipProps.contentStyle}>
          <p style={chartProps.tooltipProps.labelStyle}>
            <strong>{`Time: ${label}`}</strong>
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'actual' && `Actual: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'target' && `Target: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'percentage' && `Progress: ${entry.value.toFixed(1)}%`}
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
        <LineChart data={data} {...chartProps}>
          <CartesianGrid {...chartProps.gridProps} />
          <XAxis 
            dataKey="time" 
            {...chartProps.axisProps}
          />
          <YAxis 
            {...chartProps.axisProps}
            tickFormatter={(value) => formatCurrency(value, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend {...chartProps.legendProps} />
          
          {/* Reference line for target */}
          <ReferenceLine
            y={targetAmount}
            stroke={colors[3]}
            strokeDasharray="5 5"
            label={{ value: "Daily Target", position: "top" }}
          />
          
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke={colors[0]} 
            strokeWidth={3}
            name="Actual Sales"
            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke={colors[1]} 
            strokeWidth={2}
            strokeDasharray="3 3"
            name="Expected Progress"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
