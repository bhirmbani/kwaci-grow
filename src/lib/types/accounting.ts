/**
 * Unified Accounting Types
 * 
 * This module defines unified interfaces for the accounting system that
 * aggregates all financial transactions from different sources into a
 * cohesive accounting interface.
 */

import type { 
  FinancialItem, 
  SalesRecord, 
  RecurringExpense, 
  FixedAsset 
} from '@/lib/db/schema'

/**
 * Unified transaction types that map to existing financial entities
 */
export type TransactionType = 
  | 'CAPITAL_INVESTMENT'    // FinancialItem (INITIAL_CAPITAL)
  | 'SALES_INCOME'          // SalesRecord
  | 'OPERATING_EXPENSE'     // RecurringExpense or one-time expenses
  | 'FIXED_COST'            // FinancialItem (FIXED_COSTS)
  | 'VARIABLE_COST'         // FinancialItem (VARIABLE_COGS)
  | 'ASSET_PURCHASE'        // FixedAsset
  | 'ASSET_DEPRECIATION'    // FinancialItem (depreciation entries)
  | 'RECURRING_EXPENSE'     // RecurringExpense

/**
 * Source entities that transactions can originate from
 */
export type TransactionSource = 
  | 'FinancialItem'
  | 'SalesRecord' 
  | 'RecurringExpense'
  | 'FixedAsset'

/**
 * Transaction status for tracking and workflow management
 */
export type TransactionStatus = 
  | 'PENDING'     // Planned but not executed
  | 'COMPLETED'   // Executed transaction
  | 'CANCELLED'   // Cancelled transaction
  | 'RECURRING'   // Active recurring transaction

/**
 * Unified transaction interface that represents any financial transaction
 * regardless of its source entity
 */
export interface UnifiedTransaction {
  // Core identification
  id: string
  businessId: string
  
  // Transaction classification
  type: TransactionType
  category: string
  status: TransactionStatus
  
  // Financial details
  amount: number              // Always positive, direction determined by type
  description: string
  note?: string
  
  // Timing
  date: string               // Transaction date (YYYY-MM-DD)
  createdAt: string
  updatedAt: string
  
  // Source tracking
  sourceEntity: TransactionSource
  sourceId: string           // ID in the source entity table
  
  // Entity-specific metadata (preserved for drill-down)
  metadata?: {
    // For SalesRecord
    branchId?: string
    menuId?: string
    productId?: string
    quantity?: number
    unitPrice?: number
    saleTime?: string
    
    // For RecurringExpense
    frequency?: 'monthly' | 'yearly'
    startDate?: string
    endDate?: string
    
    // For FixedAsset
    estimatedUsefulLifeYears?: number
    depreciationMethod?: string
    
    // For FinancialItem
    baseUnitCost?: number
    baseUnitQuantity?: number
    usagePerCup?: number
    unit?: string
    isFixedAsset?: boolean
    sourceAssetId?: string
  }
}

/**
 * Financial summary interface for dashboard analytics
 */
export interface FinancialSummary {
  businessId: string
  periodStart: string
  periodEnd: string
  
  // Income
  totalIncome: number
  salesIncome: number
  capitalInvestments: number
  
  // Expenses
  totalExpenses: number
  operatingExpenses: number
  fixedCosts: number
  variableCosts: number
  depreciation: number
  
  // Calculated metrics
  netIncome: number          // totalIncome - totalExpenses
  grossProfit: number        // salesIncome - variableCosts
  operatingProfit: number    // grossProfit - operatingExpenses - fixedCosts
  profitMargin: number       // netIncome / totalIncome (as percentage)
  
  // Cash flow indicators
  cashFlow: number           // Simplified cash flow calculation
  burnRate: number           // Monthly expense rate
  
  // Transaction counts
  transactionCounts: {
    [key in TransactionType]: number
  }
}

/**
 * Transaction filters for querying and analytics
 */
export interface TransactionFilters {
  businessId?: string
  types?: TransactionType[]
  categories?: string[]
  status?: TransactionStatus[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
  searchTerm?: string
  sourceEntities?: TransactionSource[]
}

/**
 * Transaction creation data (for new transactions)
 */
export interface CreateTransactionData {
  businessId: string
  type: TransactionType
  category: string
  amount: number
  description: string
  note?: string
  date: string
  metadata?: UnifiedTransaction['metadata']
}

/**
 * Transaction update data (for editing existing transactions)
 */
export interface UpdateTransactionData {
  category?: string
  amount?: number
  description?: string
  note?: string
  date?: string
  status?: TransactionStatus
  metadata?: Partial<UnifiedTransaction['metadata']>
}

/**
 * Pagination interface for transaction lists
 */
export interface TransactionPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Transaction list response with pagination
 */
export interface TransactionListResponse {
  transactions: UnifiedTransaction[]
  pagination: TransactionPagination
  summary: {
    totalAmount: number
    averageAmount: number
    transactionCount: number
  }
}

/**
 * Chart data interface for financial visualizations
 */
export interface FinancialChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    type?: 'line' | 'bar' | 'pie'
  }[]
}

/**
 * Export data interface for financial reports
 */
export interface FinancialExportData {
  businessName: string
  exportDate: string
  periodStart: string
  periodEnd: string
  transactions: UnifiedTransaction[]
  summary: FinancialSummary
  format: 'csv' | 'excel' | 'pdf'
}
