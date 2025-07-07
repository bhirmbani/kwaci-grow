import { useTheme } from '@/contexts/ThemeContext'

// Chart theme configuration for light and dark modes
export const getChartTheme = (theme: 'light' | 'dark') => {
  const colors = {
    light: {
      background: '#ffffff',
      text: '#0f172a', // slate-900
      textMuted: '#64748b', // slate-500
      grid: '#e2e8f0', // slate-200
      primary: '#3b82f6', // blue-500
      secondary: '#10b981', // emerald-500
      accent: '#f59e0b', // amber-500
      danger: '#ef4444', // red-500
      success: '#22c55e', // green-500
      warning: '#f97316', // orange-500
    },
    dark: {
      background: '#0f172a', // slate-900
      text: '#f8fafc', // slate-50
      textMuted: '#94a3b8', // slate-400
      grid: '#334155', // slate-700
      primary: '#60a5fa', // blue-400
      secondary: '#34d399', // emerald-400
      accent: '#fbbf24', // amber-400
      danger: '#f87171', // red-400
      success: '#4ade80', // green-400
      warning: '#fb923c', // orange-400
    }
  }

  return colors[theme]
}

// Custom chart container with theme support
interface ChartContainerProps {
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ children, className = '' }: ChartContainerProps) {
  const { theme } = useTheme()
  const chartTheme = getChartTheme(theme)

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{ 
        backgroundColor: chartTheme.background,
        color: chartTheme.text 
      }}
    >
      {children}
    </div>
  )
}

// Common chart props for consistent styling
export const getCommonChartProps = (theme: 'light' | 'dark') => {
  const chartTheme = getChartTheme(theme)
  
  return {
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    style: {
      backgroundColor: chartTheme.background,
    },
    // Common axis props
    axisProps: {
      tick: { fill: chartTheme.text, fontSize: 12 },
      axisLine: { stroke: chartTheme.grid },
      tickLine: { stroke: chartTheme.grid },
    },
    // Grid props
    gridProps: {
      stroke: chartTheme.grid,
      strokeDasharray: '3 3',
    },
    // Tooltip props
    tooltipProps: {
      contentStyle: {
        backgroundColor: chartTheme.background,
        border: `1px solid ${chartTheme.grid}`,
        borderRadius: '6px',
        color: chartTheme.text,
        fontSize: '12px',
      },
      labelStyle: {
        color: chartTheme.text,
      },
    },
    // Legend props
    legendProps: {
      wrapperStyle: {
        color: chartTheme.text,
        fontSize: '12px',
      },
    },
  }
}

// Color palette for charts
export const getChartColors = (theme: 'light' | 'dark') => {
  const chartTheme = getChartTheme(theme)
  
  return [
    chartTheme.primary,
    chartTheme.secondary,
    chartTheme.accent,
    chartTheme.warning,
    chartTheme.success,
    chartTheme.danger,
    '#8b5cf6', // violet-500/400
    '#ec4899', // pink-500/400
    '#06b6d4', // cyan-500/400
    '#84cc16', // lime-500/400
  ]
}
