import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { cn } from '@/lib/utils'
import type { Employee } from '@/lib/db/schema'

// Form validation schema
const employeeFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  companyIdNumber: z.string()
    .min(1, 'Company ID number is required')
    .max(50, 'Company ID must be less than 50 characters'),
  nationalIdNumber: z.string()
    .max(50, 'National ID must be less than 50 characters')
    .optional(),
  dateOfBirth: z.string().optional(),
  position: z.string()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  department: z.string()
    .min(1, 'Department is required')
    .max(100, 'Department must be less than 100 characters'),
  jobLevel: z.string()
    .max(50, 'Job level must be less than 50 characters')
    .optional(),
  salary: z.number()
    .min(0, 'Salary must be non-negative')
    .optional(),
  phone: z.string()
    .max(20, 'Phone must be less than 20 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  hireDate: z.string().min(1, 'Hire date is required'),
  employmentStatus: z.enum(['Active', 'Inactive', 'Terminated']).default('Active'),
  note: z.string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
})

type EmployeeFormData = z.infer<typeof employeeFormSchema>

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function EmployeeForm({ employee, onSubmit, onCancel, isSubmitting = false }: EmployeeFormProps) {
  const [dobCalendarOpen, setDobCalendarOpen] = useState(false)
  const [hireDateCalendarOpen, setHireDateCalendarOpen] = useState(false)
  const isEditing = !!employee

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name || '',
      companyIdNumber: employee?.companyIdNumber || '',
      nationalIdNumber: employee?.nationalIdNumber || '',
      dateOfBirth: employee?.dateOfBirth || '',
      position: employee?.position || '',
      department: employee?.department || '',
      jobLevel: employee?.jobLevel || '',
      salary: employee?.salary || undefined,
      phone: employee?.phone || '',
      email: employee?.email || '',
      hireDate: employee?.hireDate || format(new Date(), 'yyyy-MM-dd'),
      employmentStatus: employee?.employmentStatus || 'Active',
      note: employee?.note || '',
    },
  })

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Failed to submit employee form:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company ID Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationalIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1234567890123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover open={dobCalendarOpen} onOpenChange={setDobCalendarOpen}>
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
                          <span>Pick a date</span>
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
                        setDobCalendarOpen(false)
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
        </div>

        {/* Professional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Professional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position/Job Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Barista, Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Operations, Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Junior, Senior, Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (IDR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 5000000" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hire Date *</FormLabel>
                <Popover open={hireDateCalendarOpen} onOpenChange={setHireDateCalendarOpen}>
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
                          <span>Pick a date</span>
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
                        setHireDateCalendarOpen(false)
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +62812345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., employee@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about the employee..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
