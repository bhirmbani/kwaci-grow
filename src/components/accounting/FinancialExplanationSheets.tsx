/**
 * Financial Explanation Sheets Component
 * 
 * Provides detailed explanations for all financial dashboard cards.
 * Each explanation includes:
 * - Conceptual explanation in plain language
 * - Calculation formulas and methodology
 * - Coffee shop business context and examples
 * - Industry benchmarks and best practices
 */

import { Info, Calculator, TrendingUp, TrendingDown, DollarSign, PieChart, Target, Receipt, AlertTriangle, CheckCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'

interface ExplanationProps {
  summary?: FinancialSummary | null
}

interface ExplanationCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function ExplanationCard({ title, icon, children }: ExplanationCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  )
}

interface FormulaProps {
  formula: string
  description: string
}

function Formula({ formula, description }: FormulaProps) {
  return (
    <div className="bg-muted p-3 rounded-lg">
      <div className="font-mono text-sm font-medium mb-1">{formula}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  )
}

interface BenchmarkProps {
  metric: string
  excellent: string
  good: string
  fair: string
  poor: string
}

function Benchmark({ metric, excellent, good, fair, poor }: BenchmarkProps) {
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{metric} Benchmarks:</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="default">Excellent</Badge>
          <span>{excellent}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Good</Badge>
          <span>{good}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Fair</Badge>
          <span>{fair}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Poor</Badge>
          <span>{poor}</span>
        </div>
      </div>
    </div>
  )
}

export const TotalIncomeExplanation = ({ summary }: ExplanationProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Total Income Explained
          </SheetTitle>
          <SheetDescription>
            Understanding your business's total revenue streams and how they're calculated
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Total Income?" icon={<DollarSign className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Total Income represents all money flowing into your coffee shop business. It's the sum of all revenue sources before any expenses are deducted.
            </p>
            <p className="text-sm text-muted-foreground">
              Think of it as the total amount of money customers and investors have given you during a specific period.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Calculation Method" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Total Income = Sales Revenue + Capital Investments + Other Income"
              description="All money received from any source"
            />
            <div className="space-y-2 text-sm">
              <div><strong>Sales Revenue:</strong> Money from selling coffee, food, and merchandise</div>
              <div><strong>Capital Investments:</strong> Money invested by owners or investors</div>
              <div><strong>Other Income:</strong> Grants, interest, or other revenue sources</div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Coffee Shop Examples" icon={<Receipt className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Daily Sales Revenue:</div>
                <div className="text-sm space-y-1">
                  <div>• 150 cups of coffee × $4.50 = $675</div>
                  <div>• 50 pastries × $3.00 = $150</div>
                  <div>• 20 sandwiches × $8.00 = $160</div>
                  <div className="font-medium border-t pt-1">Daily Total: $985</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Monthly Capital Investment:</div>
                <div className="text-sm">Owner investment: $5,000 for equipment upgrade</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sales Income:</span>
                  <span className="font-medium">{formatCurrency(summary.salesIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Investments:</span>
                  <span className="font-medium">{formatCurrency(summary.capitalInvestments)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Income:</span>
                  <span className="text-green-600">{formatCurrency(summary.totalIncome)}</span>
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Why It Matters" icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Growth Tracking:</strong> Shows if your business is growing over time</p>
              <p>• <strong>Capacity Planning:</strong> Helps determine if you need more staff or equipment</p>
              <p>• <strong>Investment Decisions:</strong> Higher income may justify expansion</p>
              <p>• <strong>Loan Applications:</strong> Banks look at total income for creditworthiness</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const TotalExpensesExplanation = ({ summary }: ExplanationProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Total Expenses Explained
          </SheetTitle>
          <SheetDescription>
            Understanding all costs involved in running your coffee shop
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What are Total Expenses?" icon={<DollarSign className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Total Expenses represent all money flowing out of your business. This includes everything you spend to operate your coffee shop.
            </p>
            <p className="text-sm text-muted-foreground">
              Understanding your expenses helps you identify where money goes and find opportunities to improve profitability.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Expense Categories" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Operating Expenses:</div>
                <div className="text-sm space-y-1">
                  <div>• Rent and utilities</div>
                  <div>• Staff wages and benefits</div>
                  <div>• Coffee beans and supplies</div>
                  <div>• Equipment maintenance</div>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Non-Operating Expenses:</div>
                <div className="text-sm space-y-1">
                  <div>• Loan interest payments</div>
                  <div>• Equipment depreciation</div>
                  <div>• One-time setup costs</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Calculation Method" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Total Expenses = Operating Expenses + Non-Operating Expenses"
              description="All money spent to run and finance the business"
            />
            <div className="bg-yellow-50 p-3 rounded-lg mt-3">
              <div className="font-medium text-sm mb-2">Monthly Example:</div>
              <div className="text-sm space-y-1">
                <div>• Rent: $3,000</div>
                <div>• Staff wages: $8,000</div>
                <div>• Supplies: $2,500</div>
                <div>• Utilities: $500</div>
                <div>• Other: $1,000</div>
                <div className="font-medium border-t pt-1">Total: $15,000</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Operating Expenses:</span>
                  <span className="font-medium text-red-600">{formatCurrency(summary.operatingExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Expenses:</span>
                  <span className="text-red-600">{formatCurrency(summary.totalExpenses)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Expense ratio: {((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1)}% of total income
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Cost Control Tips" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Track Everything:</strong> Monitor all expenses to identify trends</p>
              <p>• <strong>Negotiate:</strong> Review supplier contracts regularly</p>
              <p>• <strong>Energy Efficiency:</strong> Invest in energy-saving equipment</p>
              <p>• <strong>Staff Optimization:</strong> Match staffing to busy periods</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const NetIncomeExplanation = ({ summary }: ExplanationProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Net Income Explained
          </SheetTitle>
          <SheetDescription>
            Your business's bottom line - profit or loss after all expenses
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Net Income?" icon={<DollarSign className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Net Income is your business's profit or loss. It's what remains after subtracting all expenses from total income.
            </p>
            <p className="text-sm text-muted-foreground">
              Positive net income means profit; negative means loss. This is what you can reinvest or take as owner's profit.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Simple Calculation" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Net Income = Total Income - Total Expenses"
              description="The fundamental profit/loss calculation"
            />
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div>If Total Income = $30,000</div>
                <div>And Total Expenses = $25,000</div>
                <div className="font-medium">Then Net Income = $5,000 (Profit!)</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Receipt className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Income:</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(summary.totalExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Net Income:</span>
                  <span className={summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(summary.netIncome)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {summary.netIncome >= 0 ? '✅ Your business is profitable!' : '⚠️ Your business needs attention'}
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Industry Benchmarks" icon={<PieChart className="h-5 w-5" />}>
            <Benchmark
              metric="Coffee Shop Net Margin"
              excellent="15-25%"
              good="10-15%"
              fair="5-10%"
              poor="Below 5%"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Net Margin = (Net Income ÷ Total Income) × 100</p>
              <p>Industry average for coffee shops is typically 10-15%</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const CashFlowExplanation = ({ summary }: ExplanationProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Cash Flow Explained
          </SheetTitle>
          <SheetDescription>
            Understanding the timing of money in and out of your business
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Cash Flow?" icon={<DollarSign className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Cash Flow tracks the actual movement of money in and out of your business. Unlike profit, it focuses on when money is actually received or paid.
            </p>
            <p className="text-sm text-muted-foreground">
              You can be profitable but have poor cash flow if customers pay late, or have good cash flow but low profit if you collect payments quickly.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Calculation Method" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Cash Flow = Cash Received - Cash Paid Out"
              description="Actual money movement, not accounting entries"
            />
            <div className="space-y-2 text-sm">
              <div><strong>Cash In:</strong> Customer payments, loan proceeds, owner investments</div>
              <div><strong>Cash Out:</strong> Supplier payments, rent, salaries, loan payments</div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between font-medium text-lg">
                  <span>Current Cash Flow:</span>
                  <span className={summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(summary.cashFlow)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {summary.cashFlow >= 0 
                    ? '✅ Positive cash flow - money is coming in faster than going out' 
                    : '⚠️ Negative cash flow - monitor closely and improve collections'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Why Cash Flow Matters" icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Pay Bills:</strong> You need cash to pay suppliers and staff</p>
              <p>• <strong>Avoid Debt:</strong> Poor cash flow forces expensive borrowing</p>
              <p>• <strong>Seize Opportunities:</strong> Cash enables quick decisions and investments</p>
              <p>• <strong>Weather Storms:</strong> Cash reserves help during slow periods</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}