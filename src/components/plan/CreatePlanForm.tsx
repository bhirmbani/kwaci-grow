import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { PlanningService } from '@/lib/services/planningService'
import { PlanTemplateService } from '@/lib/services/planTemplateService'
import { BranchService } from '@/lib/services/branchService'
import type { Branch } from '@/lib/db/schema'
import type { PlanTemplate } from '@/lib/db/planningSchema'

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Plan name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  type: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  branchId: z.string().optional(),
  templateId: z.string().optional(),
  note: z.string().max(1000, 'Note must be less than 1000 characters').optional(),
  useTemplate: z.boolean(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end >= start
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"]
})

type CreatePlanData = z.infer<typeof createPlanSchema>

interface CreatePlanFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreatePlanForm({ onSuccess, onCancel }: CreatePlanFormProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [templates, setTemplates] = useState<PlanTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useForm<CreatePlanData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      branchId: 'no-branch',
      templateId: 'no-templates',
      note: '',
      useTemplate: false,
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch, setValue, register } = form
  const useTemplate = watch('useTemplate')
  const selectedTemplateId = watch('templateId')
  const planType = watch('type')

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesData, templatesData] = await Promise.all([
          BranchService.getAll(),
          PlanTemplateService.getAllTemplates()
        ])

        setBranches(branchesData.filter(branch => branch.isActive))
        setTemplates(templatesData)
      } catch (error) {
        console.error('Failed to load form data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Update selected template when templateId changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId)
      setSelectedTemplate(template || null)
      
      // Auto-populate fields from template
      if (template) {
        setValue('type', template.type)
        if (!watch('name')) {
          setValue('name', `${template.name} - ${format(new Date(), 'MMM dd, yyyy')}`)
        }
        if (!watch('description')) {
          setValue('description', template.description)
        }
      }
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId, templates, setValue, watch])

  // Filter templates by selected plan type
  const filteredTemplates = templates.filter(template => template.type === planType)

  const onSubmit = async (data: CreatePlanData) => {
    try {
      // Handle special values for branch selection
      const branchId = data.branchId === 'no-branch' ? undefined : data.branchId || undefined

      if (data.useTemplate && data.templateId && data.templateId !== 'no-templates') {
        // Create plan from template
        await PlanTemplateService.createPlanFromTemplate(data.templateId, {
          name: data.name.trim(),
          description: data.description.trim(),
          startDate: data.startDate,
          endDate: data.endDate,
          branchId,
          note: data.note?.trim() || '',
        })
      } else {
        // Create plan from scratch
        await PlanningService.createPlan({
          name: data.name.trim(),
          description: data.description.trim(),
          type: data.type,
          status: 'draft',
          startDate: data.startDate,
          endDate: data.endDate,
          branchId,
          templateId: undefined,
          note: data.note?.trim() || '',
        })
      }

      // Reset form and close
      reset()
      onSuccess()
    } catch (error) {
      console.error('Failed to create plan:', error)
      // TODO: Add toast notification for better user feedback
      alert('Failed to create plan. Please try again.')
    }
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="h-4 w-4 text-blue-500" />
      case 'weekly': return <Calendar className="h-4 w-4 text-green-500" />
      case 'monthly': return <TrendingUp className="h-4 w-4 text-purple-500" />
      default: return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600'
      case 'intermediate': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading form data...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error?.message}</div>
          ))}
        </div>
      )}

      {/* Template Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="useTemplate"
          checked={useTemplate}
          onCheckedChange={(checked) => {
            setValue('useTemplate', checked)
            if (!checked) {
              setValue('templateId', 'no-templates')
              setSelectedTemplate(null)
            }
          }}
        />
        <Label htmlFor="useTemplate">Create from template</Label>
      </div>

      {/* Plan Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Plan Type *</Label>
        <Select
          value={planType}
          onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select plan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily Plan</SelectItem>
            <SelectItem value="weekly">Weekly Plan</SelectItem>
            <SelectItem value="monthly">Monthly Plan</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Template Selection */}
      {useTemplate && (
        <div className="space-y-4">
          {filteredTemplates.length === 0 && (
            <div className="p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
              No {planType} templates are available. You can create a plan from scratch or change the plan type.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="templateId">Select Template *</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={(value) => setValue('templateId', value)}
              disabled={filteredTemplates.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={filteredTemplates.length > 0 ? "Choose a template" : "No templates available"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {getTemplateIcon(template.type)}
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-templates" disabled>
                    No {planType} templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {useTemplate && (!selectedTemplateId || selectedTemplateId === 'no-templates') && (
              <p className="text-sm text-red-600">Please select a template</p>
            )}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getTemplateIcon(selectedTemplate.type)}
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedTemplate.type.charAt(0).toUpperCase() + selectedTemplate.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                    {selectedTemplate.difficulty.charAt(0).toUpperCase() + selectedTemplate.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Estimated duration: {Math.round(selectedTemplate.estimatedDuration / 60)}h
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plan Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name *</Label>
        <Input
          id="name"
          placeholder="Enter plan name"
          {...register('name')}
        />
        <p className="text-xs text-muted-foreground">
          A descriptive name for your operational plan
        </p>
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose and goals of this plan"
          rows={3}
          {...register('description')}
        />
        <p className="text-xs text-muted-foreground">
          Explain what this plan aims to achieve
        </p>
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Branch Selection */}
      <div className="space-y-2">
        <Label htmlFor="branchId">Branch (Optional)</Label>
        <Select
          value={watch('branchId')}
          onValueChange={(value) => setValue('branchId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-branch">No specific branch</SelectItem>
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
        <p className="text-xs text-muted-foreground">
          Assign this plan to a specific branch or leave blank for all branches
        </p>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Additional Notes (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Any additional information or context for this plan"
          rows={2}
          {...register('note')}
        />
        {errors.note && (
          <p className="text-sm text-red-600">{errors.note.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (useTemplate && (!selectedTemplateId || selectedTemplateId === 'no-templates' || filteredTemplates.length === 0))}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Plan
        </Button>
      </div>
    </form>
  )
}
