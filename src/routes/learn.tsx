import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { BookOpen, Calculator, Receipt, TrendingUp, DollarSign, PieChart, ChevronRight, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

function LearnPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModule, setActiveModule] = useState('accounting')

  // Learning modules that can be expanded over time
  const learningModules = [
    {
      id: 'accounting',
      title: 'Accounting & Financial Management',
      description: 'Learn essential accounting concepts for your coffee shop business',
      icon: Receipt,
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
      route: '/accounting',
      available: true
    },
    {
      id: 'operations',
      title: 'Operations & Sales Management',
      description: 'Understanding sales targets, recording, and operational metrics',
      icon: TrendingUp,
      color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
      route: '/operations',
      available: false
    },
    {
      id: 'warehouse',
      title: 'Inventory & Warehouse Management',
      description: 'Stock management, inventory tracking, and warehouse operations',
      icon: Calculator,
      color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
      route: '/warehouse',
      available: false
    },
    {
      id: 'analytics',
      title: 'Business Analytics & Reporting',
      description: 'Understanding financial reports, metrics, and business intelligence',
      icon: PieChart,
      color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
      route: '/analytics',
      available: false
    }
  ]

  // Accounting learning content
  const accountingTopics = [
    {
      id: 'basic-concepts',
      title: 'Basic Accounting Concepts',
      description: 'Fundamental accounting principles for coffee shop owners',
      topics: [
        {
          term: 'Transactions',
          definition: 'Any business activity that involves money coming in or going out of your coffee shop.',
          example: 'When you sell a latte for $5, that\'s a sales transaction. When you buy coffee beans for $50, that\'s an expense transaction.',
          context: 'In our app, all your business activities are recorded as transactions in the Accounting section.'
        },
        {
          term: 'Revenue (Income)',
          definition: 'All the money your coffee shop earns from selling products and services.',
          example: 'If you sell 100 lattes at $5 each, your revenue is $500 for that period.',
          context: 'Track your daily sales revenue in the Operations section and view totals in Accounting.'
        },
        {
          term: 'Expenses',
          definition: 'All the money your coffee shop spends to operate the business.',
          example: 'Rent ($2000/month), coffee beans ($500/month), staff wages ($3000/month) are all expenses.',
          context: 'Manage recurring expenses and track all business costs in the Accounting section.'
        },
        {
          term: 'Net Income (Profit/Loss)',
          definition: 'What\'s left after subtracting all expenses from your revenue. Positive = profit, negative = loss.',
          example: 'Revenue $10,000 - Expenses $8,000 = Net Income $2,000 (profit)',
          context: 'View your net income in the Financial Summary cards on the Accounting dashboard.'
        }
      ]
    },
    {
      id: 'transaction-types',
      title: 'Types of Business Transactions',
      description: 'Understanding different transaction categories in your coffee shop',
      topics: [
        {
          term: 'Sales Income',
          definition: 'Money earned from selling coffee, pastries, and other products to customers.',
          example: 'Daily sales of $500 from selling lattes, cappuccinos, and muffins.',
          context: 'Automatically tracked when you record sales in the Operations section.'
        },
        {
          term: 'Operating Expenses',
          definition: 'Day-to-day costs needed to run your coffee shop.',
          example: 'Staff wages, utilities, cleaning supplies, marketing costs.',
          context: 'Add these in the Accounting section or set up recurring expenses for monthly costs.'
        },
        {
          term: 'Fixed Costs',
          definition: 'Expenses that stay the same each month regardless of how much you sell.',
          example: 'Rent ($2000/month), insurance ($200/month), loan payments ($500/month).',
          context: 'Set these up in the Financial Terms sheet or as recurring expenses.'
        },
        {
          term: 'Variable Costs (COGS)',
          definition: 'Costs that change based on how much you produce or sell.',
          example: 'Coffee beans, milk, sugar - the more drinks you make, the more you spend on these.',
          context: 'Calculate these using the COGS Calculator and track in Variable COGS sheet.'
        },
        {
          term: 'Capital Investment',
          definition: 'Money invested to start or expand your business, including equipment purchases.',
          example: 'Buying an espresso machine ($5000), furniture ($2000), initial inventory ($1000).',
          context: 'Record these in the Initial Capital sheet or Fixed Assets section.'
        }
      ]
    },
    {
      id: 'financial-health',
      title: 'Understanding Financial Health',
      description: 'Key indicators to monitor your coffee shop\'s financial performance',
      topics: [
        {
          term: 'Gross Profit',
          definition: 'Revenue minus the direct cost of making your products (COGS).',
          example: 'If you sell $1000 worth of coffee and the beans/milk cost $300, gross profit is $700.',
          context: 'View this in your Financial Summary - it shows how efficiently you\'re producing.'
        },
        {
          term: 'Profit Margin',
          definition: 'What percentage of each sale becomes profit after all expenses.',
          example: 'If you make $2 profit on a $5 latte, your profit margin is 40%.',
          context: 'Higher margins mean your business is more profitable per sale.'
        },
        {
          term: 'Break-even Point',
          definition: 'The amount of sales needed to cover all your expenses (no profit, no loss).',
          example: 'If your monthly expenses are $8000 and average profit per sale is $2, you need 4000 sales to break even.',
          context: 'Use the Financial Dashboard to see if you\'re above or below break-even.'
        },
        {
          term: 'Cash Flow',
          definition: 'The timing of money coming in versus money going out.',
          example: 'You might be profitable but have cash flow problems if customers pay late but you pay suppliers immediately.',
          context: 'Monitor this in the Financial Health indicators on your dashboard.'
        }
      ]
    },
    {
      id: 'cost-management',
      title: 'Cost Management & Control',
      description: 'Managing and optimizing your coffee shop costs',
      topics: [
        {
          term: 'Cost of Goods Sold (COGS)',
          definition: 'The direct cost of ingredients and materials used to make your products.',
          example: 'For a latte: coffee beans ($0.50), milk ($0.30), cup ($0.10) = COGS of $0.90',
          context: 'Calculate precise COGS using our COGS Calculator for each menu item.'
        },
        {
          term: 'Food Cost Percentage',
          definition: 'What percentage of your sales goes to ingredient costs.',
          example: 'If you sell $1000 and spend $300 on ingredients, your food cost percentage is 30%.',
          context: 'Industry standard for coffee shops is typically 25-35%.'
        },
        {
          term: 'Labor Cost Percentage',
          definition: 'What percentage of your sales goes to staff wages and benefits.',
          example: 'If you sell $1000 and pay $250 in wages, your labor cost percentage is 25%.',
          context: 'Track this by recording staff costs in Operating Expenses.'
        },
        {
          term: 'Overhead Costs',
          definition: 'Indirect costs needed to run your business but not directly tied to making products.',
          example: 'Rent, utilities, insurance, accounting fees, marketing.',
          context: 'These are typically recorded as Fixed Costs or Operating Expenses.'
        }
      ]
    }
  ]

  const filteredTopics = accountingTopics.map(section => ({
    ...section,
    topics: section.topics.filter(topic => 
      searchQuery === '' || 
      topic.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.definition.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.topics.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Learning Hub
        </h1>
        <p className="text-muted-foreground">
          Master financial concepts and business management skills for your coffee shop
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search learning topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Learning Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningModules.map((module) => {
          const IconComponent = module.icon
          return (
            <Card key={module.id} className={`${module.color} transition-all hover:shadow-md`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6" />
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  {module.available ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  {module.available ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveModule(module.id)}
                      className="flex items-center gap-2"
                    >
                      Start Learning
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  )}
                  <Link to={module.route} className="text-sm text-muted-foreground hover:text-foreground">
                    View {module.title.split(' ')[0]} Section →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Learning Content */}
      {activeModule === 'accounting' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Accounting & Financial Management Learning
            </CardTitle>
            <CardDescription>
              Essential financial concepts every coffee shop owner should understand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic-concepts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic-concepts">Basics</TabsTrigger>
                <TabsTrigger value="transaction-types">Transactions</TabsTrigger>
                <TabsTrigger value="financial-health">Financial Health</TabsTrigger>
                <TabsTrigger value="cost-management">Cost Management</TabsTrigger>
              </TabsList>
              
              {filteredTopics.map((section) => (
                <TabsContent key={section.id} value={section.id} className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {section.topics.map((topic) => (
                      <Card key={topic.term} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-blue-700 dark:text-blue-300">
                            {topic.term}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Definition</h4>
                            <p className="text-sm">{topic.definition}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Coffee Shop Example</h4>
                            <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                              {topic.example}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">How it works in our app</h4>
                            <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                              {topic.context}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Quick Links to Related Sections */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Ready to apply what you've learned?</h3>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/accounting">
                    <Receipt className="h-4 w-4 mr-2" />
                    Go to Accounting
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/cogs">
                    <Calculator className="h-4 w-4 mr-2" />
                    COGS Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financial Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for other modules */}
      {activeModule !== 'accounting' && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Learning Module Coming Soon</h3>
            <p className="text-muted-foreground">
              We're working on comprehensive learning materials for this module.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/learn')({ 
  component: LearnPage 
})