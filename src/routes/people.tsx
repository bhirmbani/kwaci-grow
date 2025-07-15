import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, UserCheck, Edit, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { toast } from 'sonner'
import { EmployeeForm } from '../components/people/EmployeeForm'
import { PocAssignmentSection } from '../components/people/PocAssignmentForm'
import { EmployeeService } from '../lib/services/employeeService'
import { useCurrentBusinessId } from '../lib/stores/businessStore'
import { formatCurrency } from '../utils/formatters'
import type { Employee } from '../lib/db/schema'

function PeoplePage() {
  const currentBusinessId = useCurrentBusinessId()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employeeSheetOpen, setEmployeeSheetOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load employees
  const loadEmployees = useCallback(async () => {
    if (!currentBusinessId) return
    
    try {
      setLoading(true)
      const data = await EmployeeService.getAll(currentBusinessId)
      setEmployees(data)
    } catch (error) {
      console.error('Failed to load employees:', error)
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [currentBusinessId])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleCreateEmployee = async (data: any) => {
    try {
      setIsSubmitting(true)
      await EmployeeService.create(data)
      await loadEmployees()
      setEmployeeSheetOpen(false)
      setEditingEmployee(undefined)
      toast.success('Employee created successfully')
    } catch (error) {
      console.error('Failed to create employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create employee')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateEmployee = async (data: any) => {
    if (!editingEmployee) return
    
    try {
      setIsSubmitting(true)
      await EmployeeService.update(editingEmployee.id, data)
      await loadEmployees()
      setEmployeeSheetOpen(false)
      setEditingEmployee(undefined)
      toast.success('Employee updated successfully')
    } catch (error) {
      console.error('Failed to update employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update employee')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setDeletingId(employeeId)
      await EmployeeService.delete(employeeId)
      await loadEmployees()
      toast.success('Employee deleted successfully')
    } catch (error) {
      console.error('Failed to delete employee:', error)
      toast.error('Failed to delete employee')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeSheetOpen(true)
  }

  const handleAddEmployee = () => {
    setEditingEmployee(undefined)
    setEmployeeSheetOpen(true)
  }

  const getEmploymentStatusBadge = (status: Employee['employmentStatus']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'Terminated':
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!currentBusinessId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
          <p className="text-muted-foreground">Please select a business to manage employees.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">People Management</h1>
          <p className="text-muted-foreground">
            Manage employees and point-of-contact assignments
          </p>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Employees
            </h2>
            <p className="text-muted-foreground">
              Manage employee information and details
            </p>
          </div>
          <Sheet open={employeeSheetOpen} onOpenChange={setEmployeeSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={handleAddEmployee}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </SheetTitle>
                <SheetDescription>
                  {editingEmployee 
                    ? 'Update employee information and details'
                    : 'Add a new employee with complete information'
                  }
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <EmployeeForm
                  employee={editingEmployee}
                  onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
                  onCancel={() => {
                    setEmployeeSheetOpen(false)
                    setEditingEmployee(undefined)
                  }}
                  isSubmitting={isSubmitting}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>
              All employees in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Add your first employee to get started.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{employee.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ID: {employee.companyIdNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{employee.position}</span>
                            {employee.jobLevel && (
                              <span className="text-sm text-muted-foreground">
                                {employee.jobLevel}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          {getEmploymentStatusBadge(employee.employmentStatus)}
                        </TableCell>
                        <TableCell>
                          {new Date(employee.hireDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {employee.salary ? formatCurrency(employee.salary) : 'Not specified'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              disabled={deletingId === employee.id}
                              className="text-destructive hover:text-destructive"
                            >
                              {deletingId === employee.id ? (
                                'Deleting...'
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* POC Assignment Section */}
      <div className="border-t pt-8">
        <div className="flex items-center gap-2 mb-6">
          <UserCheck className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Point of Contact Management</h2>
        </div>
        <PocAssignmentSection onRefresh={loadEmployees} />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/people')({
  component: PeoplePage,
})
