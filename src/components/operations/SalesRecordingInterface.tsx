import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Plus, Filter, TrendingUp, DollarSign, Package, Award } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SalesRecordForm } from './SalesRecordForm'
import { SalesRecordService, type SalesRecordSummary } from '@/lib/services/salesRecordService'
import { BranchService } from '@/lib/services/branchService'
import { formatCurrency } from '@/utils/formatters'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type { SalesRecordWithDetails, Branch } from '@/lib/db/schema'

export function SalesRecordingInterface() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const [salesRecords, setSalesRecords] = useState<SalesRecordWithDetails[]>([])
  const [salesSummary, setSalesSummary] = useState<SalesRecordSummary>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProduct: null,
  })
  const [branches, setBranches] = useState<Branch[]>([])
  // Default to today's date to match the sales record form
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadBranches = async () => {
      if (!currentBusinessId) return

      try {
        const branchesData = await BranchService.getAllBranches()
        setBranches(branchesData.filter((branch) => branch.isActive))
      } catch (error) {
        console.error('Failed to load branches:', error)
      }
    }

    loadBranches()
  }, [currentBusinessId])

  // Load sales data when date or branch changes
  useEffect(() => {
    const loadSalesData = async () => {
      if (!currentBusinessId) {
        setLoading(false)
        setSalesRecords([])
        setSalesSummary({
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          topProduct: null,
        })
        return
      }

      setLoading(true)
      try {
        const [records, summary] = await Promise.all([
          SalesRecordService.getRecordsForDate(selectedDate, selectedBranch || undefined, currentBusinessId),
          SalesRecordService.getSalesSummary(selectedDate, selectedBranch || undefined, currentBusinessId),
        ])

        setSalesRecords(records)
        setSalesSummary(summary)
      } catch (error) {
        console.error('Failed to load sales data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSalesData()
  }, [selectedDate, selectedBranch, currentBusinessId])

  const handleRecordSuccess = () => {
    setSheetOpen(false)
    // Update the selected date to today to show the newly created record
    const today = format(new Date(), 'yyyy-MM-dd')
    if (selectedDate !== today) {
      setSelectedDate(today)
    }

    // Reload data to show the new record
    const loadSalesData = async () => {
      if (!currentBusinessId) return

      try {
        const [records, summary] = await Promise.all([
          SalesRecordService.getRecordsForDate(today, selectedBranch || undefined, currentBusinessId),
          SalesRecordService.getSalesSummary(today, selectedBranch || undefined, currentBusinessId),
        ])

        setSalesRecords(records)
        setSalesSummary(summary)
      } catch (error) {
        console.error('Failed to reload sales data:', error)
      }
    }

    loadSalesData()
  }

  return (
    <div className="space-y-6">


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('operations.salesRecording.filtersTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-filter">{t('operations.salesRecording.date')}</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-filter">{t('operations.salesRecording.branch')}</Label>
              <Select
                value={selectedBranch || 'all'}
                onValueChange={(value) => setSelectedBranch(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.salesRecording.allBranches')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.salesRecording.allBranches')}</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('operations.salesRecording.summary.totalSales')}</p>
                <p className="text-2xl font-bold">{salesSummary.totalSales}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('operations.salesRecording.summary.totalRevenue')}</p>
                <p className="text-2xl font-bold">{formatCurrency(salesSummary.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('operations.salesRecording.summary.avgOrderValue')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(salesSummary.averageOrderValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('operations.salesRecording.summary.topProduct')}</p>
                <p className="text-lg font-bold">
                  {salesSummary.topProduct ? salesSummary.topProduct.name : t('operations.salesRecording.summary.none')}
                </p>
                {salesSummary.topProduct && (
                  <p className="text-muted-foreground text-xs">
                    {t('operations.salesRecording.summary.sold', { count: salesSummary.topProduct.quantity })}
                  </p>
                )}
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Sales Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('operations.salesRecording.recordsTitle')}</CardTitle>
            <CardDescription>
              {t('operations.salesRecording.recordsDescription', {
                date: format(new Date(selectedDate), 'PPP'),
                branch: selectedBranch ? branches.find((b) => b.id === selectedBranch)?.name : null
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">{t('operations.salesRecording.loading')}</div>
              </div>
            ) : salesRecords.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">{t('operations.salesRecording.noRecords')}</div>
              </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('operations.salesRecording.table.time')}</TableHead>
                    <TableHead>{t('operations.salesRecording.table.product')}</TableHead>
                    <TableHead>{t('operations.salesRecording.table.menu')}</TableHead>
                    <TableHead>{t('operations.salesRecording.table.branch')}</TableHead>
                    <TableHead className="text-right">{t('operations.salesRecording.table.qty')}</TableHead>
                    <TableHead className="text-right">{t('operations.salesRecording.table.unitPrice')}</TableHead>
                    <TableHead className="text-right">{t('operations.salesRecording.table.total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono">{record.saleTime.substring(0, 5)}</TableCell>
                      <TableCell className="font-medium">{record.product.name}</TableCell>
                      <TableCell>{record.menu.name}</TableCell>
                      <TableCell>{record.branch.name}</TableCell>
                      <TableCell className="text-right">{record.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(record.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label={t('operations.salesRecording.addButton')}
          >
            <Plus className="text-primary-foreground m-auto flex h-8 w-8" />
          </SheetTrigger>
          <SheetContent className="h-full w-full overflow-y-auto sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>{t('operations.salesRecording.sheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('operations.salesRecording.sheetDescription')}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <SalesRecordForm
                onSuccess={handleRecordSuccess}
                onCancel={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
