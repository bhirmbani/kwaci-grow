import { useState, useEffect, useMemo, useCallback } from "react"
import { Target, Calendar as CalendarIcon } from "lucide-react"
import { useTranslation } from 'react-i18next'


import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { DailyProductSalesTargetService, type ProductTargetForDate } from "@/lib/services/dailyProductSalesTargetService"
import { BranchService } from "@/lib/services/branchService"
import { formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessId } from "@/lib/stores/businessStore"

interface DailySalesTargetCalendarProps {
  branchId: string
  onAddTarget?: (date: Date) => void
}

export default function DailySalesTargetCalendar({
  branchId,
  onAddTarget
}: DailySalesTargetCalendarProps) {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [productTargets, setProductTargets] = useState<ProductTargetForDate[]>([])
  const [monthlyTargets, setMonthlyTargets] = useState<Map<string, ProductTargetForDate[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidBranch, setIsValidBranch] = useState<boolean>(false)
  const currentBusinessId = useCurrentBusinessId()

  // Format date for API calls
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Validate that the branchId belongs to the current business
  const validateBranch = useCallback(async () => {
    if (!branchId || !currentBusinessId) {
      setIsValidBranch(false)
      setProductTargets([])
      setMonthlyTargets(new Map())
      setError(null)
      return
    }

    try {
      const branch = await BranchService.getById(branchId)
      const isValid = !!(branch && branch.businessId === currentBusinessId)
      setIsValidBranch(isValid)

      if (!isValid) {
        // Clear data when branch is invalid
        setProductTargets([])
        setMonthlyTargets(new Map())
        setError(null)
      }
    } catch (err) {
      console.error('Error validating branch:', err)
      setIsValidBranch(false)
      setProductTargets([])
      setMonthlyTargets(new Map())
      setError(null)
    }
  }, [branchId, currentBusinessId])

  // Load targets for selected date
  const loadTargetsForDate = useCallback(async (date: Date) => {
    if (!date || !currentBusinessId || !branchId || !isValidBranch) {
      setProductTargets([])
      setLoading(false)
      return
    }

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
      // Only show error if the branch is still valid (not during business switching)
      if (isValidBranch) {
        setError(t('salesTargets.errors.loadTargets'))
      }
      setProductTargets([])
    } finally {
      setLoading(false)
    }
  }, [branchId, currentBusinessId, isValidBranch])

  // Load monthly targets for calendar display
  const loadMonthlyTargets = useCallback(async (date: Date) => {
    if (!date || !currentBusinessId || !branchId || !isValidBranch) {
      setMonthlyTargets(new Map())
      return
    }

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
          // Only log warning if the branch is still valid (not during business switching)
          if (isValidBranch) {
            console.warn(`Failed to load targets for ${dateStr}:`, err)
          }
        }
      }
      
      setMonthlyTargets(monthlyData)
    } catch (err) {
      console.error('Error loading monthly targets:', err)
      // Only show error if the branch is still valid (not during business switching)
      if (isValidBranch) {
        setError(t('salesTargets.errors.loadMonthlyTargets'))
      }
    }
  }, [branchId, currentBusinessId, isValidBranch])

  // Validate branch when business context or branchId changes
  useEffect(() => {
    validateBranch()
  }, [validateBranch])

  // Load targets when date changes and branch is valid
  useEffect(() => {
    if (selectedDate && isValidBranch) {
      loadTargetsForDate(selectedDate)
      loadMonthlyTargets(selectedDate)
    }
  }, [selectedDate, loadTargetsForDate, loadMonthlyTargets, isValidBranch])

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
    // Trigger the same functionality as the plus button when clicking on a date
    if (date && onAddTarget) {
      onAddTarget(date)
    }
  }



  // Show message when branch is invalid
  if (!currentBusinessId || !branchId || !isValidBranch) {
    return (
      <div className="space-y-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              {t('salesTargets.dailyPage.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <div className="text-center py-8">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {!currentBusinessId
                  ? t('salesTargets.calendar.noBusiness')
                  : !branchId
                  ? t('salesTargets.calendar.noBranch')
                  : t('salesTargets.calendar.invalidBranch')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            {t('salesTargets.dailyPage.title')}
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
          <div className="text-sm font-medium">
            {selectedDate?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </CardHeader>
        <CardContent className="px-3">

          {/* Summary Stats */}
          {selectedDate && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('salesTargets.calendar.totalTargets')}:</span>
                <Badge variant="secondary" className="text-xs">{t('salesTargets.calendar.items', { count: totalTargets })}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('salesTargets.calendar.estRevenue')}:</span>
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
                {t('salesTargets.calendar.noMenusForDate')}
              </p>
            </div>
          )}

          {/* Menu Summary */}
          {!loading && !error && targetsByMenu.size > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('salesTargets.calendar.menusCount', { count: targetsByMenu.size })}
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
                      {t('salesTargets.calendar.menuSummary', { products: targets.length, total: menuTotal })}
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
