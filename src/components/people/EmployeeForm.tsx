import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          <h3 className="text-lg font-medium">{t('people.forms.employee.sections.personal')}</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('people.forms.employee.fields.fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('people.forms.employee.placeholders.fullName')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.companyIdNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.companyIdNumber')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.nationalIdNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.nationalIdNumber')} {...field} />
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
                <FormLabel>{t('people.forms.employee.fields.dateOfBirth')}</FormLabel>
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
                          <span>{t('people.forms.employee.pickDate')}</span>
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
          <h3 className="text-lg font-medium">{t('people.forms.employee.sections.professional')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('people.forms.employee.fields.position')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.position')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.department')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.department')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.jobLevel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.jobLevel')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.salary')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('people.forms.employee.placeholders.salary')}
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
                <FormLabel>{t('people.forms.employee.fields.hireDate')}</FormLabel>
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
                          <span>{t('people.forms.employee.pickDate')}</span>
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
                <FormLabel>{t('people.forms.employee.fields.employmentStatus')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('people.forms.employee.fields.employmentStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">{t('people.employees.badges.active')}</SelectItem>
                    <SelectItem value="Inactive">{t('people.employees.badges.inactive')}</SelectItem>
                    <SelectItem value="Terminated">{t('people.employees.badges.terminated')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('people.forms.employee.sections.contact')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('people.forms.employee.fields.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('people.forms.employee.placeholders.phone')} {...field} />
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
                  <FormLabel>{t('people.forms.employee.fields.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('people.forms.employee.placeholders.email')} {...field} />
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
              <FormLabel>{t('people.forms.employee.fields.note')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('people.forms.employee.placeholders.note')}
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
            {t('people.forms.employee.buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('people.forms.employee.buttons.saving')
              : isEditing
                ? t('people.forms.employee.buttons.update')
                : t('people.forms.employee.buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
