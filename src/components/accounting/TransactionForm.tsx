/**
 * Transaction Form Component
 * 
 * Smart form that adapts to different transaction types:
 * - Dynamic field rendering based on transaction type
 * - Integration with existing financial services
 * - Proper validation and error handling
 * - Support for all transaction categories
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useAccounting } from '@/hooks/useAccounting'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type { 
  TransactionType, 
  CreateTransactionData,
  UpdateTransactionData,
  UnifiedTransaction 
} from '@/lib/types/accounting'

// Base form schema
const baseTransactionSchema = z.object({
  type: z.enum([
    'CAPITAL_INVESTMENT',
    'SALES_INCOME', 
    'OPERATING_EXPENSE',
    'FIXED_COST',
    'VARIABLE_COST',
    'ASSET_PURCHASE',
    'RECURRING_EXPENSE'
  ] as const),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  note: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
})

// Extended schemas for specific transaction types
const salesIncomeSchema = baseTransactionSchema.extend({
  branchId: z.string().min(1, 'Branch is required'),
  menuId: z.string().min(1, 'Menu is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  saleTime: z.string().optional(),
})

const recurringExpenseSchema = baseTransactionSchema.extend({
  frequency: z.enum(['monthly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
})

const assetPurchaseSchema = baseTransactionSchema.extend({
  estimatedUsefulLifeYears: z.number().min(1, 'Useful life must be at least 1 year'),
})

const variableCostSchema = baseTransactionSchema.extend({
  baseUnitCost: z.number().min(0, 'Base unit cost must be non-negative').optional(),
  baseUnitQuantity: z.number().min(0, 'Base unit quantity must be non-negative').optional(),
  usagePerCup: z.number().min(0, 'Usage per cup must be non-negative').optional(),
  unit: z.string().optional(),
})

type TransactionFormData = z.infer<typeof baseTransactionSchema> & {
  // Sales Income fields
  branchId?: string
  menuId?: string
  productId?: string
  quantity?: number
  unitPrice?: number
  saleTime?: string
  
  // Recurring Expense fields
  frequency?: 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
  
  // Asset Purchase fields
  estimatedUsefulLifeYears?: number
  
  // Variable Cost fields
  baseUnitCost?: number
  baseUnitQuantity?: number
  usagePerCup?: number
  unit?: string
}

interface TransactionFormProps {
  transaction?: UnifiedTransaction
  onSuccess: () => void
  onCancel: () => void
  defaultType?: TransactionType
}

const TRANSACTION_TYPES: { value: TransactionType; label: string; description: string }[] = [
  {
    value: 'CAPITAL_INVESTMENT',
    label: 'Capital Investment',
    description: 'Money invested into the business'
  },
  {
    value: 'SALES_INCOME',
    label: 'Sales Income',
    description: 'Revenue from product sales'
  },
  {
    value: 'OPERATING_EXPENSE',
    label: 'Operating Expense',
    description: 'One-time operational costs'
  },
  {
    value: 'FIXED_COST',
    label: 'Fixed Cost',
    description: 'Regular fixed business costs'
  },
  {
    value: 'VARIABLE_COST',
    label: 'Variable Cost',
    description: 'Costs that vary with production'
  },
  {
    value: 'ASSET_PURCHASE',
    label: 'Asset Purchase',
    description: 'Purchase of fixed assets'
  },
  {
    value: 'RECURRING_EXPENSE',
    label: 'Recurring Expense',
    description: 'Monthly or yearly recurring costs'
  }
]

const COMMON_CATEGORIES = {
  CAPITAL_INVESTMENT: ['Initial Investment', 'Additional Capital', 'Loan Proceeds'],
  SALES_INCOME: ['Product Sales', 'Service Revenue', 'Other Income'],
  OPERATING_EXPENSE: ['Marketing', 'Utilities', 'Repairs', 'Supplies', 'Professional Services'],
  FIXED_COST: ['Rent', 'Insurance', 'Salaries', 'Loan Payments'],
  VARIABLE_COST: ['Ingredients', 'Packaging', 'Direct Labor'],
  ASSET_PURCHASE: ['Equipment', 'Furniture', 'Technology', 'Vehicles'],
  RECURRING_EXPENSE: ['Rent', 'Utilities', 'Insurance', 'Subscriptions', 'Salaries']
}

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
  defaultType = 'OPERATING_EXPENSE'
}: TransactionFormProps) {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const { createTransaction, updateTransaction } = useAccounting()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isEditing = !!transaction

  // Dynamic schema based on transaction type
  const getValidationSchema = (type: TransactionType) => {
    switch (type) {
      case 'SALES_INCOME':
        return salesIncomeSchema
      case 'RECURRING_EXPENSE':
        return recurringExpenseSchema
      case 'ASSET_PURCHASE':
        return assetPurchaseSchema
      case 'VARIABLE_COST':
        return variableCostSchema
      default:
        return baseTransactionSchema
    }
  }

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(baseTransactionSchema),
    defaultValues: {
      type: transaction?.type || defaultType,
      category: transaction?.category || '',
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      note: transaction?.note || '',
      date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
      // Extended fields
      quantity: transaction?.metadata?.quantity || 1,
      unitPrice: transaction?.metadata?.unitPrice || 0,
      frequency: transaction?.metadata?.frequency || 'monthly',
      estimatedUsefulLifeYears: transaction?.metadata?.estimatedUsefulLifeYears || 5,
      baseUnitCost: transaction?.metadata?.baseUnitCost || 0,
      baseUnitQuantity: transaction?.metadata?.baseUnitQuantity || 0,
      usagePerCup: transaction?.metadata?.usagePerCup || 0,
      unit: transaction?.metadata?.unit || '',
    },
  })

  const selectedType = form.watch('type')

  // Update validation schema when type changes
  useEffect(() => {
    const schema = getValidationSchema(selectedType)
    form.clearErrors()
    // Note: React Hook Form doesn't support dynamic schema changes easily
    // For now, we'll handle validation manually in onSubmit
  }, [selectedType, form])

  const onSubmit = async (data: TransactionFormData) => {
    if (!currentBusinessId) {
      form.setError('root', { message: 'No business selected' })
      return
    }

    try {
      setIsSubmitting(true)

      // Validate with the appropriate schema
      const schema = getValidationSchema(data.type)
      const validatedData = schema.parse(data)

      // Prepare metadata based on transaction type
      const metadata: any = {}
      
      if (data.type === 'SALES_INCOME') {
        metadata.branchId = data.branchId
        metadata.menuId = data.menuId
        metadata.productId = data.productId
        metadata.quantity = data.quantity
        metadata.unitPrice = data.unitPrice
        metadata.saleTime = data.saleTime
      } else if (data.type === 'RECURRING_EXPENSE') {
        metadata.frequency = data.frequency
        metadata.startDate = data.startDate
        metadata.endDate = data.endDate
      } else if (data.type === 'ASSET_PURCHASE') {
        metadata.estimatedUsefulLifeYears = data.estimatedUsefulLifeYears
      } else if (data.type === 'VARIABLE_COST') {
        metadata.baseUnitCost = data.baseUnitCost
        metadata.baseUnitQuantity = data.baseUnitQuantity
        metadata.usagePerCup = data.usagePerCup
        metadata.unit = data.unit
      }

      if (isEditing && transaction) {
        // Update existing transaction
        const updateData: UpdateTransactionData = {
          category: validatedData.category,
          amount: validatedData.amount,
          description: validatedData.description,
          note: validatedData.note,
          date: validatedData.date,
          metadata
        }
        
        await updateTransaction(transaction.id, updateData)
      } else {
        // Create new transaction
        const createData: CreateTransactionData = {
          businessId: currentBusinessId,
          type: validatedData.type,
          category: validatedData.category,
          amount: validatedData.amount,
          description: validatedData.description,
          note: validatedData.note,
          date: validatedData.date,
          metadata
        }
        
        await createTransaction(createData)
      }

      onSuccess()
    } catch (error) {
      console.error('Transaction form error:', error)
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach((err) => {
          form.setError(err.path[0] as any, { message: err.message })
        })
      } else {
        form.setError('root', { 
          message: error instanceof Error ? error.message : 'Failed to save transaction' 
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounting.transactionForm.fields.transactionType')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isEditing} // Don't allow type changes when editing
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounting.transactionForm.placeholders.transactionType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounting.transactionForm.fields.category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounting.transactionForm.placeholders.category')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_CATEGORIES[selectedType]?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">{t('accounting.transactionForm.other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounting.transactionForm.fields.amount')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounting.transactionForm.fields.description')}</FormLabel>
              <FormControl>
                <Input placeholder={t('accounting.transactionForm.placeholders.description')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('accounting.transactionForm.fields.date')}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>{t('accounting.transactionForm.placeholders.date')}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                      setCalendarOpen(false)
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Fields Based on Transaction Type */}
        {selectedType === 'SALES_INCOME' && (
          <>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.quantity')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.unitPrice')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('accounting.transactionForm.descriptions.unitPrice')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'RECURRING_EXPENSE' && (
          <>
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.frequency')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('accounting.transactionForm.placeholders.frequency')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{t('accounting.transactionForm.frequency.monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('accounting.transactionForm.frequency.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'ASSET_PURCHASE' && (
          <FormField
            control={form.control}
            name="estimatedUsefulLifeYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('accounting.transactionForm.fields.usefulLife')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                  />
                </FormControl>
                <FormDescription>
                  {t('accounting.transactionForm.descriptions.usefulLife')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === 'VARIABLE_COST' && (
          <>
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.unit')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('accounting.transactionForm.placeholders.unit')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseUnitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.baseUnitCost')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('accounting.transactionForm.descriptions.baseUnitCost')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usagePerCup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounting.transactionForm.fields.usagePerCup')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('accounting.transactionForm.descriptions.usagePerCup')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounting.transactionForm.fields.note')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('accounting.transactionForm.placeholders.note')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Root Error */}
        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? t('accounting.transactionForm.buttons.update') : t('accounting.transactionForm.buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
