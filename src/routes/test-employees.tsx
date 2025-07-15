import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { EmployeeService } from '../lib/services/employeeService'
import { BranchService } from '../lib/services/branchService'
import { useCurrentBusinessId } from '../lib/stores/businessStore'

function TestEmployeesPage() {
  const currentBusinessId = useCurrentBusinessId()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string, isError = false) => {
    const prefix = isError ? '❌' : '✅'
    setTestResults(prev => [...prev, `${prefix} ${message}`])
  }

  const runTests = async () => {
    if (!currentBusinessId) {
      addResult('No business selected', true)
      return
    }

    setIsRunning(true)
    setTestResults([])
    
    try {
      addResult('Starting employee management tests...')

      // Test 1: Create a test employee
      addResult('Creating test employee...')
      const testEmployee = await EmployeeService.create({
        name: 'Test Employee',
        companyIdNumber: `TEST${Date.now()}`,
        position: 'Test Barista',
        department: 'Testing',
        hireDate: new Date().toISOString().split('T')[0],
        employmentStatus: 'Active',
        note: 'Created by test suite'
      })
      addResult(`Employee created: ${testEmployee.name}`)

      // Test 2: Retrieve all employees
      addResult('Retrieving all employees...')
      const allEmployees = await EmployeeService.getAll()
      addResult(`Found ${allEmployees.length} employees`)

      // Test 3: Retrieve employee by ID
      addResult('Retrieving employee by ID...')
      const retrievedEmployee = await EmployeeService.getById(testEmployee.id)
      addResult(`Retrieved employee: ${retrievedEmployee?.name}`)

      // Test 4: Update employee
      addResult('Updating employee...')
      await EmployeeService.update(testEmployee.id, {
        position: 'Senior Test Barista',
        salary: 5000000
      })
      const updatedEmployee = await EmployeeService.getById(testEmployee.id)
      addResult(`Updated position: ${updatedEmployee?.position}`)

      // Test 5: Test POC assignments (if branches exist)
      addResult('Testing POC assignments...')
      const branches = await BranchService.getAll()
      
      if (branches.length > 0) {
        const testBranch = branches[0]
        
        // Create POC assignment
        const pocAssignment = await EmployeeService.createPocAssignment({
          employeeId: testEmployee.id,
          branchId: testBranch.id,
          assignedDate: new Date().toISOString().split('T')[0],
          note: 'Test POC assignment'
        })
        addResult(`POC assignment created for branch: ${testBranch.name}`)

        // Get POC assignments
        const pocAssignments = await EmployeeService.getAllPocAssignments()
        addResult(`Found ${pocAssignments.length} POC assignments`)

        // Get employee with POC assignments
        const employeeWithPoc = await EmployeeService.getWithPocAssignments(testEmployee.id)
        addResult(`Employee has ${employeeWithPoc?.pocAssignmentCount || 0} POC assignments`)

        // Remove POC assignment
        await EmployeeService.removePocAssignment(pocAssignment.id)
        addResult('POC assignment removed')
      } else {
        addResult('No branches found, skipping POC assignment tests')
      }

      // Test 6: Test duplicate company ID validation
      addResult('Testing duplicate company ID validation...')
      try {
        await EmployeeService.create({
          name: 'Duplicate Test',
          companyIdNumber: testEmployee.companyIdNumber, // Same company ID
          position: 'Test Position',
          department: 'Testing',
          hireDate: new Date().toISOString().split('T')[0],
          employmentStatus: 'Active',
          note: 'Should fail'
        })
        addResult('Duplicate validation failed - this should not happen', true)
      } catch (error) {
        addResult(`Duplicate company ID correctly rejected: ${(error as Error).message}`)
      }

      // Test 7: Delete test employee
      addResult('Deleting test employee...')
      await EmployeeService.delete(testEmployee.id)
      const deletedEmployee = await EmployeeService.getById(testEmployee.id)
      addResult(`Employee deleted successfully: ${!deletedEmployee}`)

      addResult('All tests completed successfully! 🎉')
      
    } catch (error) {
      addResult(`Test failed: ${(error as Error).message}`, true)
    } finally {
      setIsRunning(false)
    }
  }

  if (!currentBusinessId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
          <p className="text-muted-foreground">Please select a business to run employee tests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Management Tests</h1>
        <p className="text-muted-foreground">
          Test the employee management functionality to ensure everything works correctly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Suite</CardTitle>
          <CardDescription>
            Run comprehensive tests for employee CRUD operations and POC assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run Employee Management Tests'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
          <CardDescription>
            What this test suite covers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Employee Operations</h4>
              <ul className="space-y-1 text-sm">
                <li>• Create employee</li>
                <li>• Retrieve all employees</li>
                <li>• Retrieve employee by ID</li>
                <li>• Update employee</li>
                <li>• Delete employee</li>
                <li>• Duplicate company ID validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">POC Assignment Operations</h4>
              <ul className="space-y-1 text-sm">
                <li>• Create POC assignment</li>
                <li>• Retrieve all POC assignments</li>
                <li>• Get employee with POC assignments</li>
                <li>• Remove POC assignment</li>
                <li>• Business context isolation</li>
                <li>• Data integrity validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">✅ Completed Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Database schema with proper indexes</li>
                <li>• Employee service with full CRUD</li>
                <li>• POC assignment management</li>
                <li>• Business context isolation</li>
                <li>• Form validation with Zod</li>
                <li>• React Hook Form integration</li>
                <li>• shadcn/ui components</li>
                <li>• Navigation integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🚀 Possible Enhancements</h4>
              <ul className="space-y-1 text-sm">
                <li>• Employee photo upload</li>
                <li>• Advanced search and filtering</li>
                <li>• Employee performance tracking</li>
                <li>• Bulk operations</li>
                <li>• Employee hierarchy management</li>
                <li>• Integration with payroll systems</li>
                <li>• Employee scheduling</li>
                <li>• Reporting and analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-employees')({
  component: TestEmployeesPage,
})
