/**
 * Transaction List Component
 * 
 * Displays unified transactions from all financial sources with:
 * - Sorting and filtering capabilities
 * - Transaction type badges and status indicators
 * - Drill-down to source entities
 * - Responsive design with mobile-friendly layout
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Calendar,
  DollarSign,
  Tag,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/formatters'
import { useCurrentBusinessCurrency } from '@/lib/stores/businessStore'
import { TransactionFilters } from './TransactionFilters'
import type { UnifiedTransaction, TransactionFilters as ITransactionFilters, TransactionType } from '@/lib/types/accounting'

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null, formatString: string, fallback: string = 'Invalid date'): string => {
  if (!dateString) return fallback
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return fallback
    return format(date, formatString)
  } catch {
    return fallback
  }
}

interface TransactionListProps {
  transactions: UnifiedTransaction[]
  loading: boolean
  error: string | null
  showFilters?: boolean
  onApplyFilters?: (filters: ITransactionFilters) => void
  onClearFilters?: () => void
  currentFilters?: ITransactionFilters | null
  onEditTransaction?: (transaction: UnifiedTransaction) => void
  onDeleteTransaction?: (transactionId: string) => void
  onViewDetails?: (transaction: UnifiedTransaction) => void
}

type SortField = 'date' | 'amount' | 'description' | 'type' | 'category'
type SortDirection = 'asc' | 'desc'

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  'CAPITAL_INVESTMENT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'SALES_INCOME': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'OPERATING_EXPENSE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'FIXED_COST': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'VARIABLE_COST': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'ASSET_PURCHASE': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'ASSET_DEPRECIATION': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'RECURRING_EXPENSE': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  'CAPITAL_INVESTMENT': 'Capital',
  'SALES_INCOME': 'Sales',
  'OPERATING_EXPENSE': 'Expense',
  'FIXED_COST': 'Fixed Cost',
  'VARIABLE_COST': 'Variable Cost',
  'ASSET_PURCHASE': 'Asset',
  'ASSET_DEPRECIATION': 'Depreciation',
  'RECURRING_EXPENSE': 'Recurring',
}

export function TransactionList({
  transactions,
  loading,
  error,
  showFilters = false,
  onApplyFilters,
  onClearFilters,
  currentFilters,
  onEditTransaction,
  onDeleteTransaction,
  onViewDetails
}: TransactionListProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useTranslation()
  const currentCurrency = useCurrentBusinessCurrency()

  // Local filtering and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.note?.toLowerCase().includes(searchLower) ||
        TRANSACTION_TYPE_LABELS[transaction.type].toLowerCase().includes(searchLower)
      )
    }

    // Sort transactions
    return filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        case 'type':
          aValue = TRANSACTION_TYPE_LABELS[a.type]
          bValue = TRANSACTION_TYPE_LABELS[b.type]
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [transactions, searchTerm, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounting.transactions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && onApplyFilters && onClearFilters && (
          <TransactionFilters
            onApplyFilters={onApplyFilters}
            onClearFilters={onClearFilters}
            currentFilters={currentFilters}
            availableCategories={Array.from(new Set(transactions.map(t => t.category)))}
          />
        )}
      </div>

      {/* Transaction Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  {t('accounting.transactions.date')}
                  {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  {t('accounting.transactions.type')}
                  {getSortIcon('type')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-2">
                  {t('accounting.transactions.description')}
                  {getSortIcon('description')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  {t('accounting.transactions.category')}
                  {getSortIcon('category')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-2">
                  {t('accounting.transactions.amount')}
                  {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? t('accounting.transactions.noMatch')
                    : t('accounting.transactions.none')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {safeFormatDate(transaction.date, 'MMM dd, yyyy', 'No date')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {safeFormatDate(transaction.createdAt, 'HH:mm', 'No time')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={TRANSACTION_TYPE_COLORS[transaction.type]}
                    >
                      {TRANSACTION_TYPE_LABELS[transaction.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{transaction.description}</span>
                      {transaction.note && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {transaction.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{transaction.category}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${
                      ['SALES_INCOME', 'CAPITAL_INVESTMENT'].includes(transaction.type)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {['SALES_INCOME', 'CAPITAL_INVESTMENT'].includes(transaction.type) ? '+' : '-'}
                      {formatCurrency(transaction.amount, currentCurrency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewDetails && (
                          <DropdownMenuItem onClick={() => onViewDetails(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('accounting.transactions.viewDetails')}
                          </DropdownMenuItem>
                        )}
                        {onEditTransaction && (
                          <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('accounting.transactions.edit')}
                          </DropdownMenuItem>
                        )}
                        {onDeleteTransaction && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteTransaction(transaction.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('accounting.transactions.delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      {filteredAndSortedTransactions.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {t('accounting.transactions.showing', {
            count: filteredAndSortedTransactions.length,
            total: transactions.length,
            search: searchTerm ? ` matching "${searchTerm}"` : ''
          })}
        </div>
      )}
    </div>
  )
}
