import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ArrowUpDown, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/formatters'
import { type RecurringExpense } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface RecurringExpenseTableProps {
  expenses: RecurringExpense[]
  onEdit: (expense: RecurringExpense) => void
  onDelete: (expense: RecurringExpense) => void
  onToggleActive: (expense: RecurringExpense) => void
  loading?: boolean
  showInactive?: boolean
}

type SortField = 'name' | 'amount' | 'frequency' | 'category' | 'startDate' | 'endDate'
type SortDirection = 'asc' | 'desc'

export function RecurringExpenseTable({ 
  expenses, 
  onEdit, 
  onDelete, 
  onToggleActive,
  loading = false,
  showInactive = false
}: RecurringExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [frequencyFilter, setFrequencyFilter] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(expense => expense.category))]
    return uniqueCategories.sort()
  }, [expenses])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      // Search filter
      const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()))

      // Category filter
      const matchesCategory = !categoryFilter || expense.category === categoryFilter

      // Frequency filter
      const matchesFrequency = !frequencyFilter || expense.frequency === frequencyFilter

      // Active/inactive filter
      const matchesActiveFilter = showInactive || expense.isActive

      return matchesSearch && matchesCategory && matchesFrequency && matchesActiveFilter
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle different data types
      if (sortField === 'amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortField === 'startDate' || sortField === 'endDate') {
        aValue = new Date(aValue || '9999-12-31')
        bValue = new Date(bValue || '9999-12-31')
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [expenses, searchTerm, categoryFilter, frequencyFilter, sortField, sortDirection, showInactive])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setFrequencyFilter('')
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading expenses...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-card !important">
        <CardTitle className="text-card-foreground">Recurring Expenses</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter || 'all-categories'} onValueChange={(value) => setCategoryFilter(value === 'all-categories' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={frequencyFilter || 'all-frequencies'} onValueChange={(value) => setFrequencyFilter(value === 'all-frequencies' ? '' : value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-frequencies">All</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || categoryFilter || frequencyFilter) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-card !important">
        {filteredAndSortedExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {expenses.length === 0 
              ? "No recurring expenses found. Create your first expense to get started."
              : "No expenses match your current filters."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="name">Name</SortableHeader>
                  <SortableHeader field="amount">Amount</SortableHeader>
                  <SortableHeader field="frequency">Frequency</SortableHeader>
                  <SortableHeader field="category">Category</SortableHeader>
                  <SortableHeader field="startDate">Start Date</SortableHeader>
                  <SortableHeader field="endDate">End Date</SortableHeader>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    className={cn(
                      "hover:bg-muted/50",
                      !expense.isActive && "opacity-60"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{expense.name}</div>
                        {expense.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.frequency === 'monthly' ? 'default' : 'secondary'}>
                        {expense.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(expense.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {expense.endDate 
                        ? format(new Date(expense.endDate), 'MMM dd, yyyy')
                        : <span className="text-muted-foreground">Ongoing</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.isActive ? 'default' : 'secondary'}>
                        {expense.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleActive(expense)}>
                            {expense.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(expense)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
