/**
 * Financial Explanation Sheets Component - Part 4
 * 
 * Final explanation sheets for Key Metrics and Quick Stats.
 */

import { Info, TrendingDown, DollarSign, Target, CheckCircle, BarChart3, Activity, Zap, Gauge, TrendingUp } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'

interface ExplanationProps {
  summary?: FinancialSummary | null
  profitabilityScore?: number
  liquidityScore?: number
  efficiencyScore?: number
  growthScore?: number
  monthlyBurnRate?: number
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
  description: string
}

function ScoreDisplay({ score, label, description }: ScoreDisplayProps) {
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}:</span>
        <div className="text-right">
          <div className={`font-medium text-lg ${getScoreColor(score)}`}>
            {Math.round(score * 10) / 10}/100
          </div>
          <div className="text-sm text-muted-foreground">
            {getScoreLabel(score)}
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <Progress value={score} className="h-2" />
    </div>
  )
}

// Key Metrics Explanation
export const KeyMetricsExplanation = ({ profitabilityScore, liquidityScore, efficiencyScore, growthScore }: ExplanationProps) => {
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
              <Gauge className="h-5 w-5" />
              Key Metrics Explained
            </SheetTitle>
            <SheetDescription>
              Understanding the four pillars of financial health assessment
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <ExplanationCard title="What are Key Metrics?" icon={<BarChart3 className="h-5 w-5" />}>
              <p className="text-sm text-muted-foreground">
                Key Metrics are the four fundamental areas that determine your coffee shop's financial health: Profitability, Liquidity, Efficiency, and Growth. Each metric provides insights into different aspects of your business performance.
              </p>
              <p className="text-sm text-muted-foreground">
                Together, these metrics give you a comprehensive view of your business's financial strength and areas for improvement.
              </p>
            </ExplanationCard>

            <ExplanationCard title="1. Profitability" icon={<DollarSign className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Measures how effectively your coffee shop converts revenue into profit.
                </p>
                <Formula 
                  formula="Profit Margin = (Net Income ÷ Total Revenue) × 100"
                  description="Percentage of revenue that becomes profit"
                />
                <Benchmark
                  metric="Coffee Shop Profitability"
                  excellent="20%+ margin"
                  good="15-20% margin"
                  fair="10-15% margin"
                  poor="Below 10% margin"
                />
                {profitabilityScore !== undefined && (
                  <ScoreDisplay 
                    score={profitabilityScore} 
                    label="Your Profitability Score" 
                    description="Based on profit margins and income generation efficiency"
                  />
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="2. Liquidity" icon={<Activity className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Measures your ability to meet short-term obligations and maintain cash flow.
                </p>
                <Formula 
                  formula="Cash Flow Ratio = Cash Inflow ÷ Cash Outflow"
                  description="Ability to cover expenses with incoming cash"
                />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Key Indicators:</strong></div>
                    <div>• Cash reserves vs monthly expenses</div>
                    <div>• Payment collection speed</div>
                    <div>• Ability to pay suppliers on time</div>
                    <div>• Emergency fund availability</div>
                  </div>
                </div>
                {liquidityScore !== undefined && (
                  <ScoreDisplay 
                    score={liquidityScore} 
                    label="Your Liquidity Score" 
                    description="Based on cash flow patterns and payment capabilities"
                  />
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="3. Efficiency" icon={<Zap className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Measures how well you control costs and utilize resources to generate revenue.
                </p>
                <Formula 
                  formula="Operating Efficiency = Operating Expenses ÷ Total Revenue"
                  description="Lower percentage indicates better cost control"
                />
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Efficiency Factors:</strong></div>
                    <div>• Cost of goods sold percentage</div>
                    <div>• Labor cost optimization</div>
                    <div>• Waste reduction</div>
                    <div>• Equipment utilization</div>
                  </div>
                </div>
                {efficiencyScore !== undefined && (
                  <ScoreDisplay 
                    score={efficiencyScore} 
                    label="Your Efficiency Score" 
                    description="Based on cost control and resource utilization"
                  />
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="4. Growth" icon={<TrendingUp className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Measures revenue trends and your business's potential for expansion.
                </p>
                <Formula 
                  formula="Growth Rate = (Current Period Revenue - Previous Period) ÷ Previous Period × 100"
                  description="Percentage increase in revenue over time"
                />
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Growth Indicators:</strong></div>
                    <div>• Monthly revenue trends</div>
                    <div>• Customer base expansion</div>
                    <div>• Average transaction value increase</div>
                    <div>• Market share growth</div>
                  </div>
                </div>
                {growthScore !== undefined && (
                  <ScoreDisplay 
                    score={growthScore} 
                    label="Your Growth Score" 
                    description="Based on revenue trends and expansion potential"
                  />
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="Improving Key Metrics" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Profitability:</strong> Optimize pricing, reduce waste, improve product mix</p>
                <p>• <strong>Liquidity:</strong> Manage inventory, speed up collections, build cash reserves</p>
                <p>• <strong>Efficiency:</strong> Automate processes, negotiate better supplier terms, train staff</p>
                <p>• <strong>Growth:</strong> Expand marketing, improve customer experience, add revenue streams</p>
              </div>
            </ExplanationCard>
          </div>
        </SheetContent>
      </Sheet>
  )
}

// Quick Stats Explanation
export const QuickStatsExplanation = ({ summary, monthlyBurnRate }: ExplanationProps) => {
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
              <Zap className="h-5 w-5" />
              Quick Stats Explained
            </SheetTitle>
            <SheetDescription>
              Understanding key performance indicators at a glance
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <ExplanationCard title="What are Quick Stats?" icon={<Activity className="h-5 w-5" />}>
              <p className="text-sm text-muted-foreground">
                Quick Stats provide instant insights into your coffee shop's most important financial metrics. These four key indicators give you a rapid assessment of business performance without diving into detailed reports.
              </p>
              <p className="text-sm text-muted-foreground">
                They're designed for daily monitoring and quick decision-making.
              </p>
            </ExplanationCard>

            <ExplanationCard title="1. Profit Margin %" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Shows what percentage of each dollar in sales becomes profit.
                </p>
                <Formula 
                  formula="Profit Margin % = (Net Income ÷ Total Revenue) × 100"
                  description="Higher percentage = more profitable business"
                />
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>Example: $5,000 profit from $25,000 sales</div>
                    <div>Profit Margin = ($5,000 ÷ $25,000) × 100 = 20%</div>
                    <div className="font-medium">You keep 20¢ from every dollar sold</div>
                  </div>
                </div>
                {summary && (
                  <div className="flex justify-between items-center">
                    <span>Your Profit Margin:</span>
                    <div className={`font-medium text-lg ${
                      summary.profitMargin >= 15 ? 'text-green-600' :
                      summary.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {summary.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="2. Monthly Burn Rate" icon={<TrendingDown className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The amount of cash your business spends each month to operate.
                </p>
                <Formula 
                  formula="Monthly Burn Rate = Total Monthly Expenses"
                  description="How much cash you need each month to stay operational"
                />
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Why It Matters:</strong></div>
                    <div>• Shows how long your cash will last</div>
                    <div>• Helps plan for slow periods</div>
                    <div>• Critical for cash flow management</div>
                    <div>• Guides expense reduction efforts</div>
                  </div>
                </div>
                {monthlyBurnRate !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Your Monthly Burn Rate:</span>
                    <div className="font-medium text-lg text-red-600">
                      {formatCurrency(monthlyBurnRate)}
                    </div>
                  </div>
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="3. Cash Flow" icon={<Activity className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The net amount of cash moving in and out of your business.
                </p>
                <Formula 
                  formula="Cash Flow = Cash Inflows - Cash Outflows"
                  description="Positive = more money coming in than going out"
                />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Cash Flow Types:</strong></div>
                    <div>• <span className="text-green-600">Positive:</span> Business generating cash</div>
                    <div>• <span className="text-gray-600">Break-even:</span> Cash in = cash out</div>
                    <div>• <span className="text-red-600">Negative:</span> Spending more than earning</div>
                  </div>
                </div>
                {summary && (
                  <div className="flex justify-between items-center">
                    <span>Your Cash Flow:</span>
                    <div className={`font-medium text-lg ${
                      summary.cashFlow > 0 ? 'text-green-600' :
                      summary.cashFlow === 0 ? 'text-gray-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(summary.cashFlow)}
                    </div>
                  </div>
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="4. Net Income" icon={<DollarSign className="h-5 w-5" />}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your business's bottom line - total income minus total expenses.
                </p>
                <Formula 
                  formula="Net Income = Total Income - Total Expenses"
                  description="The actual profit your business generated"
                />
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Net Income Significance:</strong></div>
                    <div>• Shows true business profitability</div>
                    <div>• Indicates sustainability</div>
                    <div>• Basis for growth investments</div>
                    <div>• Owner's return on investment</div>
                  </div>
                </div>
                {summary && (
                  <div className="flex justify-between items-center">
                    <span>Your Net Income:</span>
                    <div className={`font-medium text-lg ${
                      summary.netIncome > 0 ? 'text-green-600' :
                      summary.netIncome === 0 ? 'text-gray-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(summary.netIncome)}
                    </div>
                  </div>
                )}
              </div>
            </ExplanationCard>

            <ExplanationCard title="Coffee Shop Benchmarks" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-3">
                <Benchmark
                  metric="Profit Margin"
                  excellent="20%+ (Top tier)"
                  good="15-20% (Strong)"
                  fair="10-15% (Average)"
                  poor="Below 10% (Weak)"
                />
                <div className="mt-3">
                  <Benchmark
                    metric="Monthly Burn Rate"
                    excellent="Below $8,000"
                    good="$8,000-12,000"
                    fair="$12,000-18,000"
                    poor="Above $18,000"
                  />
                </div>
              </div>
            </ExplanationCard>

            <ExplanationCard title="Using Quick Stats for Decisions" icon={<CheckCircle className="h-5 w-5" />}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Daily Monitoring:</strong> Check these metrics every morning</p>
                <p>• <strong>Trend Analysis:</strong> Compare with previous weeks/months</p>
                <p>• <strong>Quick Decisions:</strong> Spot problems before they become critical</p>
                <p>• <strong>Goal Setting:</strong> Set targets for each metric</p>
                <p>• <strong>Performance Review:</strong> Assess overall business health weekly</p>
              </div>
            </ExplanationCard>
          </div>
        </SheetContent>
      </Sheet>
  )
}