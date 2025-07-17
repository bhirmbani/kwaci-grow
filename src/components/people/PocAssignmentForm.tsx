import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, Trash2, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Textarea } from '../ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { cn } from '@/lib/utils'
import { EmployeeService } from '@/lib/services/employeeService'
import { BranchService } from '@/lib/services/branchService'
import type { Employee, Branch, EmployeePocAssignmentWithDetails } from '@/lib/db/schema'

// Form validation schema
const pocAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  branchId: z.string().min(1, 'Branch is required'),
  assignedDate: z.string().min(1, 'Assignment date is required'),
  note: z.string()
    .max(500, 'Note must be less than 500 characters')
    .optional(),
})

type PocAssignmentFormData = z.infer<typeof pocAssignmentSchema>

interface PocAssignmentFormProps {
  onSubmit: (data: PocAssignmentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function PocAssignmentForm({ onSubmit, onCancel, isSubmitting = false }: PocAssignmentFormProps) {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [employeeComboOpen, setEmployeeComboOpen] = useState(false)
  const [branchComboOpen, setBranchComboOpen] = useState(false)

  const form = useForm<PocAssignmentFormData>({
    resolver: zodResolver(pocAssignmentSchema),
    defaultValues: {
      employeeId: '',
      branchId: '',
      assignedDate: format(new Date(), 'yyyy-MM-dd'),
      note: '',
    },
  })

  // Load employees and branches
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, branchesData] = await Promise.all([
          EmployeeService.getAll(),
          BranchService.getAll()
        ])
        
        // Filter only active employees
        const activeEmployees = employeesData.filter(emp => emp.employmentStatus === 'Active')
        setEmployees(activeEmployees)
        setBranches(branchesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (data: PocAssignmentFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Failed to submit POC assignment:', error)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">{t('people.forms.poc.loading')}</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('people.forms.poc.title')}</h3>
          
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('people.forms.poc.fields.employee')}</FormLabel>
                <Popover open={employeeComboOpen} onOpenChange={setEmployeeComboOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? employees.find((employee) => employee.id === field.value)?.name
                          : t('people.forms.poc.selectEmployee')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('people.forms.poc.placeholders.searchEmployees')} />
                      <CommandList>
                        <CommandEmpty>{t('people.forms.poc.noEmployee')}</CommandEmpty>
                        <CommandGroup>
                          {employees.map((employee) => (
                            <CommandItem
                              value={employee.name}
                              key={employee.id}
                              onSelect={() => {
                                field.onChange(employee.id)
                                setEmployeeComboOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  employee.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{employee.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {employee.position} - {employee.department}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('people.forms.poc.fields.branch')}</FormLabel>
                <Popover open={branchComboOpen} onOpenChange={setBranchComboOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? branches.find((branch) => branch.id === field.value)?.name
                          : t('people.forms.poc.selectBranch')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('people.forms.poc.placeholders.searchBranches')} />
                      <CommandList>
                        <CommandEmpty>{t('people.forms.poc.noBranch')}</CommandEmpty>
                        <CommandGroup>
                          {branches.map((branch) => (
                            <CommandItem
                              value={branch.name}
                              key={branch.id}
                              onSelect={() => {
                                field.onChange(branch.id)
                                setBranchComboOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  branch.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{branch.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {branch.location}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('people.forms.poc.fields.assignedDate')}</FormLabel>
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
                          <span>{t('people.forms.poc.pickDate')}</span>
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
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('people.forms.poc.placeholders.notes')}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('people.forms.poc.buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('people.forms.poc.buttons.assigning')
              : t('people.forms.poc.buttons.assign')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// POC Assignment Management Component
interface PocAssignmentManagerProps {
  assignments: EmployeePocAssignmentWithDetails[]
  onRemoveAssignment: (assignmentId: string) => Promise<void>
  onRefresh: () => void
  isLoading?: boolean
}

export function PocAssignmentManager({
  assignments,
  onRemoveAssignment,
  onRefresh,
  isLoading = false
}: PocAssignmentManagerProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      setRemovingId(assignmentId)
      await onRemoveAssignment(assignmentId)
      onRefresh()
    } catch (error) {
      console.error('Failed to remove POC assignment:', error)
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">{t('people.poc.manager.loading')}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('people.poc.managerTitle')}</CardTitle>
        <CardDescription>
          {t('people.poc.managerDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('people.poc.noAssignments')}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('people.poc.table.employee')}</TableHead>
                  <TableHead>{t('people.poc.table.position')}</TableHead>
                  <TableHead>{t('people.poc.table.branch')}</TableHead>
                  <TableHead>{t('people.poc.table.date')}</TableHead>
                  <TableHead>{t('people.poc.table.notes')}</TableHead>
                  <TableHead className="w-[100px]">{t('people.poc.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{assignment.employee.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {assignment.employee.companyIdNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{assignment.employee.position}</span>
                        <span className="text-sm text-muted-foreground">
                          {assignment.employee.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{assignment.branch.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {assignment.branch.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(assignment.assignedDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {assignment.note || 'No notes'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        disabled={removingId === assignment.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {removingId === assignment.id ? (
                          t('people.poc.manager.removing')
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Combined POC Assignment Section Component
interface PocAssignmentSectionProps {
  onRefresh: () => void
}

export function PocAssignmentSection({ onRefresh }: PocAssignmentSectionProps) {
  const [assignments, setAssignments] = useState<EmployeePocAssignmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Load POC assignments
  const loadAssignments = async () => {
    try {
      setLoading(true)
      const data = await EmployeeService.getAllPocAssignments()
      setAssignments(data)
    } catch (error) {
      console.error('Failed to load POC assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  const handleCreateAssignment = async (data: any) => {
    try {
      setIsSubmitting(true)
      await EmployeeService.createPocAssignment(data)
      await loadAssignments()
      onRefresh()
      setSheetOpen(false)
    } catch (error) {
      console.error('Failed to create POC assignment:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    await EmployeeService.removePocAssignment(assignmentId)
    await loadAssignments()
    onRefresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('people.poc.sectionTitle')}</h2>
          <p className="text-muted-foreground">
            {t('people.poc.description')}
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('people.poc.assignButton')}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t('people.poc.sheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('people.poc.sheetDescription')}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <PocAssignmentForm
                onSubmit={handleCreateAssignment}
                onCancel={() => setSheetOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <PocAssignmentManager
        assignments={assignments}
        onRemoveAssignment={handleRemoveAssignment}
        onRefresh={loadAssignments}
        isLoading={loading}
      />
    </div>
  )
}
