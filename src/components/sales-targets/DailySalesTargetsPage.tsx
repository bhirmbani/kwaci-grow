import { useState, useEffect, useMemo, useCallback } from "react"
import { Target, Calendar as CalendarIcon, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import DailySalesTargetCalendar from "./DailySalesTargetCalendar"
import { MenuTargetSection } from "./MenuTargetSection"
import { DailyProductSalesTargetService, type ProductTargetForDate } from "@/lib/services/dailyProductSalesTargetService"
import { BranchService } from "@/lib/services/branchService"
import { formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessId } from "@/lib/stores/businessStore"
import type { Branch } from "@/lib/db/schema"

export default function DailySalesTargetsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [productTargets, setProductTargets] = useState<ProductTargetForDate[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentBusinessId = useCurrentBusinessId()

  // Format date for API calls
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Load branches when business context changes
  const loadBranches = useCallback(async () => {
    if (!currentBusinessId) {
      // Clear state when no business is selected
      setBranches([])
      setSelectedBranchId("")
      setProductTargets([])
      setError(null)
      return
    }

    try {
      const branchList = await BranchService.getAll()
      setBranches(branchList)

      // Clear previous state first to prevent race conditions
      setSelectedBranchId("")
      setProductTargets([])
      setError(null)

      // Reset selected branch when business changes and set default branch (first active branch)
      const activeBranch = branchList.find(b => b.isActive)
      if (activeBranch) {
        setSelectedBranchId(activeBranch.id)
      }
    } catch (err) {
      console.error('Error loading branches:', err)
      setError('Failed to load branches. Please refresh the page.')
      setSelectedBranchId("")
      setProductTargets([])
    }
  }, [currentBusinessId])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  const loadTargetsForDate = useCallback(async (date: Date, branchId: string) => {
    if (!currentBusinessId || !branchId) return

    // Validate that the branch belongs to the current business before making API call
    const branch = branches.find(b => b.id === branchId)
    if (!branch || branch.businessId !== currentBusinessId) {
      // Branch doesn't belong to current business, clear targets silently
      setProductTargets([])
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
      setError('Failed to load sales targets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId, branches])

  // Load targets when date or branch changes
  useEffect(() => {
    if (selectedDate && selectedBranchId && branches.length > 0) {
      loadTargetsForDate(selectedDate, selectedBranchId)
    }
  }, [selectedDate, selectedBranchId, loadTargetsForDate, branches])

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

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const totalTargets = productTargets.reduce((sum, target) => sum + target.targetQuantity, 0)
    const totalRevenue = productTargets.reduce((sum, target) => {
      return sum + (target.targetQuantity * target.menuProduct.price)
    }, 0)
    const activeTargets = productTargets.filter(target => target.targetQuantity > 0).length

    return {
      totalTargets,
      totalRevenue,
      activeTargets,
      totalProducts: productTargets.length
    }
  }, [productTargets])

  const handleTargetUpdate = async (
    menuId: string,
    productId: string,
    targetQuantity: number,
    note: string
  ) => {
    setUpdating(true)
    try {
      await DailyProductSalesTargetService.createOrUpdateTarget(
        menuId,
        productId,
        selectedBranchId,
        formatDateForAPI(selectedDate),
        targetQuantity,
        note
      )

      // Reload targets to get updated data
      await loadTargetsForDate(selectedDate, selectedBranchId)
    } catch (err) {
      console.error('Error updating target:', err)
      throw new Error('Failed to update target. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleRefresh = () => {
    if (selectedDate && selectedBranchId) {
      loadTargetsForDate(selectedDate, selectedBranchId)
    }
  }

  const handleAddTarget = (date: Date) => {
    setSelectedDate(date)
    // The targets will be loaded automatically via useEffect
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8" />
            Daily Sales Targets
          </h1>
          <p className="text-muted-foreground mt-1">
            Set and manage daily sales targets for your menu products
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Branch Selector */}
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.filter(b => b.isActive).map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !selectedBranchId}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <DailySalesTargetCalendar
            branchId={selectedBranchId}
            onAddTarget={handleAddTarget}
          />
        </div>

        {/* Targets Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Summary */}
          {selectedDate && selectedBranchId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {dailyTotals.totalTargets}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dailyTotals.totalRevenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">Est. Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dailyTotals.activeTargets}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {targetsByMenu.size}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Menus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {/* Menu Targets */}
          {!loading && selectedBranchId && targetsByMenu.size > 0 && (
            <div className="space-y-4">
              {Array.from(targetsByMenu.entries()).map(([menuId, targets]) => {
                const menu = targets[0]?.menu
                if (!menu) return null

                return (
                  <MenuTargetSection
                    key={menuId}
                    menuId={menuId}
                    menuName={menu.name}
                    menuDescription={menu.description}
                    products={targets}
                    onTargetUpdate={handleTargetUpdate}
                    isUpdating={updating}
                  />
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && selectedBranchId && targetsByMenu.size === 0 && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Menus</h3>
                  <p className="text-muted-foreground mb-4">
                    No active menus found for the selected branch and date.
                  </p>
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Branch Selected */}
          {!selectedBranchId && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Branch</h3>
                  <p className="text-muted-foreground">
                    Please select a branch to view and manage sales targets.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
