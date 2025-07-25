import { db } from '../db'
import { type RecurringExpense, type NewRecurringExpense } from '../db/schema'

export class RecurringExpensesService {
  // Get all recurring expenses
  static async getAll(businessId?: string): Promise<RecurringExpense[]> {
    try {
      if (businessId) {
        // Use where().equals().toArray() and sort in JavaScript
        const expenses = await db.recurringExpenses.where('businessId').equals(businessId).toArray()
        // Sort by createdAt in JavaScript
        return expenses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } else {
        return await db.recurringExpenses
          .orderBy('createdAt')
          .toArray()
      }
    } catch (error) {
      console.error('Failed to get all recurring expenses:', error)
      if (error instanceof Error && error.message.includes('IDBKeyRange')) {
        throw new Error('Database schema error: Please reset the database to fix this issue.')
      }
      throw error
    }
  }

  // Get active recurring expenses only
  static async getActive(businessId?: string): Promise<RecurringExpense[]> {
    try {
      // Use business-aware getAll and then filter for active
      const allExpenses = await this.getAll(businessId)
      return allExpenses.filter(expense => expense.isActive)
    } catch (error) {
      console.error('Failed to get active recurring expenses:', error)
      if (error instanceof Error && error.message.includes('IDBKeyRange')) {
        throw new Error('Database schema error: Please reset the database to fix this issue.')
      }
      throw error
    }
  }

  // Get recurring expenses by category
  static async getByCategory(category: string, businessId?: string): Promise<RecurringExpense[]> {
    try {
      // Use business-aware getActive and then filter by category
      const activeExpenses = await this.getActive(businessId)
      return activeExpenses.filter(expense => expense.category === category)
    } catch (error) {
      console.error('Failed to get recurring expenses by category:', error)
      throw error
    }
  }

  // Get recurring expenses by frequency
  static async getByFrequency(frequency: 'monthly' | 'yearly', businessId?: string): Promise<RecurringExpense[]> {
    try {
      // Use business-aware getActive and then filter by frequency
      const activeExpenses = await this.getActive(businessId)
      return activeExpenses.filter(expense => expense.frequency === frequency)
    } catch (error) {
      console.error('Failed to get recurring expenses by frequency:', error)
      throw error
    }
  }

  // Get a single recurring expense by ID
  static async getById(id: string): Promise<RecurringExpense | undefined> {
    return await db.recurringExpenses.get(id)
  }

  // Create a new recurring expense
  static async create(expense: NewRecurringExpense): Promise<RecurringExpense> {
    const now = new Date().toISOString()
    const newExpense: RecurringExpense = {
      ...expense,
      createdAt: now,
      updatedAt: now,
    }

    await db.recurringExpenses.put(newExpense)

    // Return the created expense
    const created = await this.getById(expense.id)
    if (!created) {
      throw new Error('Failed to create recurring expense')
    }

    return created
  }

  // Update an existing recurring expense
  static async update(id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>): Promise<RecurringExpense> {
    const now = new Date().toISOString()

    await db.recurringExpenses.update(id, {
      ...updates,
      updatedAt: now,
    })

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('Recurring expense not found')
    }

    return updated
  }

  // Delete a recurring expense (hard delete)
  static async delete(id: string): Promise<void> {
    await db.recurringExpenses.delete(id)
  }

  // Soft delete a recurring expense (set isActive to false)
  static async softDelete(id: string): Promise<RecurringExpense> {
    return await this.update(id, { isActive: false })
  }

  // Restore a soft-deleted recurring expense
  static async restore(id: string): Promise<RecurringExpense> {
    return await this.update(id, { isActive: true })
  }

  // Get all unique categories
  static async getCategories(businessId?: string): Promise<string[]> {
    const expenses = await this.getActive(businessId)
    const categories = [...new Set(expenses.map(expense => expense.category))]
    return categories.sort()
  }

  // Calculate monthly total for all active expenses
  static async getMonthlyTotal(businessId?: string): Promise<number> {
    const expenses = await this.getActive(businessId)
    return expenses.reduce((total, expense) => {
      if (expense.frequency === 'monthly') {
        return total + expense.amount
      } else if (expense.frequency === 'yearly') {
        return total + (expense.amount / 12)
      }
      return total
    }, 0)
  }

  // Calculate yearly total for all active expenses
  static async getYearlyTotal(businessId?: string): Promise<number> {
    const expenses = await this.getActive(businessId)
    return expenses.reduce((total, expense) => {
      if (expense.frequency === 'monthly') {
        return total + (expense.amount * 12)
      } else if (expense.frequency === 'yearly') {
        return total + expense.amount
      }
      return total
    }, 0)
  }

  // Get totals by category
  static async getTotalsByCategory(businessId?: string): Promise<{ category: string; monthly: number; yearly: number }[]> {
    const expenses = await this.getActive(businessId)
    const categoryTotals = new Map<string, { monthly: number; yearly: number }>()

    expenses.forEach(expense => {
      const existing = categoryTotals.get(expense.category) || { monthly: 0, yearly: 0 }

      if (expense.frequency === 'monthly') {
        existing.monthly += expense.amount
        existing.yearly += expense.amount * 12
      } else if (expense.frequency === 'yearly') {
        existing.monthly += expense.amount / 12
        existing.yearly += expense.amount
      }

      categoryTotals.set(expense.category, existing)
    })

    return Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      ...totals
    })).sort((a, b) => a.category.localeCompare(b.category))
  }

  // Get expenses that are currently active (within date range)
  static async getCurrentlyActiveExpenses(businessId?: string): Promise<RecurringExpense[]> {
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format

    // Use business-aware getActive and then filter by date range
    const activeExpenses = await this.getActive(businessId)
    return activeExpenses.filter(expense => {
      const startDate = expense.startDate
      const endDate = expense.endDate

      // Check if expense is within its active date range
      const isAfterStart = today >= startDate
      const isBeforeEnd = !endDate || today <= endDate

      return isAfterStart && isBeforeEnd
    })
  }

  // Bulk operations
  static async bulkCreate(expenses: NewRecurringExpense[]): Promise<RecurringExpense[]> {
    const now = new Date().toISOString()
    const newExpenses: RecurringExpense[] = expenses.map(expense => ({
      ...expense,
      createdAt: now,
      updatedAt: now,
    }))

    await db.recurringExpenses.bulkPut(newExpenses)

    // Return the created expenses
    const ids = newExpenses.map(expense => expense.id)
    return await db.recurringExpenses.where('id').anyOf(ids).toArray()
  }

  static async bulkUpdate(updates: Array<{ id: string; updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>> }>): Promise<void> {
    const now = new Date().toISOString()

    await db.transaction('rw', db.recurringExpenses, async () => {
      for (const { id, updates: updateData } of updates) {
        await db.recurringExpenses.update(id, {
          ...updateData,
          updatedAt: now,
        })
      }
    })
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    await db.recurringExpenses.bulkDelete(ids)
  }

  static async bulkSoftDelete(ids: string[]): Promise<void> {
    const now = new Date().toISOString()
    
    await db.transaction('rw', db.recurringExpenses, async () => {
      for (const id of ids) {
        await db.recurringExpenses.update(id, {
          isActive: false,
          updatedAt: now,
        })
      }
    })
  }
}
