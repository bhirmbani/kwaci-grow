import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { SalesTargetService } from '@/lib/services/salesTargetService'
import { BranchService } from '@/lib/services/branchService'
import { MenuService } from '@/lib/services/menuService'
import { formatCurrency } from '@/utils/formatters'
import type { DailySalesTarget, Branch, MenuWithProductCount } from '@/lib/db/schema'

const salesTargetSchema = z.object({
  menuId: z.string().min(1, 'Menu is required'),
  branchId: z.string().min(1, 'Branch is required'),
  targetDate: z.string().min(1, 'Target date is required'),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
  note: z.string().optional(),
})

type SalesTargetData = z.infer<typeof salesTargetSchema>

interface SalesTargetFormProps {
  target?: DailySalesTarget
  menuId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function SalesTargetForm({ target, menuId, onSuccess, onCancel }: SalesTargetFormProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [menus, setMenus] = useState<MenuWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isEditing = !!target

  const form = useForm<SalesTargetData>({
    resolver: zodResolver(salesTargetSchema),
    defaultValues: {
      menuId: menuId || '',
      branchId: '',
      targetDate: '',
      targetAmount: 0,
      note: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, watch, setValue, register } = form
  const watchedTargetDate = watch('targetDate')
  const watchedTargetAmount = watch('targetAmount')

  // Load branches and menus
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [branchesData, menusData] = await Promise.all([
          BranchService.getAll(),
          MenuService.getAllWithProductCounts(false) // Only active menus
        ])
        setBranches(branchesData)
        setMenus(menusData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Initialize form data when target prop changes
  useEffect(() => {
    if (target) {
      setValue('menuId', target.menuId)
      setValue('branchId', target.branchId)
      setValue('targetDate', target.targetDate)
      setValue('targetAmount', target.targetAmount)
      setValue('note', target.note || '')
    } else if (menuId) {
      setValue('menuId', menuId)
    }
  }, [target, menuId, setValue])

  const onSubmit = async (data: SalesTargetData) => {
    try {
      if (isEditing) {
        await SalesTargetService.updateTarget(target.id, {
          targetAmount: data.targetAmount,
          note: data.note || '',
        })
      } else {
        await SalesTargetService.setTarget({
          menuId: data.menuId,
          branchId: data.branchId,
          targetDate: data.targetDate,
          targetAmount: data.targetAmount,
          note: data.note || '',
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save sales target:', error)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('targetDate', format(date, 'yyyy-MM-dd'))
      setCalendarOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error?.message}</div>
          ))}
        </div>
      )}

      {/* Menu Selection - Only show when not editing and no menuId provided */}
      {!isEditing && !menuId && (
        <div className="space-y-2">
          <Label htmlFor="menuId">Menu *</Label>
          <Select
            value={watch('menuId')}
            onValueChange={(value) => setValue('menuId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.map((menu) => (
                <SelectItem key={menu.id} value={menu.id}>
                  <div>
                    <p className="font-medium">{menu.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {menu.productCount} products
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.menuId && (
            <p className="text-sm text-red-600">{errors.menuId.message}</p>
          )}
        </div>
      )}

      {/* Menu Display - Show when editing or menuId provided */}
      {(isEditing || menuId) && (
        <div className="space-y-2">
          <Label>Menu</Label>
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">
              {isEditing && target ?
                menus.find(m => m.id === target.menuId)?.name || 'Unknown Menu' :
                menus.find(m => m.id === menuId)?.name || 'Loading...'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Menu cannot be changed when editing a target
            </p>
          </div>
        </div>
      )}

      {/* Branch Selection */}
      <div className="space-y-2">
        <Label htmlFor="branchId">Branch *</Label>
        <Select
          value={watch('branchId')}
          onValueChange={(value) => setValue('branchId', value)}
          disabled={isEditing} // Can't change branch when editing
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                <div>
                  <p className="font-medium">{branch.name}</p>
                  {branch.location && (
                    <p className="text-xs text-muted-foreground">{branch.location}</p>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.branchId && (
          <p className="text-sm text-red-600">{errors.branchId.message}</p>
        )}
      </div>

      {/* Target Date */}
      <div className="space-y-2">
        <Label>Target Date *</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchedTargetDate && "text-muted-foreground"
              )}
              disabled={isEditing} // Can't change date when editing
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchedTargetDate ? (
                format(new Date(watchedTargetDate), 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={watchedTargetDate ? new Date(watchedTargetDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Select the date for this sales target
        </p>
        {errors.targetDate && (
          <p className="text-sm text-red-600">{errors.targetDate.message}</p>
        )}
      </div>

      {/* Target Amount */}
      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (IDR) *</Label>
        <Input
          id="targetAmount"
          type="number"
          step="1000"
          min="0"
          placeholder="0"
          {...register('targetAmount', { valueAsNumber: true })}
        />
        {watchedTargetAmount > 0 && (
          <p className="text-xs text-muted-foreground">
            Target: {formatCurrency(watchedTargetAmount)}
          </p>
        )}
        {errors.targetAmount && (
          <p className="text-sm text-red-600">{errors.targetAmount.message}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Add any additional notes about this target"
          rows={2}
          {...register('note')}
        />
        <p className="text-xs text-muted-foreground">
          Optional notes about this sales target
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Setting...') 
            : (isEditing ? 'Update Target' : 'Set Target')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {/* Help Text */}
      {!isEditing && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Sales Target Tips:</p>
          <ul className="space-y-1">
            <li>• Set realistic daily targets based on historical data</li>
            <li>• Consider factors like location, day of week, and seasonality</li>
            <li>• Targets can be updated later if needed</li>
            <li>• Use targets to track performance and motivate staff</li>
          </ul>
        </div>
      )}
    </form>
  )
}
