/**
 * Transaction Filters Component
 * 
 * Advanced filtering interface for transactions with:
 * - Date range selection
 * - Transaction type filtering
 * - Amount range filtering
 * - Category and status filtering
 * - Search functionality
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Filter, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { 
  TransactionFilters as ITransactionFilters, 
  TransactionType, 
  TransactionStatus 
} from '@/lib/types/accounting'

const filtersSchema = z.object({
  searchTerm: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  types: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
})

type FiltersFormData = z.infer<typeof filtersSchema>

interface TransactionFiltersProps {
  onApplyFilters: (filters: ITransactionFilters) => void
  onClearFilters: () => void
  currentFilters?: ITransactionFilters | null
  availableCategories?: string[]
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'CAPITAL_INVESTMENT', label: 'Capital Investment' },
  { value: 'SALES_INCOME', label: 'Sales Income' },
  { value: 'OPERATING_EXPENSE', label: 'Operating Expense' },
  { value: 'FIXED_COST', label: 'Fixed Cost' },
  { value: 'VARIABLE_COST', label: 'Variable Cost' },
  { value: 'ASSET_PURCHASE', label: 'Asset Purchase' },
  { value: 'ASSET_DEPRECIATION', label: 'Asset Depreciation' },
  { value: 'RECURRING_EXPENSE', label: 'Recurring Expense' },
]

const TRANSACTION_STATUS: { value: TransactionStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RECURRING', label: 'Recurring' },
]

export function TransactionFilters({
  onApplyFilters,
  onClearFilters,
  currentFilters,
  availableCategories = []
}: TransactionFiltersProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([])
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { t } = useTranslation()

  const form = useForm<FiltersFormData>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      searchTerm: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
      types: [],
      status: [],
      categories: [],
    },
  })

  // Initialize form with current filters
  useEffect(() => {
    if (currentFilters) {
      form.setValue('searchTerm', currentFilters.searchTerm || '')
      form.setValue('startDate', currentFilters.dateRange?.start || '')
      form.setValue('endDate', currentFilters.dateRange?.end || '')
      form.setValue('minAmount', currentFilters.amountRange?.min)
      form.setValue('maxAmount', currentFilters.amountRange?.max)
      
      if (currentFilters.types) {
        setSelectedTypes(currentFilters.types)
        form.setValue('types', currentFilters.types)
      }
      
      if (currentFilters.status) {
        setSelectedStatus(currentFilters.status)
        form.setValue('status', currentFilters.status)
      }
      
      if (currentFilters.categories) {
        setSelectedCategories(currentFilters.categories)
        form.setValue('categories', currentFilters.categories)
      }
    }
  }, [currentFilters, form])

  const handleTypeChange = (type: TransactionType, checked: boolean) => {
    const newTypes = checked 
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type)
    
    setSelectedTypes(newTypes)
    form.setValue('types', newTypes)
  }

  const handleStatusChange = (status: TransactionStatus, checked: boolean) => {
    const newStatus = checked 
      ? [...selectedStatus, status]
      : selectedStatus.filter(s => s !== status)
    
    setSelectedStatus(newStatus)
    form.setValue('status', newStatus)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category)
    
    setSelectedCategories(newCategories)
    form.setValue('categories', newCategories)
  }

  const onSubmit = (data: FiltersFormData) => {
    const filters: ITransactionFilters = {}

    if (data.searchTerm) {
      filters.searchTerm = data.searchTerm
    }

    if (data.startDate || data.endDate) {
      filters.dateRange = {
        start: data.startDate || '',
        end: data.endDate || ''
      }
    }

    if (data.minAmount !== undefined || data.maxAmount !== undefined) {
      filters.amountRange = {
        min: data.minAmount || 0,
        max: data.maxAmount || Number.MAX_SAFE_INTEGER
      }
    }

    if (selectedTypes.length > 0) {
      filters.types = selectedTypes
    }

    if (selectedStatus.length > 0) {
      filters.status = selectedStatus
    }

    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories
    }

    onApplyFilters(filters)
  }

  const handleClearFilters = () => {
    form.reset()
    setSelectedTypes([])
    setSelectedStatus([])
    setSelectedCategories([])
    onClearFilters()
  }

  const hasActiveFilters = selectedTypes.length > 0 || 
                          selectedStatus.length > 0 || 
                          selectedCategories.length > 0 ||
                          form.watch('searchTerm') ||
                          form.watch('startDate') ||
                          form.watch('endDate') ||
                          form.watch('minAmount') !== undefined ||
                          form.watch('maxAmount') !== undefined

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">{t('accounting.filters.title')}</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            {t('accounting.filters.clearAll')}
          </Button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{t('accounting.filters.search')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('accounting.filters.searchPlaceholder')}
              className="pl-10"
              {...form.register('searchTerm')}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('accounting.filters.startDate')}</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch('startDate') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('startDate') ? (
                    format(new Date(form.watch('startDate')!), "PPP")
                  ) : (
                    <span>{t('accounting.filters.pickStart')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('startDate') ? new Date(form.watch('startDate')!) : undefined}
                  onSelect={(date) => {
                    form.setValue('startDate', date ? format(date, 'yyyy-MM-dd') : '')
                    setStartDateOpen(false)
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('accounting.filters.endDate')}</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch('endDate') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('endDate') ? (
                    format(new Date(form.watch('endDate')!), "PPP")
                  ) : (
                    <span>{t('accounting.filters.pickEnd')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('endDate') ? new Date(form.watch('endDate')!) : undefined}
                  onSelect={(date) => {
                    form.setValue('endDate', date ? format(date, 'yyyy-MM-dd') : '')
                    setEndDateOpen(false)
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAmount">{t('accounting.filters.minAmount')}</Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register('minAmount', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAmount">{t('accounting.filters.maxAmount')}</Label>
            <Input
              id="maxAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              {...form.register('maxAmount', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Transaction Types */}
        <div className="space-y-2">
          <Label>{t('accounting.filters.types')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {TRANSACTION_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={(checked) => 
                    handleTypeChange(type.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>{t('accounting.filters.status')}</Label>
          <div className="flex flex-wrap gap-2">
            {TRANSACTION_STATUS.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={selectedStatus.includes(status.value)}
                  onCheckedChange={(checked) => 
                    handleStatusChange(status.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`status-${status.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <Label>{t('accounting.filters.categories')}</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            {t('accounting.filters.clear')}
          </Button>
          <Button type="submit">
            {t('accounting.filters.apply')}
          </Button>
        </div>
      </form>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('accounting.filters.active')}:</Label>
          <div className="flex flex-wrap gap-1">
            {selectedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {TRANSACTION_TYPES.find(t => t.value === type)?.label}
              </Badge>
            ))}
            {selectedStatus.map((status) => (
              <Badge key={status} variant="secondary" className="text-xs">
                {TRANSACTION_STATUS.find(s => s.value === status)?.label}
              </Badge>
            ))}
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {form.watch('searchTerm') && (
              <Badge variant="secondary" className="text-xs">
                {t('accounting.filters.searchLabel', { term: form.watch('searchTerm') })}
              </Badge>
            )}
            {(form.watch('startDate') || form.watch('endDate')) && (
              <Badge variant="secondary" className="text-xs">
                {t('accounting.filters.dateRange')}
              </Badge>
            )}
            {(form.watch('minAmount') !== undefined || form.watch('maxAmount') !== undefined) && (
              <Badge variant="secondary" className="text-xs">
                {t('accounting.filters.amountRange')}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
