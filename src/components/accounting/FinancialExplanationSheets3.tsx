/**
 * Financial Explanation Sheets Component - Part 3
 * 
 * Final set of explanation sheets for remaining financial dashboard cards.
 */

import { Info, Calculator, TrendingUp, DollarSign, PieChart, Target, Receipt, CheckCircle, BarChart3, Activity, Shield } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'

interface ExplanationProps {
  summary?: FinancialSummary | null
  healthScore?: number
  profitabilityScore?: number
  liquidityScore?: number
  efficiencyScore?: number
  growthScore?: number
  transactionCount?: number
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

interface ScoreDisplayProps {
  score: number
  label: string
}

function ScoreDisplay({ score, label }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600'
    if (score >= 61) return 'text-blue-600'
    if (score >= 41) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 81) return 'Excellent'
    if (score >= 61) return 'Good'
    if (score >= 41) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="flex items-center justify-between">
      <span>{label}:</span>
      <div className="text-right">
        <div className={`font-medium text-lg ${getScoreColor(score)}`}>
          {Math.round(score * 10) / 10}/100
        </div>
        <div className="text-sm text-muted-foreground">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  )
}

export const SalesIncomeExplanation = ({ summary }: ExplanationProps) => {
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
            <DollarSign className="h-5 w-5 text-green-600" />
            Sales Income Explained
          </SheetTitle>
          <SheetDescription>
            Understanding revenue specifically from sales operations
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Sales Income?" icon={<Receipt className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Sales Income is revenue generated specifically from your core business operations - selling coffee, food, and related products to customers. This excludes investments, loans, or other non-operational income.
            </p>
            <p className="text-sm text-muted-foreground">
              It's the most important income metric because it shows how well your actual business is performing.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Sales Income vs Total Income" icon={<BarChart3 className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Sales Income (Operating Revenue):</div>
                <div className="text-sm space-y-1">
                  <div>• Coffee and beverage sales</div>
                  <div>• Food and pastry sales</div>
                  <div>• Merchandise sales</div>
                  <div>• Catering services</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Total Income (All Revenue Sources):</div>
                <div className="text-sm space-y-1">
                  <div>• Sales Income (above)</div>
                  <div>• Owner investments</div>
                  <div>• Loan proceeds</div>
                  <div>• Interest earned</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Sales Revenue Streams" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Beverages (Coffee, Tea, etc.):</span>
                <span className="font-medium">60-70% typical</span>
              </div>
              <div className="flex justify-between">
                <span>Food (Pastries, Sandwiches):</span>
                <span className="font-medium">20-30% typical</span>
              </div>
              <div className="flex justify-between">
                <span>Merchandise & Retail:</span>
                <span className="font-medium">5-10% typical</span>
              </div>
              <div className="flex justify-between">
                <span>Special Services (Catering):</span>
                <span className="font-medium">5-15% typical</span>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sales Income:</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.salesIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Income:</span>
                  <span className="font-medium">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Sales as % of Total:</span>
                  <span className="font-medium">
                    {((summary.salesIncome / summary.totalIncome) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {((summary.salesIncome / summary.totalIncome) * 100) >= 80 
                    ? '✅ Excellent - business is largely self-sustaining' 
                    : ((summary.salesIncome / summary.totalIncome) * 100) >= 60
                    ? '⚠️ Good - focus on increasing sales revenue'
                    : '🚨 Low sales ratio - prioritize operational income growth'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Increasing Sales Income" icon={<TrendingUp className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Menu Expansion:</strong> Add high-margin items like specialty drinks</p>
              <p>• <strong>Upselling:</strong> Train staff to suggest add-ons and upgrades</p>
              <p>• <strong>Peak Hours:</strong> Optimize staffing and menu for busy periods</p>
              <p>• <strong>Customer Retention:</strong> Loyalty programs and quality consistency</p>
              <p>• <strong>New Revenue Streams:</strong> Catering, wholesale, online sales</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const OperatingExpensesExplanation = ({ summary }: ExplanationProps) => {
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
            <Receipt className="h-5 w-5 text-red-600" />
            Operating Expenses Explained
          </SheetTitle>
          <SheetDescription>
            Understanding day-to-day operational costs vs other expenses
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What are Operating Expenses?" icon={<BarChart3 className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Operating Expenses are the day-to-day costs required to run your coffee shop. These are different from one-time purchases or non-business expenses.
            </p>
            <p className="text-sm text-muted-foreground">
              Understanding operating expenses helps you identify your true cost of doing business and areas for optimization.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Operating vs Non-Operating Expenses" icon={<Calculator className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Operating Expenses (Day-to-Day):</div>
                <div className="text-sm space-y-1">
                  <div>• Staff wages and benefits</div>
                  <div>• Utilities (electricity, water, gas)</div>
                  <div>• Marketing and advertising</div>
                  <div>• Equipment maintenance and repairs</div>
                  <div>• Professional services (accounting, legal)</div>
                  <div>• Software subscriptions and licenses</div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Non-Operating Expenses:</div>
                <div className="text-sm space-y-1">
                  <div>• Equipment purchases (capital expenditure)</div>
                  <div>• Loan interest payments</div>
                  <div>• One-time setup costs</div>
                  <div>• Owner withdrawals</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Coffee Shop Operating Expense Categories" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Labor (wages, benefits):</span>
                <span className="font-medium">30-35% of revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Utilities & Rent:</span>
                <span className="font-medium">15-20% of revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Marketing & Advertising:</span>
                <span className="font-medium">3-5% of revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance & Repairs:</span>
                <span className="font-medium">2-3% of revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Professional Services:</span>
                <span className="font-medium">1-2% of revenue</span>
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
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-medium">{formatCurrency(summary.totalExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Operating as % of Revenue:</span>
                  <span className="font-medium">
                    {((summary.operatingExpenses / summary.totalIncome) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {((summary.operatingExpenses / summary.totalIncome) * 100) <= 60 
                    ? '✅ Good operating expense ratio' 
                    : ((summary.operatingExpenses / summary.totalIncome) * 100) <= 75
                    ? '⚠️ Moderate operating expenses - room for optimization'
                    : '🚨 High operating expense ratio - needs attention'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Optimizing Operating Expenses" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Energy Efficiency:</strong> LED lighting, efficient equipment, smart thermostats</p>
              <p>• <strong>Staff Optimization:</strong> Cross-training, efficient scheduling, productivity tools</p>
              <p>• <strong>Preventive Maintenance:</strong> Regular equipment servicing to avoid costly repairs</p>
              <p>• <strong>Digital Marketing:</strong> Cost-effective social media vs traditional advertising</p>
              <p>• <strong>Vendor Negotiations:</strong> Review contracts annually, compare service providers</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const NetPositionExplanation = ({ summary }: ExplanationProps) => {
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
            <Shield className="h-5 w-5 text-blue-600" />
            Net Position Explained
          </SheetTitle>
          <SheetDescription>
            Understanding your business's financial position and net worth
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Net Position?" icon={<Calculator className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Net Position represents your business's net worth - what you would have left if you sold all assets and paid off all debts. It's calculated as Assets minus Liabilities.
            </p>
            <p className="text-sm text-muted-foreground">
              This metric shows the true financial value of your coffee shop and your equity as the owner.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Calculation Method" icon={<BarChart3 className="h-5 w-5" />}>
            <Formula 
              formula="Net Position = Total Assets - Total Liabilities"
              description="Your business equity and net worth"
            />
            <div className="bg-blue-50 p-3 rounded-lg mt-3">
              <div className="font-medium text-sm mb-2">Example:</div>
              <div className="text-sm space-y-1">
                <div>• Assets: $50,000 (cash, equipment, inventory)</div>
                <div>• Liabilities: $20,000 (loans, accounts payable)</div>
                <div>• Net Position: $50,000 - $20,000 = $30,000</div>
                <div className="text-xs text-muted-foreground mt-2">You own $30,000 worth of business equity</div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Assets vs Liabilities" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Assets (What You Own):</div>
                <div className="text-sm space-y-1">
                  <div>• Cash and bank accounts</div>
                  <div>• Coffee equipment and machinery</div>
                  <div>• Furniture and fixtures</div>
                  <div>• Inventory (beans, supplies)</div>
                  <div>• Accounts receivable</div>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Liabilities (What You Owe):</div>
                <div className="text-sm space-y-1">
                  <div>• Business loans</div>
                  <div>• Equipment financing</div>
                  <div>• Accounts payable to suppliers</div>
                  <div>• Credit card debt</div>
                  <div>• Accrued expenses (wages, taxes)</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Position" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Net Position:</span>
                  <span className={`font-medium text-lg ${
                    summary.netIncome > 0 ? 'text-green-600' : 
                    summary.netIncome === 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.netIncome)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {summary.netIncome > 0 
                    ? '✅ Positive net position indicates a financially healthy business.' 
                    : summary.netIncome === 0
                    ? '⚠️ Break-even position. Focus on building positive equity.'
                    : '🚨 Negative position indicates liabilities exceed assets. Needs attention.'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="What Net Position Tells You" icon={<Activity className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Business Value:</strong> How much the business is worth to you as owner</p>
              <p>• <strong>Financial Stability:</strong> Higher net position = more stable business</p>
              <p>• <strong>Growth Capacity:</strong> Positive equity provides foundation for expansion</p>
              <p>• <strong>Loan Eligibility:</strong> Banks consider net position for lending decisions</p>
              <p>• <strong>Exit Value:</strong> Approximate value if you were to sell the business</p>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Improving Net Position" icon={<TrendingUp className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Increase Assets:</strong> Build cash reserves, invest in valuable equipment</p>
              <p>• <strong>Reduce Liabilities:</strong> Pay down loans, reduce credit card debt</p>
              <p>• <strong>Profitable Operations:</strong> Consistent profits increase retained earnings</p>
              <p>• <strong>Asset Management:</strong> Maintain equipment value, manage inventory efficiently</p>
              <p>• <strong>Strategic Investments:</strong> Invest in assets that generate more revenue</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const TotalTransactionsExplanation = ({ summary, transactionCount }: ExplanationProps) => {
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
            <Receipt className="h-5 w-5 text-purple-600" />
            Total Transactions Explained
          </SheetTitle>
          <SheetDescription>
            Understanding transaction counting methodology and business insights
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What Counts as a Transaction?" icon={<Receipt className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              A transaction is any recorded financial activity in your business system. This includes all money movements, both incoming and outgoing.
            </p>
            <div className="space-y-3 mt-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Income Transactions:</div>
                <div className="text-sm space-y-1">
                  <div>• Customer sales (each receipt)</div>
                  <div>• Owner investments</div>
                  <div>• Loan proceeds</div>
                  <div>• Refunds received</div>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Expense Transactions:</div>
                <div className="text-sm space-y-1">
                  <div>• Supplier payments</div>
                  <div>• Rent and utility payments</div>
                  <div>• Staff salary payments</div>
                  <div>• Equipment purchases</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Why Transaction Count Matters" icon={<BarChart3 className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Business Activity:</strong> Higher counts indicate more business activity</p>
              <p>• <strong>Customer Traffic:</strong> Sales transactions show customer volume</p>
              <p>• <strong>Cash Flow Frequency:</strong> More transactions = more frequent cash movements</p>
              <p>• <strong>Record Keeping:</strong> Ensures all financial activities are tracked</p>
              <p>• <strong>Trend Analysis:</strong> Compare transaction volumes over time</p>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Transaction Analysis" icon={<Calculator className="h-5 w-5" />}>
            <div className="space-y-3">
              <Formula 
                formula="Average Transaction Value = Total Revenue ÷ Sales Transactions"
                description="How much customers spend on average per visit"
              />
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Example: $15,000 revenue from 500 sales transactions</div>
                  <div>Average Transaction Value = $15,000 ÷ 500 = $30</div>
                  <div className="font-medium">Each customer spends $30 on average</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          {transactionCount !== undefined && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Transactions:</span>
                  <div className="font-medium text-lg">{transactionCount}</div>
                </div>
                {summary && summary.salesIncome > 0 && transactionCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Avg. Transaction Value:</span>
                    <div className="font-medium">
                      {formatCurrency(summary.salesIncome / transactionCount)}
                    </div>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {transactionCount > 100 
                    ? '✅ Good transaction volume indicates active business' 
                    : transactionCount > 50
                    ? '⚠️ Moderate activity - consider ways to increase customer traffic'
                    : '🚨 Low transaction count - focus on marketing and customer acquisition'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Coffee Shop Benchmarks" icon={<Target className="h-5 w-5" />}>
            <div className="space-y-3">
              <Benchmark
                metric="Daily Transactions"
                excellent="200+ per day"
                good="100-200 per day"
                fair="50-100 per day"
                poor="Below 50 per day"
              />
              <div className="mt-3">
                <Benchmark
                  metric="Average Transaction Value"
                  excellent="$15+ per transaction"
                  good="$10-15 per transaction"
                  fair="$7-10 per transaction"
                  poor="Below $7 per transaction"
                />
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Increasing Transactions" icon={<TrendingUp className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Marketing:</strong> Social media, local advertising, loyalty programs</p>
              <p>• <strong>Hours:</strong> Extend operating hours during peak times</p>
              <p>• <strong>Location:</strong> Improve visibility and accessibility</p>
              <p>• <strong>Service Speed:</strong> Faster service = more customers served</p>
              <p>• <strong>Product Range:</strong> Offer items that attract different customer segments</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const FinancialHealthScoreExplanation = ({ healthScore, profitabilityScore, liquidityScore, efficiencyScore, growthScore }: ExplanationProps) => {
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
            <Activity className="h-5 w-5 text-emerald-600" />
            Financial Health Score Explained
          </SheetTitle>
          <SheetDescription>
            Understanding your overall business health scoring methodology
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Financial Health Score?" icon={<Shield className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              The Financial Health Score is a comprehensive 0-100 rating that evaluates your coffee shop's overall financial performance. It combines multiple key metrics to give you a single, easy-to-understand health indicator.
            </p>
            <p className="text-sm text-muted-foreground">
              This score helps you quickly assess your business performance and identify areas needing attention.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Score Ranges & Meanings" icon={<Target className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Excellent (81-100)</div>
                  <Badge variant="default">Outstanding</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Top-performing coffee shop with strong financials across all areas
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Good (61-80)</div>
                  <Badge variant="secondary">Strong</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Above-average performance with solid financial foundation
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Fair (41-60)</div>
                  <Badge variant="outline">Average</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Acceptable performance but with room for improvement
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Poor (0-40)</div>
                  <Badge variant="destructive">Needs Work</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Below industry standards, requires immediate attention
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Scoring Factors" icon={<Calculator className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium mb-2">The score is calculated from four key areas:</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>• Profitability (25% weight):</span>
                    <span className="text-muted-foreground">Profit margins and income generation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Liquidity (25% weight):</span>
                    <span className="text-muted-foreground">Cash flow and payment ability</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Efficiency (25% weight):</span>
                    <span className="text-muted-foreground">Cost control and resource utilization</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Growth (25% weight):</span>
                    <span className="text-muted-foreground">Revenue trends and expansion potential</span>
                  </div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          {healthScore !== undefined && (
            <ExplanationCard title="Your Current Score" icon={<Receipt className="h-5 w-5" />}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    healthScore >= 81 ? 'text-green-600' :
                    healthScore >= 61 ? 'text-blue-600' :
                    healthScore >= 41 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(healthScore * 10) / 10}/100
                  </div>
                  <div className="text-lg font-medium mt-1">
                    {
                      healthScore >= 81 ? 'Excellent' :
                      healthScore >= 61 ? 'Good' :
                      healthScore >= 41 ? 'Fair' : 'Poor'
                    }
                  </div>
                </div>
                <Progress value={healthScore} className="h-3" />
                <div className="text-sm text-muted-foreground text-center">
                  {healthScore >= 81 
                    ? '🎉 Outstanding financial health! Your coffee shop is performing excellently.' 
                    : healthScore >= 61
                    ? '✅ Strong financial position with good performance across key metrics.'
                    : healthScore >= 41
                    ? '⚠️ Average performance. Focus on improving weaker areas.'
                    : '🚨 Financial health needs attention. Review all key metrics and create improvement plan.'
                  }
                </div>
              </div>
            </ExplanationCard>
          )}

          {(profitabilityScore !== undefined || liquidityScore !== undefined || efficiencyScore !== undefined || growthScore !== undefined) && (
            <ExplanationCard title="Component Scores" icon={<BarChart3 className="h-5 w-5" />}>
              <div className="space-y-3">
                {profitabilityScore !== undefined && (
                  <ScoreDisplay score={profitabilityScore} label="Profitability" />
                )}
                {liquidityScore !== undefined && (
                  <ScoreDisplay score={liquidityScore} label="Liquidity" />
                )}
                {efficiencyScore !== undefined && (
                  <ScoreDisplay score={efficiencyScore} label="Efficiency" />
                )}
                {growthScore !== undefined && (
                  <ScoreDisplay score={growthScore} label="Growth" />
                )}
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Improving Your Score" icon={<TrendingUp className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Profitability:</strong> Increase prices, reduce costs, improve product mix</p>
              <p>• <strong>Liquidity:</strong> Manage cash flow, reduce payment delays, build reserves</p>
              <p>• <strong>Efficiency:</strong> Optimize operations, reduce waste, improve productivity</p>
              <p>• <strong>Growth:</strong> Expand customer base, increase sales, strategic investments</p>
              <p>• <strong>Regular Monitoring:</strong> Track metrics monthly and adjust strategies</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}