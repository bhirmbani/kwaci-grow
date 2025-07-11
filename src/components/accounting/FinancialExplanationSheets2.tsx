/**
 * Financial Explanation Sheets Component - Part 2
 * 
 * Provides detailed explanations for Cost Structure, Revenue Mix, and Performance cards.
 */

import { Info, Calculator, TrendingUp, DollarSign, PieChart, Target, Receipt, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
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

export const CostStructureExplanation = ({ summary }: ExplanationProps) => {
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
            <PieChart className="h-5 w-5 text-purple-600" />
            Cost Structure Explained
          </SheetTitle>
          <SheetDescription>
            Understanding how your costs are distributed across different categories
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Cost Structure?" icon={<BarChart3 className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Cost Structure shows how your total expenses are broken down into different categories. Understanding this helps you identify where most of your money goes and where you can optimize.
            </p>
            <p className="text-sm text-muted-foreground">
              For coffee shops, costs typically fall into three main categories: Variable, Fixed, and Operating costs.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Cost Categories" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Variable Costs:</div>
                <div className="text-sm space-y-1">
                  <div>• Coffee beans and tea leaves</div>
                  <div>• Milk, cream, and syrups</div>
                  <div>• Cups, lids, and packaging</div>
                  <div>• Food ingredients for pastries/sandwiches</div>
                  <div className="text-xs text-muted-foreground mt-2">These costs change with sales volume</div>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Fixed Costs:</div>
                <div className="text-sm space-y-1">
                  <div>• Rent and lease payments</div>
                  <div>• Insurance premiums</div>
                  <div>• Base salaries and benefits</div>
                  <div>• Equipment depreciation</div>
                  <div className="text-xs text-muted-foreground mt-2">These costs stay the same regardless of sales</div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Operating Costs:</div>
                <div className="text-sm space-y-1">
                  <div>• Utilities (electricity, water, gas)</div>
                  <div>• Marketing and advertising</div>
                  <div>• Equipment maintenance</div>
                  <div>• Professional services (accounting, legal)</div>
                  <div className="text-xs text-muted-foreground mt-2">Day-to-day operational expenses</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Coffee Shop Example" icon={<Receipt className="h-5 w-5" />}>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium text-sm mb-2">Monthly Cost Breakdown:</div>
              <div className="text-sm space-y-1">
                <div>• Variable Costs: $8,000 (40%)</div>
                <div>• Fixed Costs: $7,000 (35%)</div>
                <div>• Operating Costs: $5,000 (25%)</div>
                <div className="font-medium border-t pt-1">Total: $20,000</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Variable Costs:</span>
                  <span className="font-medium">{formatCurrency(summary.variableCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Costs:</span>
                  <span className="font-medium">{formatCurrency(summary.fixedCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Costs:</span>
                  <span className="font-medium">{formatCurrency(summary.operatingExpenses)}</span>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  Variable: {((summary.variableCosts / summary.totalExpenses) * 100).toFixed(1)}% | 
                  Fixed: {((summary.fixedCosts / summary.totalExpenses) * 100).toFixed(1)}% | 
                  Operating: {((summary.operatingExpenses / summary.totalExpenses) * 100).toFixed(1)}%
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Optimization Tips" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Variable Costs:</strong> Negotiate bulk pricing with suppliers</p>
              <p>• <strong>Fixed Costs:</strong> Review lease terms and insurance annually</p>
              <p>• <strong>Operating Costs:</strong> Implement energy-saving measures</p>
              <p>• <strong>Monitor Ratios:</strong> Track cost percentages to spot trends</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const RevenueMixExplanation = ({ summary }: ExplanationProps) => {
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
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Revenue Mix Explained
          </SheetTitle>
          <SheetDescription>
            Understanding the composition of your total income sources
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Revenue Mix?" icon={<DollarSign className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Revenue Mix shows the proportion of your total income that comes from different sources. This helps you understand which revenue streams are most important to your business.
            </p>
            <p className="text-sm text-muted-foreground">
              For coffee shops, revenue typically comes from sales revenue (daily operations) and capital investments (funding for growth).
            </p>
          </ExplanationCard>

          <ExplanationCard title="Revenue Components" icon={<PieChart className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Sales Revenue:</div>
                <div className="text-sm space-y-1">
                  <div>• Coffee and beverage sales</div>
                  <div>• Food sales (pastries, sandwiches)</div>
                  <div>• Merchandise and retail items</div>
                  <div>• Catering and special events</div>
                  <div className="text-xs text-muted-foreground mt-2">Money earned from daily business operations</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">Capital Investment:</div>
                <div className="text-sm space-y-1">
                  <div>• Owner investments</div>
                  <div>• Investor funding</div>
                  <div>• Business loans</div>
                  <div>• Grants and subsidies</div>
                  <div className="text-xs text-muted-foreground mt-2">Money invested to start or grow the business</div>
                </div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Calculation Method" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Revenue Mix = (Sales Revenue ÷ Total Income) × 100"
              description="Percentage of income from operations vs investments"
            />
            <div className="bg-yellow-50 p-3 rounded-lg mt-3">
              <div className="font-medium text-sm mb-2">Example:</div>
              <div className="text-sm space-y-1">
                <div>• Sales Revenue: $25,000</div>
                <div>• Capital Investment: $5,000</div>
                <div>• Total Income: $30,000</div>
                <div className="font-medium border-t pt-1">Sales Mix: 83% | Investment Mix: 17%</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Numbers" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sales Revenue:</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.salesIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Investment:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(summary.capitalInvestments)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Income:</span>
                  <span>{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Sales: {((summary.salesIncome / summary.totalIncome) * 100).toFixed(1)}% | 
                  Investment: {((summary.capitalInvestments / summary.totalIncome) * 100).toFixed(1)}%
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Healthy Revenue Mix" icon={<CheckCircle className="h-5 w-5" />}>
            <Benchmark
              metric="Sales Revenue Ratio"
              excellent="85-95%"
              good="70-85%"
              fair="50-70%"
              poor="Below 50%"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>A healthy business generates most income from sales, not investments</p>
              <p>High investment ratios may indicate dependency on external funding</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const PerformanceExplanation = ({ summary }: ExplanationProps) => {
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
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Performance Explained
          </SheetTitle>
          <SheetDescription>
            Understanding your profit margin and overall business performance status
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ExplanationCard title="What is Performance?" icon={<Target className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">
              Performance measures how efficiently your coffee shop converts revenue into profit. The key metric is Profit Margin, which shows what percentage of your income becomes profit.
            </p>
            <p className="text-sm text-muted-foreground">
              A higher profit margin indicates better performance and more efficient operations.
            </p>
          </ExplanationCard>

          <ExplanationCard title="Profit Margin Calculation" icon={<Calculator className="h-5 w-5" />}>
            <Formula 
              formula="Profit Margin = (Net Income ÷ Total Revenue) × 100"
              description="Percentage of revenue that becomes profit"
            />
            <div className="bg-green-50 p-3 rounded-lg mt-3">
              <div className="font-medium text-sm mb-2">Example Calculation:</div>
              <div className="text-sm space-y-1">
                <div>• Net Income: $5,000</div>
                <div>• Total Revenue: $25,000</div>
                <div>• Profit Margin: ($5,000 ÷ $25,000) × 100 = 20%</div>
                <div className="text-xs text-muted-foreground mt-2">This means 20¢ of every dollar becomes profit</div>
              </div>
            </div>
          </ExplanationCard>

          <ExplanationCard title="Performance Status Indicators" icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2 text-green-700">Excellent (20%+ margin):</div>
                <div className="text-sm">Strong profitability, efficient operations, room for growth investment</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2 text-blue-700">Good (15-20% margin):</div>
                <div className="text-sm">Healthy business, sustainable operations, competitive position</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2 text-yellow-700">Fair (10-15% margin):</div>
                <div className="text-sm">Average performance, opportunities for improvement exist</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2 text-red-700">Poor (Below 10% margin):</div>
                <div className="text-sm">Needs attention, review costs and pricing strategy</div>
              </div>
            </div>
          </ExplanationCard>

          {summary && (
            <ExplanationCard title="Your Current Performance" icon={<Receipt className="h-5 w-5" />}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Net Income:</span>
                  <span className="font-medium">{formatCurrency(summary.netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Profit Margin:</span>
                  <span className={summary.profitMargin >= 15 ? 'text-green-600' : summary.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}>
                    {summary.profitMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {summary.profitMargin >= 20 ? '🎉 Excellent performance!' :
                   summary.profitMargin >= 15 ? '✅ Good performance' :
                   summary.profitMargin >= 10 ? '⚠️ Fair performance' :
                   '🚨 Needs improvement'}
                </div>
              </div>
            </ExplanationCard>
          )}

          <ExplanationCard title="Improving Performance" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Increase Revenue:</strong> Upsell, introduce new products, extend hours</p>
              <p>• <strong>Reduce Costs:</strong> Negotiate with suppliers, reduce waste, optimize staffing</p>
              <p>• <strong>Improve Efficiency:</strong> Streamline operations, train staff, upgrade equipment</p>
              <p>• <strong>Monitor Trends:</strong> Track performance monthly to spot issues early</p>
            </div>
          </ExplanationCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}