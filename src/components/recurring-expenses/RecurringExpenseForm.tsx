import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { cn } from '@/lib/utils'
import { type RecurringExpense } from '@/lib/db/schema'
import { useExpenseCategories } from '@/hooks/useRecurringExpenses'

const recurringExpenseFormSchema = z.object({
  name: z.string()
    .min(1, 'Expense name is required')
    .max(100, 'Expense name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_().,&]+$/, 'Expense name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000000000, 'Amount cannot exceed 1 trillion IDR')
    .refine((amount) => Number.isFinite(amount), 'Amount must be a valid number'),
  frequency: z.enum(['monthly', 'yearly'], {
    required_error: 'Frequency is required',
  }),
  category: z.string().min(1, 'Category is required'),
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const startDate = new Date(date)
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      
      return startDate >= tenYearsAgo
    }, 'Start date cannot be more than 10 years ago'),
  endDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const endDate = new Date(date)
      const tenYearsFromNow = new Date()
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10)
      
      return endDate <= tenYearsFromNow
    }, 'End date cannot be more than 10 years in the future'),
  note: z.string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type RecurringExpenseFormData = z.infer<typeof recurringExpenseFormSchema>

interface RecurringExpenseFormProps {
  expense?: RecurringExpense
  onSuccess: (expense: RecurringExpense) => void
  onCancel: () => void
  onSubmit: (data: RecurringExpenseFormData) => Promise<void>
}

export function RecurringExpenseForm({ expense, onSuccess, onCancel, onSubmit: onSubmitProp }: RecurringExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!expense
  const predefinedCategories = useExpenseCategories()
  const { t } = useTranslation()

  const form = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: 0,
      frequency: 'monthly',
      category: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      note: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      form.reset({
        name: expense.name,
        description: expense.description || '',
        amount: expense.amount,
        frequency: expense.frequency,
        category: expense.category,
        startDate: expense.startDate,
        endDate: expense.endDate || '',
        note: expense.note || '',
      })
    }
  }, [expense, form])

  const onSubmit = async (data: RecurringExpenseFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await onSubmitProp(data)
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to save expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create category options for combobox
  const categoryOptions = predefinedCategories.map(category => ({
    value: category,
    label: category,
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('recurringExpenses.form.placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('recurringExpenses.form.placeholders.description')}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.amount')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                    placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.frequency')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                      <SelectValue placeholder={t('recurringExpenses.form.placeholders.frequency')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="monthly">{t('recurringExpenses.form.frequency.monthly')}</SelectItem>
                    <SelectItem value="yearly">{t('recurringExpenses.form.frequency.yearly')}</SelectItem>
                </SelectContent>
              </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.category')}</FormLabel>
              <FormControl>
                <Combobox
                  options={categoryOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('recurringExpenses.form.placeholders.category')}
                  searchPlaceholder={t('recurringExpenses.form.placeholders.searchCategories')}
                  showCreateOption={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('recurringExpenses.form.fields.startDate')}</FormLabel>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>{t('recurringExpenses.form.placeholders.pickDate')}</span>
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
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'))
                          setStartDateOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
                {/* Add invisible spacer to match end date field height */}
                <div className="h-5" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('recurringExpenses.form.fields.endDate')}</FormLabel>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>{t('recurringExpenses.form.placeholders.noEndDate')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          field.onChange('')
                          setEndDateOpen(false)
                        }}
                      >
                        {t('recurringExpenses.form.placeholders.clearDate')}
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'))
                        } else {
                          field.onChange('')
                        }
                        setEndDateOpen(false)
                      }}
                      disabled={(date) => {
                        const startDate = form.getValues('startDate')
                        return startDate ? date < new Date(startDate) : false
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs text-muted-foreground">
                  {t('recurringExpenses.form.descriptions.leaveEmpty')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('recurringExpenses.form.fields.note')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('recurringExpenses.form.placeholders.note')}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('recurringExpenses.form.buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('recurringExpenses.form.buttons.saving')
              : isEditing
                ? t('recurringExpenses.form.buttons.update')
                : t('recurringExpenses.form.buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
