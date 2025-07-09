import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { BranchService } from '@/lib/services/branchService'
import type { PlanGoal, PlanTask, NewPlanGoal } from '@/lib/db/planningSchema'
import type { Branch } from '@/lib/db/schema'

const goalFormSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().min(1, 'Goal description is required'),
  targetValue: z.number().min(0.01, 'Target value must be greater than 0'),
  currentValue: z.number().min(0, 'Current value must be 0 or greater').default(0),
  unit: z.string().min(1, 'Unit is required'),
  category: z.enum(['sales', 'production', 'efficiency', 'quality', 'cost']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  completed: z.boolean().default(false),
  branchId: z.string().min(1, 'Branch selection is required'),
  linkedTaskIds: z.array(z.string()).default([]),
  note: z.string().default('')
}).refine((data) => data.currentValue <= data.targetValue, {
  message: "Current progress cannot exceed target value",
  path: ["currentValue"]
})

type GoalFormData = z.infer<typeof goalFormSchema>

interface GoalFormProps {
  goal?: PlanGoal
  planId: string
  availableTasks: PlanTask[]
  onSubmit: (goalData: Omit<NewPlanGoal, 'id' | 'planId'>) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function GoalForm({ goal, planId, availableTasks, onSubmit, onCancel, isSubmitting = false }: GoalFormProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isEditing = !!goal

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      category: 'sales',
      priority: 'medium',
      dueDate: '',
      completed: false,
      branchId: '',
      linkedTaskIds: [],
      note: '',
    },
  })

  const { handleSubmit, formState: { errors }, watch, setValue, register } = form
  const watchedDueDate = watch('dueDate')
  const watchedLinkedTaskIds = watch('linkedTaskIds')

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true)
        const branchList = await BranchService.getAll()
        setBranches(branchList)
      } catch (error) {
        console.error('Failed to load branches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBranches()
  }, [])

  // Initialize form data when goal prop changes
  useEffect(() => {
    if (goal) {
      form.reset({
        title: goal.title,
        description: goal.description,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        category: goal.category,
        priority: goal.priority,
        dueDate: goal.dueDate || '',
        completed: goal.completed,
        branchId: goal.branchId || '',
        linkedTaskIds: goal.linkedTaskIds || [],
        note: goal.note || '',
      })
    }
  }, [goal, form])

  const handleFormSubmit = async (data: GoalFormData) => {
    try {
      await onSubmit({
        title: data.title.trim(),
        description: data.description.trim(),
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit.trim(),
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
        completed: data.completed,
        branchId: data.branchId || undefined,
        linkedTaskIds: data.linkedTaskIds,
        note: data.note.trim(),
      })
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  const taskOptions = availableTasks.map(task => ({
    value: task.id,
    label: task.title
  }))

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., Daily Coffee Sales Target, Monthly Revenue Goal"
        />
        <p className="text-xs text-muted-foreground">
          Give your goal a clear, descriptive name that explains what you want to achieve
        </p>
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Provide details about this goal, why it's important, and how you plan to achieve it"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Explain the purpose and context of this goal to help track progress and maintain focus
        </p>
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Target and Current Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetValue">Target Value *</Label>
          <Input
            id="targetValue"
            type="number"
            step="0.01"
            {...register('targetValue', { valueAsNumber: true })}
            placeholder="500"
          />
          <p className="text-xs text-muted-foreground">
            The goal you want to achieve (e.g., 500 cups sold, 2000000 IDR revenue)
          </p>
          {errors.targetValue && (
            <p className="text-sm text-red-600">{errors.targetValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Progress</Label>
          <Input
            id="currentValue"
            type="number"
            step="0.01"
            {...register('currentValue', { valueAsNumber: true })}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Your current progress (starts at 0, update as you make progress toward your goal)
          </p>
          {errors.currentValue && (
            <p className="text-sm text-red-600">{errors.currentValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            {...register('unit')}
            placeholder="cups"
          />
          <p className="text-xs text-muted-foreground">
            Measurement unit (cups, IDR, percentage, customers, etc.)
          </p>
          {errors.unit && (
            <p className="text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={watch('category')}
            onValueChange={(value) => setValue('category', value as GoalFormData['category'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the type of goal: Sales (revenue, customers), Production (output, quality), etc.
          </p>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={watch('priority')}
            onValueChange={(value) => setValue('priority', value as GoalFormData['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Set the importance level: High (critical), Medium (important), Low (nice to have)
          </p>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Branch Selection */}
      <div className="space-y-2">
        <Label htmlFor="branchId">Branch *</Label>
        <Select
          value={watch('branchId')}
          onValueChange={(value) => setValue('branchId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.filter(b => b.isActive).map((branch) => (
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
        <p className="text-xs text-muted-foreground">
          Select which branch location this goal applies to for tracking and reporting
        </p>
        {errors.branchId && (
          <p className="text-sm text-red-600">{errors.branchId.message}</p>
        )}
      </div>

      {/* Task Linking */}
      <div className="space-y-2">
        <Label>Linked Tasks (Optional)</Label>
        <MultiSelect
          options={taskOptions}
          value={watchedLinkedTaskIds}
          onValueChange={(value) => setValue('linkedTaskIds', value)}
          placeholder="Select tasks to link..."
          disabled={availableTasks.length === 0}
        />
        <p className="text-xs text-muted-foreground">
          Link tasks that contribute to achieving this goal for better project coordination
        </p>
        {availableTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks available to link.</p>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label>Due Date (Optional)</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchedDueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchedDueDate ? format(new Date(watchedDueDate), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchedDueDate ? new Date(watchedDueDate) : undefined}
              onSelect={(date) => {
                setValue('dueDate', date ? date.toISOString().split('T')[0] : '')
                setCalendarOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Set a target completion date to track deadlines and create urgency
        </p>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder="Add any additional context, strategies, or reminders for this goal"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Include strategies, obstacles to consider, or any other relevant information
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  )
}
