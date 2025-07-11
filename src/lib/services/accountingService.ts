/**
 * Accounting Service
 * 
 * Unified service that orchestrates all existing financial services to provide
 * a cohesive accounting interface. This service aggregates data from:
 * - FinancialItemsService (capital, fixed costs, variable costs)
 * - SalesRecordService (sales income)
 * - RecurringExpensesService (recurring operating expenses)
 * - FixedAssetService (asset purchases and depreciation)
 */

import { FinancialItemsService } from './financialItemsService'
import { SalesRecordService } from './salesRecordService'
import { RecurringExpensesService } from './recurringExpensesService'
import { FixedAssetService } from './fixedAssetService'
import { getCurrentBusinessId, requireBusinessId } from './businessContext'
import { FINANCIAL_ITEM_CATEGORIES } from '@/lib/db/schema'
import type {
  UnifiedTransaction,
  TransactionType,
  TransactionSource,
  TransactionStatus,
  FinancialSummary,
  TransactionFilters,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionListResponse
} from '@/lib/types/accounting'
import type {
  FinancialItem,
  SalesRecord,
  RecurringExpense,
  FixedAsset
} from '@/lib/db/schema'

export class AccountingService {
  /**
   * Get all transactions for a business, unified from all sources
   */
  static async getAllTransactions(
    businessId?: string,
    filters?: TransactionFilters
  ): Promise<UnifiedTransaction[]> {
    const currentBusinessId = businessId || requireBusinessId()
    
    try {
      // Fetch data from all sources in parallel
      const [
        financialItems,
        salesRecords,
        recurringExpenses,
        fixedAssets
      ] = await Promise.all([
        FinancialItemsService.getAll(currentBusinessId),
        SalesRecordService.getRecordsByBusiness(currentBusinessId),
        RecurringExpensesService.getAll(currentBusinessId),
        FixedAssetService.getAll(currentBusinessId)
      ])

      // Convert each source to unified transactions
      const transactions: UnifiedTransaction[] = [
        ...this.convertFinancialItems(financialItems),
        ...this.convertSalesRecords(salesRecords),
        ...this.convertRecurringExpenses(recurringExpenses),
        ...this.convertFixedAssets(fixedAssets)
      ]

      // Apply filters if provided
      let filteredTransactions = transactions
      if (filters) {
        filteredTransactions = this.applyFilters(transactions, filters)
      }

      // Sort by date (newest first)
      return filteredTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    } catch (error) {
      console.error('AccountingService.getAllTransactions() - Error:', error)
      throw error
    }
  }

  /**
   * Get transactions by type
   */
  static async getTransactionsByType(
    type: TransactionType,
    businessId?: string
  ): Promise<UnifiedTransaction[]> {
    const filters: TransactionFilters = { types: [type] }
    return this.getAllTransactions(businessId, filters)
  }

  /**
   * Get financial summary for a business
   */
  static async getFinancialSummary(
    businessId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<FinancialSummary> {
    const currentBusinessId = businessId || requireBusinessId()
    
    const filters: TransactionFilters = {
      businessId: currentBusinessId,
      dateRange
    }
    
    const transactions = await this.getAllTransactions(currentBusinessId, filters)
    
    return this.calculateFinancialSummary(transactions, currentBusinessId, dateRange)
  }

  /**
   * Convert FinancialItems to UnifiedTransactions
   */
  private static convertFinancialItems(items: FinancialItem[]): UnifiedTransaction[] {
    return items.map(item => {
      let type: TransactionType
      let status: TransactionStatus = 'COMPLETED'

      // Map category to transaction type
      switch (item.category) {
        case FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL:
          type = item.sourceAssetId ? 'ASSET_DEPRECIATION' : 'CAPITAL_INVESTMENT'
          break
        case FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS:
          type = 'FIXED_COST'
          break
        case FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS:
          type = 'VARIABLE_COST'
          break
        default:
          type = 'OPERATING_EXPENSE'
      }

      return {
        id: `fi_${item.id}`,
        businessId: item.businessId,
        type,
        category: item.category,
        status,
        amount: Math.abs(item.value),
        description: item.name,
        note: item.note,
        date: item.createdAt.split('T')[0], // Extract date part
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        sourceEntity: 'FinancialItem' as TransactionSource,
        sourceId: item.id,
        metadata: {
          baseUnitCost: item.baseUnitCost,
          baseUnitQuantity: item.baseUnitQuantity,
          usagePerCup: item.usagePerCup,
          unit: item.unit,
          isFixedAsset: item.isFixedAsset,
          sourceAssetId: item.sourceAssetId
        }
      }
    })
  }

  /**
   * Convert SalesRecords to UnifiedTransactions
   */
  private static convertSalesRecords(records: SalesRecord[]): UnifiedTransaction[] {
    return records.map(record => ({
      id: `sr_${record.id}`,
      businessId: record.businessId,
      type: 'SALES_INCOME' as TransactionType,
      category: 'Sales Revenue',
      status: 'COMPLETED' as TransactionStatus,
      amount: record.totalAmount,
      description: `Sale: ${record.quantity} units`,
      note: record.note,
      date: record.saleDate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      sourceEntity: 'SalesRecord' as TransactionSource,
      sourceId: record.id,
      metadata: {
        branchId: record.branchId,
        menuId: record.menuId,
        productId: record.productId,
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        saleTime: record.saleTime
      }
    }))
  }

  /**
   * Convert RecurringExpenses to UnifiedTransactions
   */
  private static convertRecurringExpenses(expenses: RecurringExpense[]): UnifiedTransaction[] {
    return expenses.map(expense => ({
      id: `re_${expense.id}`,
      businessId: expense.businessId,
      type: 'RECURRING_EXPENSE' as TransactionType,
      category: expense.category,
      status: expense.isActive ? 'RECURRING' as TransactionStatus : 'CANCELLED' as TransactionStatus,
      amount: expense.amount,
      description: expense.name,
      note: expense.note,
      date: expense.startDate,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      sourceEntity: 'RecurringExpense' as TransactionSource,
      sourceId: expense.id,
      metadata: {
        frequency: expense.frequency,
        startDate: expense.startDate,
        endDate: expense.endDate
      }
    }))
  }

  /**
   * Convert FixedAssets to UnifiedTransactions
   */
  private static convertFixedAssets(assets: FixedAsset[]): UnifiedTransaction[] {
    return assets.map(asset => ({
      id: `fa_${asset.id}`,
      businessId: asset.businessId,
      type: 'ASSET_PURCHASE' as TransactionType,
      category: asset.category,
      status: 'COMPLETED' as TransactionStatus,
      amount: asset.purchasePrice,
      description: asset.name,
      note: asset.note,
      date: asset.purchaseDate,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      sourceEntity: 'FixedAsset' as TransactionSource,
      sourceId: asset.id,
      metadata: {
        estimatedUsefulLifeYears: asset.estimatedUsefulLifeYears,
        depreciationMethod: 'straight-line'
      }
    }))
  }

  /**
   * Apply filters to transaction list
   */
  private static applyFilters(
    transactions: UnifiedTransaction[],
    filters: TransactionFilters
  ): UnifiedTransaction[] {
    return transactions.filter(transaction => {
      // Type filter
      if (filters.types && !filters.types.includes(transaction.type)) {
        return false
      }

      // Category filter
      if (filters.categories && !filters.categories.includes(transaction.category)) {
        return false
      }

      // Status filter
      if (filters.status && !filters.status.includes(transaction.status)) {
        return false
      }

      // Date range filter
      if (filters.dateRange) {
        const transactionDate = new Date(transaction.date)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        if (transactionDate < startDate || transactionDate > endDate) {
          return false
        }
      }

      // Amount range filter
      if (filters.amountRange) {
        if (transaction.amount < filters.amountRange.min || 
            transaction.amount > filters.amountRange.max) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesDescription = transaction.description.toLowerCase().includes(searchLower)
        const matchesNote = transaction.note?.toLowerCase().includes(searchLower)
        const matchesCategory = transaction.category.toLowerCase().includes(searchLower)
        
        if (!matchesDescription && !matchesNote && !matchesCategory) {
          return false
        }
      }

      // Source entity filter
      if (filters.sourceEntities && !filters.sourceEntities.includes(transaction.sourceEntity)) {
        return false
      }

      return true
    })
  }

  /**
   * Create a new transaction (routes to appropriate service)
   */
  static async createTransaction(data: CreateTransactionData): Promise<UnifiedTransaction> {
    const businessId = data.businessId || requireBusinessId()

    try {
      switch (data.type) {
        case 'SALES_INCOME':
          if (!data.metadata?.branchId || !data.metadata?.menuId || !data.metadata?.productId) {
            throw new Error('Sales income requires branchId, menuId, and productId in metadata')
          }

          const salesRecord = await SalesRecordService.createRecord({
            branchId: data.metadata.branchId,
            menuId: data.metadata.menuId,
            productId: data.metadata.productId,
            saleDate: data.date,
            saleTime: data.metadata.saleTime || '12:00:00',
            quantity: data.metadata.quantity || 1,
            unitPrice: data.metadata.unitPrice || data.amount,
            totalAmount: data.amount,
            note: data.note || '',
            businessId
          })

          return this.convertSalesRecords([salesRecord])[0]

        case 'RECURRING_EXPENSE':
          const recurringExpense = await RecurringExpensesService.create({
            name: data.description,
            description: data.description,
            amount: data.amount,
            frequency: data.metadata?.frequency || 'monthly',
            category: data.category,
            startDate: data.date,
            endDate: data.metadata?.endDate || '',
            note: data.note || '',
            businessId
          })

          return this.convertRecurringExpenses([recurringExpense])[0]

        case 'ASSET_PURCHASE':
          const fixedAsset = await FixedAssetService.create({
            name: data.description,
            category: data.category,
            purchasePrice: data.amount,
            purchaseDate: data.date,
            estimatedUsefulLifeYears: data.metadata?.estimatedUsefulLifeYears || 5,
            note: data.note || '',
            businessId
          })

          return this.convertFixedAssets([fixedAsset])[0]

        default:
          // For other types, create as FinancialItem
          let category: string
          switch (data.type) {
            case 'CAPITAL_INVESTMENT':
              category = FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL
              break
            case 'FIXED_COST':
              category = FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS
              break
            case 'VARIABLE_COST':
              category = FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS
              break
            default:
              category = 'operating_expense'
          }

          const financialItem = await FinancialItemsService.create({
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.description,
            value: data.amount,
            category: category as any,
            note: data.note || '',
            businessId,
            baseUnitCost: data.metadata?.baseUnitCost,
            baseUnitQuantity: data.metadata?.baseUnitQuantity,
            usagePerCup: data.metadata?.usagePerCup,
            unit: data.metadata?.unit,
            isFixedAsset: data.metadata?.isFixedAsset,
            estimatedUsefulLifeYears: data.metadata?.estimatedUsefulLifeYears,
            sourceAssetId: data.metadata?.sourceAssetId
          })

          return this.convertFinancialItems([financialItem])[0]
      }
    } catch (error) {
      console.error('AccountingService.createTransaction() - Error:', error)
      throw error
    }
  }

  /**
   * Update an existing transaction (routes to appropriate service)
   */
  static async updateTransaction(
    transactionId: string,
    updates: UpdateTransactionData
  ): Promise<UnifiedTransaction> {
    try {
      // Parse transaction ID to determine source
      const [sourcePrefix, sourceId] = transactionId.split('_', 2)

      switch (sourcePrefix) {
        case 'sr': // SalesRecord
          const updatedSalesRecord = await SalesRecordService.updateRecord(sourceId, {
            quantity: updates.metadata?.quantity,
            unitPrice: updates.metadata?.unitPrice,
            totalAmount: updates.amount,
            note: updates.note,
            saleDate: updates.date,
            saleTime: updates.metadata?.saleTime
          })
          return this.convertSalesRecords([updatedSalesRecord])[0]

        case 're': // RecurringExpense
          const updatedRecurringExpense = await RecurringExpensesService.update(sourceId, {
            name: updates.description,
            amount: updates.amount,
            category: updates.category,
            note: updates.note,
            startDate: updates.date,
            endDate: updates.metadata?.endDate,
            isActive: updates.status !== 'CANCELLED'
          })
          return this.convertRecurringExpenses([updatedRecurringExpense])[0]

        case 'fa': // FixedAsset
          const updatedFixedAsset = await FixedAssetService.update(sourceId, {
            name: updates.description,
            category: updates.category,
            purchasePrice: updates.amount,
            purchaseDate: updates.date,
            estimatedUsefulLifeYears: updates.metadata?.estimatedUsefulLifeYears,
            note: updates.note
          })
          return this.convertFixedAssets([updatedFixedAsset])[0]

        case 'fi': // FinancialItem
        default:
          const updatedFinancialItem = await FinancialItemsService.update(sourceId, {
            name: updates.description,
            value: updates.amount,
            category: updates.category as any,
            note: updates.note,
            baseUnitCost: updates.metadata?.baseUnitCost,
            baseUnitQuantity: updates.metadata?.baseUnitQuantity,
            usagePerCup: updates.metadata?.usagePerCup,
            unit: updates.metadata?.unit,
            isFixedAsset: updates.metadata?.isFixedAsset,
            estimatedUsefulLifeYears: updates.metadata?.estimatedUsefulLifeYears,
            sourceAssetId: updates.metadata?.sourceAssetId
          })
          return this.convertFinancialItems([updatedFinancialItem])[0]
      }
    } catch (error) {
      console.error('AccountingService.updateTransaction() - Error:', error)
      throw error
    }
  }

  /**
   * Delete a transaction (routes to appropriate service)
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      // Parse transaction ID to determine source
      const [sourcePrefix, sourceId] = transactionId.split('_', 2)

      switch (sourcePrefix) {
        case 'sr': // SalesRecord
          await SalesRecordService.deleteRecord(sourceId)
          break
        case 're': // RecurringExpense
          await RecurringExpensesService.delete(sourceId)
          break
        case 'fa': // FixedAsset
          await FixedAssetService.delete(sourceId)
          break
        case 'fi': // FinancialItem
        default:
          await FinancialItemsService.delete(sourceId)
          break
      }
    } catch (error) {
      console.error('AccountingService.deleteTransaction() - Error:', error)
      throw error
    }
  }

  /**
   * Calculate financial summary from transactions
   */
  private static calculateFinancialSummary(
    transactions: UnifiedTransaction[],
    businessId: string,
    dateRange?: { start: string; end: string }
  ): FinancialSummary {
    const income = transactions.filter(t =>
      ['SALES_INCOME', 'CAPITAL_INVESTMENT'].includes(t.type)
    )
    const expenses = transactions.filter(t =>
      ['OPERATING_EXPENSE', 'FIXED_COST', 'VARIABLE_COST', 'RECURRING_EXPENSE', 'ASSET_DEPRECIATION'].includes(t.type)
    )

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

    const salesIncome = income
      .filter(t => t.type === 'SALES_INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const capitalInvestments = income
      .filter(t => t.type === 'CAPITAL_INVESTMENT')
      .reduce((sum, t) => sum + t.amount, 0)

    const operatingExpenses = expenses
      .filter(t => ['OPERATING_EXPENSE', 'RECURRING_EXPENSE'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)

    const fixedCosts = expenses
      .filter(t => t.type === 'FIXED_COST')
      .reduce((sum, t) => sum + t.amount, 0)

    const variableCosts = expenses
      .filter(t => t.type === 'VARIABLE_COST')
      .reduce((sum, t) => sum + t.amount, 0)

    const depreciation = expenses
      .filter(t => t.type === 'ASSET_DEPRECIATION')
      .reduce((sum, t) => sum + t.amount, 0)

    const netIncome = totalIncome - totalExpenses
    const grossProfit = salesIncome - variableCosts
    const operatingProfit = grossProfit - operatingExpenses - fixedCosts
    const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

    // Transaction counts
    const transactionCounts = transactions.reduce((counts, transaction) => {
      counts[transaction.type] = (counts[transaction.type] || 0) + 1
      return counts
    }, {} as Record<TransactionType, number>)

    // Ensure all transaction types have a count
    const allTypes: TransactionType[] = [
      'CAPITAL_INVESTMENT', 'SALES_INCOME', 'OPERATING_EXPENSE',
      'FIXED_COST', 'VARIABLE_COST', 'ASSET_PURCHASE',
      'ASSET_DEPRECIATION', 'RECURRING_EXPENSE'
    ]
    allTypes.forEach(type => {
      if (!(type in transactionCounts)) {
        transactionCounts[type] = 0
      }
    })

    return {
      businessId,
      periodStart: dateRange?.start || '',
      periodEnd: dateRange?.end || '',
      totalIncome,
      salesIncome,
      capitalInvestments,
      totalExpenses,
      operatingExpenses,
      fixedCosts,
      variableCosts,
      depreciation,
      netIncome,
      grossProfit,
      operatingProfit,
      profitMargin,
      cashFlow: netIncome, // Simplified cash flow
      burnRate: operatingExpenses, // Monthly burn rate
      transactionCounts: transactionCounts as { [key in TransactionType]: number }
    }
  }
}
