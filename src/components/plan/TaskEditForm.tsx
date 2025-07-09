import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'
import type { PlanTask } from '@/lib/db/planningSchema'
import { TASK_TYPE_DISPLAY_MAP } from '@/lib/utils/taskUtils'

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  category: z.enum(['setup', 'production', 'sales', 'inventory', 'maintenance', 'training']),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute'),
  dependencies: z.array(z.string()).default([]),
  taskType: z.enum(['warehouse-batches', 'ingredient-purchases', 'production-batches', 'sales-records', 'product-creation']).optional(),
  note: z.string().default('')
})

type TaskFormData = z.infer<typeof taskFormSchema>

interface TaskEditFormProps {
  task: PlanTask
  allTasks: PlanTask[]
  onSubmit: (updates: Partial<PlanTask>) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function TaskEditForm({ 
  task,
  allTasks,
  onSubmit, 
  onCancel, 
  isSubmitting 
}: TaskEditFormProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      dependencies: task.dependencies,
      taskType: task.taskType,
      note: task.note
    }
  })

  const handleSubmit = async (data: TaskFormData) => {
    const updates: Partial<PlanTask> = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    await onSubmit(updates)
  }

  // Prepare dependency options (exclude current task to prevent circular dependencies)
  const dependencyOptions = allTasks
    .filter(t => t.id !== task.id)
    .map(task => ({
      value: task.id,
      label: task.title
    }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Primary Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter task title..." 
                    {...field}
                    autoFocus
                  />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what needs to be done..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expandable Advanced Options */}
        <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 p-0 h-auto">
              {showAdvancedOptions ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Settings className="h-4 w-4" />
              More Options
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="setup">Setup</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Duration */}
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Task Type */}
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type (Optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Object.entries(TASK_TYPE_DISPLAY_MAP).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dependencies */}
            {dependencyOptions.length > 0 && (
              <FormField
                control={form.control}
                name="dependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependencies</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={dependencyOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select tasks that must be completed first..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes or details..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Task'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
