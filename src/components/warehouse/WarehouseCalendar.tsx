import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Package } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import type { WarehouseBatchWithItems } from '@/hooks/useWarehouse'

interface WarehouseCalendarProps {
  batches: WarehouseBatchWithItems[]
}

export function WarehouseCalendar({ batches }: WarehouseCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Group batches by date
  const batchesByDate = useMemo(() => {
    const grouped = new Map<string, WarehouseBatchWithItems[]>()
    
    batches.forEach(batch => {
      const dateKey = new Date(batch.dateAdded).toDateString()
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(batch)
    })
    
    return grouped
  }, [batches])

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDay = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dateKey = currentDay.toDateString()
      const isCurrentMonth = currentDay.getMonth() === month
      const isToday = currentDay.toDateString() === new Date().toDateString()
      const hasBatches = batchesByDate.has(dateKey)
      const dayBatches = batchesByDate.get(dateKey) || []
      
      days.push({
        date: new Date(currentDay),
        dateKey,
        isCurrentMonth,
        isToday,
        hasBatches,
        batches: dayBatches,
        totalValue: dayBatches.reduce((sum, batch) =>
          sum + batch.items.reduce((itemSum, item) => {
            const cost = typeof item.totalCost === 'number' && !isNaN(item.totalCost) ? item.totalCost : 0
            return itemSum + cost
          }, 0), 0
        )
      })
      
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }, [currentDate, batchesByDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const selectedBatches = selectedDate ? batchesByDate.get(selectedDate) || [] : []

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Warehouse Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day) => (
              <button
                key={day.dateKey}
                onClick={() => setSelectedDate(day.hasBatches ? day.dateKey : null)}
                className={`
                  p-2 min-h-[80px] border rounded-lg text-left transition-colors
                  ${!day.isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''}
                  ${day.isToday ? 'border-primary bg-primary/10' : 'border-border'}
                  ${day.hasBatches ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'}
                  ${selectedDate === day.dateKey ? 'bg-primary/20 border-primary' : ''}
                `}
                disabled={!day.hasBatches}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                {day.hasBatches && (
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {day.batches.length} batch{day.batches.length !== 1 ? 'es' : ''}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(day.totalValue)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Batches for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedBatches.map((batch) => {
                const totalValue = batch.items.reduce((sum, item) => sum + item.totalCost, 0)
                
                return (
                  <div key={batch.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Batch #{batch.batchNumber}</h4>
                      <span className="font-semibold">{formatCurrency(totalValue)}</span>
                    </div>
                    {batch.note && (
                      <p className="text-sm text-muted-foreground mb-3">{batch.note}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {batch.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.ingredientName}</span>
                          <span className="text-muted-foreground">
                            {item.quantity.toFixed(1)} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {batches.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Warehouse Activity</h3>
              <p className="text-muted-foreground">
                No warehouse batches have been created yet. Use the COGS Calculator to add your first batch.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
