import { useState, useEffect, useMemo } from "react"
import { PlusIcon, Target, Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { DailyProductSalesTargetService, type ProductTargetForDate } from "@/lib/services/dailyProductSalesTargetService"
import { formatCurrency } from "@/utils/formatters"

interface DailySalesTargetCalendarProps {
  branchId: string
  onAddTarget?: (date: Date) => void
}

export default function DailySalesTargetCalendar({ 
  branchId, 
  onAddTarget 
}: DailySalesTargetCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [productTargets, setProductTargets] = useState<ProductTargetForDate[]>([])
  const [monthlyTargets, setMonthlyTargets] = useState<Map<string, ProductTargetForDate[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format date for API calls
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Load targets for selected date
  const loadTargetsForDate = async (date: Date) => {
    if (!date) return

    setLoading(true)
    setError(null)

    try {
      const targets = await DailyProductSalesTargetService.getMenusWithProductTargets(
        formatDateForAPI(date),
        branchId
      )
      setProductTargets(targets)
    } catch (err) {
      console.error('Error loading targets:', err)
      setError('Failed to load sales targets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load monthly targets for calendar display
  const loadMonthlyTargets = async (date: Date) => {
    if (!date) return

    setError(null)

    try {
      const year = date.getFullYear()
      const month = date.getMonth()
      const lastDay = new Date(year, month + 1, 0)
      
      // Load targets for each day of the month
      const monthlyData = new Map<string, ProductTargetForDate[]>()
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        try {
          const dayTargets = await DailyProductSalesTargetService.getMenusWithProductTargets(
            dateStr,
            branchId
          )
          if (dayTargets.length > 0) {
            monthlyData.set(dateStr, dayTargets)
          }
        } catch (err) {
          // Continue loading other days even if one fails
          console.warn(`Failed to load targets for ${dateStr}:`, err)
        }
      }
      
      setMonthlyTargets(monthlyData)
    } catch (err) {
      console.error('Error loading monthly targets:', err)
      setError('Failed to load monthly targets. Please try again.')
    }
  }

  // Load targets when date changes
  useEffect(() => {
    if (selectedDate) {
      loadTargetsForDate(selectedDate)
      loadMonthlyTargets(selectedDate)
    }
  }, [selectedDate, branchId])

  // Group targets by menu
  const targetsByMenu = useMemo(() => {
    const grouped = new Map<string, ProductTargetForDate[]>()
    
    productTargets.forEach(target => {
      const menuId = target.menuId
      if (!grouped.has(menuId)) {
        grouped.set(menuId, [])
      }
      grouped.get(menuId)!.push(target)
    })
    
    return grouped
  }, [productTargets])

  // Calculate total targets for the day
  const totalTargets = useMemo(() => {
    return productTargets.reduce((sum, target) => sum + target.targetQuantity, 0)
  }, [productTargets])

  // Calculate estimated revenue (sum of target quantity * price for each product)
  const estimatedRevenue = useMemo(() => {
    return productTargets.reduce((sum, target) => {
      return sum + (target.targetQuantity * target.menuProduct.price)
    }, 0)
  }, [productTargets])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleAddTarget = () => {
    if (selectedDate && onAddTarget) {
      onAddTarget(selectedDate)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Daily Sales Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            numberOfMonths={1}
            captionLayout="dropdown"
            className="w-full rounded-lg border shadow-sm [--cell-size:--spacing(9)] md:[--cell-size:--spacing(10)]"
            formatters={{
              formatMonthDropdown: (date) => {
                return date.toLocaleString("default", { month: "long" })
              },
            }}
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const dateKey = formatDateForAPI(day.date)
                const dayTargets = monthlyTargets.get(dateKey) || []
                const totalTargets = dayTargets.reduce((sum, target) => sum + target.targetQuantity, 0)
                const estimatedRevenue = dayTargets.reduce((sum, target) => {
                  return sum + (target.targetQuantity * target.menuProduct.price)
                }, 0)

                // Format revenue in shortened form (e.g., 3M, 500K, 1.2K)
                const formatShortCurrency = (amount: number): string => {
                  if (amount >= 1000000) {
                    return `${(amount / 1000000).toFixed(1)}M`
                  } else if (amount >= 1000) {
                    return `${(amount / 1000).toFixed(0)}K`
                  } else {
                    return amount.toString()
                  }
                }

                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                    {children}
                    {!modifiers.outside && totalTargets > 0 && (
                      <div className="text-[9px] leading-none mt-0.5 space-y-0">
                        <div className="font-semibold text-blue-600">{totalTargets}</div>
                        <div className="text-green-600 font-semibold">{formatShortCurrency(estimatedRevenue)}</div>
                      </div>
                    )}
                  </CalendarDayButton>
                )
              },
            }}
          />
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {selectedDate?.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              title="Add Target"
              onClick={handleAddTarget}
            >
              <PlusIcon />
              <span className="sr-only">Add Target</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3">

          {/* Summary Stats */}
          {selectedDate && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Targets:</span>
                <Badge variant="secondary" className="text-xs">{totalTargets} items</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Est. Revenue:</span>
                <Badge variant="outline" className="text-xs">{formatCurrency(estimatedRevenue)}</Badge>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && selectedDate && productTargets.length === 0 && (
            <div className="text-center py-3">
              <CalendarIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No active menus found for this date
              </p>
            </div>
          )}

          {/* Menu Summary */}
          {!loading && !error && targetsByMenu.size > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Menus ({targetsByMenu.size})
              </div>
              {Array.from(targetsByMenu.entries()).map(([menuId, targets]) => {
                const menu = targets[0]?.menu
                const menuTotal = targets.reduce((sum, t) => sum + t.targetQuantity, 0)
                
                return (
                  <div
                    key={menuId}
                    className="bg-muted/50 rounded-md p-2 text-xs"
                  >
                    <div className="font-medium">{menu?.name}</div>
                    <div className="text-muted-foreground text-[10px]">
                      {targets.length} products • {menuTotal} target items
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
