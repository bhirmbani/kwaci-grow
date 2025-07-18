/**
 * Export Utilities
 * 
 * Utilities for exporting financial data to various formats:
 * - CSV export for transactions and summaries
 * - Excel-compatible formats
 * - PDF reports (future enhancement)
 */

import { format } from 'date-fns'
import type { UnifiedTransaction, FinancialSummary } from '@/lib/types/accounting'
import { formatCurrency } from './formatters'
import { DEFAULT_CURRENCY } from '@/lib/utils/currencyUtils'

/**
 * Convert transactions to CSV format
 */
export function exportTransactionsToCSV(
  transactions: UnifiedTransaction[],
  businessName: string = 'Business',
  currency: string = DEFAULT_CURRENCY
): string {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    `Amount (${currency})`,
    'Status',
    'Note',
    'Created At'
  ]

  const rows = transactions.map(transaction => [
    transaction.date,
    transaction.type.replace(/_/g, ' '),
    transaction.category,
    transaction.description,
    transaction.amount.toString(),
    transaction.status,
    transaction.note || '',
    format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss')
  ])

  const csvContent = [
    [`# Financial Transactions Export - ${businessName}`],
    [`# Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`],
    [`# Total Transactions: ${transactions.length}`],
    [''], // Empty row
    headers,
    ...rows
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

  return csvContent
}

/**
 * Convert financial summary to CSV format
 */
export function exportFinancialSummaryToCSV(
  summary: FinancialSummary,
  businessName: string = 'Business',
  currency: string = DEFAULT_CURRENCY
): string {
  const summaryData = [
    ['# Financial Summary Export', businessName],
    ['# Generated on:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ['# Period:', `${summary.periodStart || 'All time'} to ${summary.periodEnd || 'Present'}`],
    [''], // Empty row
    ['Metric', `Amount (${currency})`, 'Percentage'],
    ['Total Income', summary.totalIncome.toString(), '100.0%'],
    ['Sales Income', summary.salesIncome.toString(), summary.totalIncome > 0 ? `${((summary.salesIncome / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    ['Capital Investments', summary.capitalInvestments.toString(), summary.totalIncome > 0 ? `${((summary.capitalInvestments / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    [''], // Empty row
    ['Total Expenses', summary.totalExpenses.toString(), summary.totalIncome > 0 ? `${((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    ['Operating Expenses', summary.operatingExpenses.toString(), summary.totalIncome > 0 ? `${((summary.operatingExpenses / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    ['Fixed Costs', summary.fixedCosts.toString(), summary.totalIncome > 0 ? `${((summary.fixedCosts / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    ['Variable Costs', summary.variableCosts.toString(), summary.totalIncome > 0 ? `${((summary.variableCosts / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    ['Depreciation', summary.depreciation.toString(), summary.totalIncome > 0 ? `${((summary.depreciation / summary.totalIncome) * 100).toFixed(1)}%` : '0.0%'],
    [''], // Empty row
    ['Net Income', summary.netIncome.toString(), ''],
    ['Gross Profit', summary.grossProfit.toString(), ''],
    ['Operating Profit', summary.operatingProfit.toString(), ''],
    ['Profit Margin', `${summary.profitMargin.toFixed(2)}%`, ''],
    ['Cash Flow', summary.cashFlow.toString(), ''],
    ['Burn Rate', summary.burnRate.toString(), ''],
    [''], // Empty row
    ['Transaction Counts', '', ''],
    ['Capital Investment', summary.transactionCounts.CAPITAL_INVESTMENT?.toString() || '0', ''],
    ['Sales Income', summary.transactionCounts.SALES_INCOME?.toString() || '0', ''],
    ['Operating Expense', summary.transactionCounts.OPERATING_EXPENSE?.toString() || '0', ''],
    ['Fixed Cost', summary.transactionCounts.FIXED_COST?.toString() || '0', ''],
    ['Variable Cost', summary.transactionCounts.VARIABLE_COST?.toString() || '0', ''],
    ['Asset Purchase', summary.transactionCounts.ASSET_PURCHASE?.toString() || '0', ''],
    ['Asset Depreciation', summary.transactionCounts.ASSET_DEPRECIATION?.toString() || '0', ''],
    ['Recurring Expense', summary.transactionCounts.RECURRING_EXPENSE?.toString() || '0', '']
  ]

  return summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Export transactions with automatic filename generation
 */
export function exportTransactions(
  transactions: UnifiedTransaction[],
  businessName: string = 'Business',
  format: 'csv' = 'csv',
  currency: string = DEFAULT_CURRENCY
): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_transactions_${timestamp}.csv`
  
  if (format === 'csv') {
    const csvContent = exportTransactionsToCSV(transactions, businessName, currency)
    downloadCSV(csvContent, filename)
  }
}

/**
 * Export financial summary with automatic filename generation
 */
export function exportFinancialSummary(
  summary: FinancialSummary,
  businessName: string = 'Business',
  format: 'csv' = 'csv',
  currency: string = DEFAULT_CURRENCY
): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_financial_summary_${timestamp}.csv`
  
  if (format === 'csv') {
    const csvContent = exportFinancialSummaryToCSV(summary, businessName, currency)
    downloadCSV(csvContent, filename)
  }
}

/**
 * Export combined financial report
 */
export function exportFinancialReport(
  transactions: UnifiedTransaction[],
  summary: FinancialSummary,
  businessName: string = 'Business',
  format: 'csv' = 'csv',
  currency: string = DEFAULT_CURRENCY
): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_financial_report_${timestamp}.csv`
  
  if (format === 'csv') {
    const summaryContent = exportFinancialSummaryToCSV(summary, businessName, currency)
    const transactionsContent = exportTransactionsToCSV(transactions, businessName, currency)
    
    const combinedContent = [
      summaryContent,
      '',
      '',
      '# DETAILED TRANSACTIONS',
      '',
      transactionsContent.split('\n').slice(4).join('\n') // Skip header from transactions
    ].join('\n')
    
    downloadCSV(combinedContent, filename)
  }
}

/**
 * Get export statistics
 */
export function getExportStats(transactions: UnifiedTransaction[]): {
  totalTransactions: number
  dateRange: { start: string; end: string } | null
  totalAmount: number
  transactionTypes: Record<string, number>
} {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      dateRange: null,
      totalAmount: 0,
      transactionTypes: {}
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const dateRange = {
    start: sortedTransactions[0].date,
    end: sortedTransactions[sortedTransactions.length - 1].date
  }

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)

  const transactionTypes = transactions.reduce((counts, transaction) => {
    const type = transaction.type.replace(/_/g, ' ')
    counts[type] = (counts[type] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  return {
    totalTransactions: transactions.length,
    dateRange,
    totalAmount,
    transactionTypes
  }
}
