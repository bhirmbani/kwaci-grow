import { db } from '../db/index'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentBusinessId } from './businessContext'
import type { 
  Employee, 
  EmployeePocAssignment, 
  NewEmployee, 
  NewEmployeePocAssignment,
  EmployeeWithPocAssignments,
  EmployeePocAssignmentWithDetails,
  Branch
} from '../db/schema'

export class EmployeeService {
  /**
   * Get all employees for the current business
   */
  static async getAll(businessId?: string): Promise<Employee[]> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      return await db.employees
        .where('businessId')
        .equals(currentBusinessId)
        .sortBy('name')
    } catch (error) {
      console.error('EmployeeService.getAll() - Database error:', error)
      throw error
    }
  }

  /**
   * Get employee by ID
   */
  static async getById(id: string): Promise<Employee | undefined> {
    try {
      return await db.employees.get(id)
    } catch (error) {
      console.error('EmployeeService.getById() - Database error:', error)
      throw error
    }
  }

  /**
   * Get employee with POC assignments
   */
  static async getWithPocAssignments(id: string): Promise<EmployeeWithPocAssignments | null> {
    try {
      const employee = await db.employees.get(id)
      if (!employee) return null

      // Get POC assignments for this employee
      const pocAssignments = await db.employeePocAssignments
        .where('employeeId')
        .equals(id)
        .and(assignment => assignment.isActive)
        .toArray()

      // Get branch details for each assignment
      const assignmentsWithBranches = await Promise.all(
        pocAssignments.map(async (assignment) => {
          const branch = await db.branches.get(assignment.branchId)
          return {
            ...assignment,
            branch: branch!
          }
        })
      )

      return {
        ...employee,
        pocAssignments: assignmentsWithBranches.filter(a => a.branch),
        pocAssignmentCount: assignmentsWithBranches.length
      }
    } catch (error) {
      console.error('EmployeeService.getWithPocAssignments() - Database error:', error)
      throw error
    }
  }

  /**
   * Create a new employee
   */
  static async create(data: NewEmployee): Promise<Employee> {
    try {
      const currentBusinessId = getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // Check for duplicate company ID within the business
      const existingEmployee = await db.employees
        .where('[businessId+companyIdNumber]')
        .equals([currentBusinessId, data.companyIdNumber])
        .first()

      if (existingEmployee) {
        throw new Error(`Employee with company ID "${data.companyIdNumber}" already exists in this business.`)
      }

      const now = new Date().toISOString()
      const employee: Employee = {
        id: uuidv4(),
        businessId: currentBusinessId,
        ...data,
        createdAt: now,
        updatedAt: now,
      }

      await db.employees.add(employee)
      return employee
    } catch (error) {
      console.error('EmployeeService.create() - Database error:', error)
      throw error
    }
  }

  /**
   * Update an employee
   */
  static async update(id: string, data: Partial<NewEmployee>): Promise<void> {
    try {
      const currentBusinessId = getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // If updating company ID, check for duplicates
      if (data.companyIdNumber) {
        const existingEmployee = await db.employees
          .where('[businessId+companyIdNumber]')
          .equals([currentBusinessId, data.companyIdNumber])
          .and(emp => emp.id !== id)
          .first()

        if (existingEmployee) {
          throw new Error(`Employee with company ID "${data.companyIdNumber}" already exists in this business.`)
        }
      }

      const now = new Date().toISOString()
      await db.employees.update(id, {
        ...data,
        updatedAt: now,
      })
    } catch (error) {
      console.error('EmployeeService.update() - Database error:', error)
      throw error
    }
  }

  /**
   * Delete an employee
   */
  static async delete(id: string): Promise<void> {
    try {
      // First, deactivate all POC assignments for this employee
      const pocAssignments = await db.employeePocAssignments
        .where('employeeId')
        .equals(id)
        .toArray()

      await Promise.all(
        pocAssignments.map(assignment =>
          db.employeePocAssignments.update(assignment.id, { isActive: false })
        )
      )

      // Then delete the employee
      await db.employees.delete(id)
    } catch (error) {
      console.error('EmployeeService.delete() - Database error:', error)
      throw error
    }
  }

  /**
   * Get all POC assignments for the current business
   */
  static async getAllPocAssignments(businessId?: string): Promise<EmployeePocAssignmentWithDetails[]> {
    try {
      const currentBusinessId = businessId || getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      const assignments = await db.employeePocAssignments
        .where('businessId')
        .equals(currentBusinessId)
        .and(assignment => assignment.isActive)
        .toArray()

      // Get employee and branch details for each assignment
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const [employee, branch] = await Promise.all([
            db.employees.get(assignment.employeeId),
            db.branches.get(assignment.branchId)
          ])

          return {
            ...assignment,
            employee: employee!,
            branch: branch!
          }
        })
      )

      return assignmentsWithDetails
        .filter(a => a.employee && a.branch)
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name))
    } catch (error) {
      console.error('EmployeeService.getAllPocAssignments() - Database error:', error)
      throw error
    }
  }

  /**
   * Create a POC assignment
   */
  static async createPocAssignment(data: NewEmployeePocAssignment): Promise<EmployeePocAssignment> {
    try {
      const currentBusinessId = getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      // Check if assignment already exists and is active
      const existingAssignment = await db.employeePocAssignments
        .where('[businessId+employeeId]')
        .equals([currentBusinessId, data.employeeId])
        .and(assignment => assignment.branchId === data.branchId && assignment.isActive)
        .first()

      if (existingAssignment) {
        throw new Error('This employee is already assigned as POC for this branch.')
      }

      const now = new Date().toISOString()
      const assignment: EmployeePocAssignment = {
        id: uuidv4(),
        businessId: currentBusinessId,
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }

      await db.employeePocAssignments.add(assignment)
      return assignment
    } catch (error) {
      console.error('EmployeeService.createPocAssignment() - Database error:', error)
      throw error
    }
  }

  /**
   * Remove a POC assignment (soft delete)
   */
  static async removePocAssignment(id: string): Promise<void> {
    try {
      const now = new Date().toISOString()
      await db.employeePocAssignments.update(id, {
        isActive: false,
        updatedAt: now,
      })
    } catch (error) {
      console.error('EmployeeService.removePocAssignment() - Database error:', error)
      throw error
    }
  }

  /**
   * Get POC assignments for a specific branch
   */
  static async getBranchPocAssignments(branchId: string): Promise<EmployeePocAssignmentWithDetails[]> {
    try {
      const currentBusinessId = getCurrentBusinessId()
      if (!currentBusinessId) {
        throw new Error('No business selected. Please select a business first.')
      }

      const assignments = await db.employeePocAssignments
        .where('[businessId+branchId]')
        .equals([currentBusinessId, branchId])
        .and(assignment => assignment.isActive)
        .toArray()

      // Get employee details for each assignment
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const [employee, branch] = await Promise.all([
            db.employees.get(assignment.employeeId),
            db.branches.get(assignment.branchId)
          ])

          return {
            ...assignment,
            employee: employee!,
            branch: branch!
          }
        })
      )

      return assignmentsWithDetails
        .filter(a => a.employee && a.branch)
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name))
    } catch (error) {
      console.error('EmployeeService.getBranchPocAssignments() - Database error:', error)
      throw error
    }
  }
}
