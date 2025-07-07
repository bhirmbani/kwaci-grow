import { useState, useEffect, useMemo } from "react"
import { PlusIcon, Target, Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

  // Load targets when date changes
  useEffect(() => {
    if (selectedDate) {
      loadTargetsForDate(selectedDate)
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
    <div className="space-y-6">
      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Sales Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="bg-transparent p-0"
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
          <div className="flex w-full items-center justify-between px-1">
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

          {/* Summary Stats */}
          {selectedDate && !loading && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Targets:</span>
                <Badge variant="secondary">{totalTargets} items</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. Revenue:</span>
                <Badge variant="outline">{formatCurrency(estimatedRevenue)}</Badge>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && selectedDate && productTargets.length === 0 && (
            <div className="w-full text-center py-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active menus found for this date
              </p>
            </div>
          )}

          {/* Menu Summary */}
          {!loading && !error && targetsByMenu.size > 0 && (
            <div className="w-full space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Menus ({targetsByMenu.size})
              </div>
              {Array.from(targetsByMenu.entries()).map(([menuId, targets]) => {
                const menu = targets[0]?.menu
                const menuTotal = targets.reduce((sum, t) => sum + t.targetQuantity, 0)
                
                return (
                  <div
                    key={menuId}
                    className="bg-muted/50 rounded-md p-2 text-sm"
                  >
                    <div className="font-medium">{menu?.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {targets.length} products • {menuTotal} target items
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
