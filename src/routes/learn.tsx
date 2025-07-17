import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Calculator,
  Receipt,
  TrendingUp,
  DollarSign,
  PieChart,
  ChevronRight,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

function LearnPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModule, setActiveModule] = useState('accounting')

  // Learning modules that can be expanded over time
  const learningModules = [
    {
      id: 'accounting',
      title: t('learn.modules.accounting.title'),
      description: t('learn.modules.accounting.description'),
      icon: Receipt,
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
      route: '/accounting',
      available: true,
    },
    {
      id: 'operations',
      title: t('learn.modules.operations.title'),
      description: t('learn.modules.operations.description'),
      icon: TrendingUp,
      color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
      route: '/operations',
      available: false,
    },
    {
      id: 'warehouse',
      title: t('learn.modules.warehouse.title'),
      description: t('learn.modules.warehouse.description'),
      icon: Calculator,
      color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
      route: '/warehouse',
      available: false,
    },
    {
      id: 'analytics',
      title: t('learn.modules.analytics.title'),
      description: t('learn.modules.analytics.description'),
      icon: PieChart,
      color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
      route: '/analytics',
      available: false,
    },
  ]

  // Accounting learning content
  const accountingTopics = [
    {
      id: 'basic-concepts',
      title: t('learn.accountingTopics.basicConcepts.title'),
      description: t('learn.accountingTopics.basicConcepts.description'),
      topics: [
        {
          term: t('learn.accountingTopics.basicConcepts.transactions.term'),
          definition: t('learn.accountingTopics.basicConcepts.transactions.definition'),
          example: t('learn.accountingTopics.basicConcepts.transactions.example'),
          context: t('learn.accountingTopics.basicConcepts.transactions.context')
        },
        {
          term: t('learn.accountingTopics.basicConcepts.revenue.term'),
          definition: t('learn.accountingTopics.basicConcepts.revenue.definition'),
          example: t('learn.accountingTopics.basicConcepts.revenue.example'),
          context: t('learn.accountingTopics.basicConcepts.revenue.context')
        },
        {
          term: t('learn.accountingTopics.basicConcepts.expenses.term'),
          definition: t('learn.accountingTopics.basicConcepts.expenses.definition'),
          example: t('learn.accountingTopics.basicConcepts.expenses.example'),
          context: t('learn.accountingTopics.basicConcepts.expenses.context')
        },
        {
          term: t('learn.accountingTopics.basicConcepts.netIncome.term'),
          definition: t('learn.accountingTopics.basicConcepts.netIncome.definition'),
          example: t('learn.accountingTopics.basicConcepts.netIncome.example'),
          context: t('learn.accountingTopics.basicConcepts.netIncome.context')
        }
      ]
    },
    {
      id: 'transaction-types',
      title: t('learn.accountingTopics.transactionTypes.title'),
      description: t('learn.accountingTopics.transactionTypes.description'),
      topics: [
        {
          term: t('learn.accountingTopics.transactionTypes.salesIncome.term'),
          definition: t('learn.accountingTopics.transactionTypes.salesIncome.definition'),
          example: t('learn.accountingTopics.transactionTypes.salesIncome.example'),
          context: t('learn.accountingTopics.transactionTypes.salesIncome.context')
        },
        {
          term: t('learn.accountingTopics.transactionTypes.operatingExpenses.term'),
          definition: t('learn.accountingTopics.transactionTypes.operatingExpenses.definition'),
          example: t('learn.accountingTopics.transactionTypes.operatingExpenses.example'),
          context: t('learn.accountingTopics.transactionTypes.operatingExpenses.context')
        },
        {
          term: t('learn.accountingTopics.transactionTypes.fixedCosts.term'),
          definition: t('learn.accountingTopics.transactionTypes.fixedCosts.definition'),
          example: t('learn.accountingTopics.transactionTypes.fixedCosts.example'),
          context: t('learn.accountingTopics.transactionTypes.fixedCosts.context')
        },
        {
          term: t('learn.accountingTopics.transactionTypes.variableCosts.term'),
          definition: t('learn.accountingTopics.transactionTypes.variableCosts.definition'),
          example: t('learn.accountingTopics.transactionTypes.variableCosts.example'),
          context: t('learn.accountingTopics.transactionTypes.variableCosts.context')
        },
        {
          term: t('learn.accountingTopics.transactionTypes.capitalInvestment.term'),
          definition: t('learn.accountingTopics.transactionTypes.capitalInvestment.definition'),
          example: t('learn.accountingTopics.transactionTypes.capitalInvestment.example'),
          context: t('learn.accountingTopics.transactionTypes.capitalInvestment.context')
        }
      ]
    },
    {
      id: 'financial-health',
      title: t('learn.accountingTopics.financialHealth.title'),
      description: t('learn.accountingTopics.financialHealth.description'),
      topics: [
        {
          term: t('learn.accountingTopics.financialHealth.grossProfit.term'),
          definition: t('learn.accountingTopics.financialHealth.grossProfit.definition'),
          example: t('learn.accountingTopics.financialHealth.grossProfit.example'),
          context: t('learn.accountingTopics.financialHealth.grossProfit.context')
        },
        {
          term: t('learn.accountingTopics.financialHealth.profitMargin.term'),
          definition: t('learn.accountingTopics.financialHealth.profitMargin.definition'),
          example: t('learn.accountingTopics.financialHealth.profitMargin.example'),
          context: t('learn.accountingTopics.financialHealth.profitMargin.context')
        },
        {
          term: t('learn.accountingTopics.financialHealth.breakEven.term'),
          definition: t('learn.accountingTopics.financialHealth.breakEven.definition'),
          example: t('learn.accountingTopics.financialHealth.breakEven.example'),
          context: t('learn.accountingTopics.financialHealth.breakEven.context')
        },
        {
          term: t('learn.accountingTopics.financialHealth.cashFlow.term'),
          definition: t('learn.accountingTopics.financialHealth.cashFlow.definition'),
          example: t('learn.accountingTopics.financialHealth.cashFlow.example'),
          context: t('learn.accountingTopics.financialHealth.cashFlow.context')
        }
      ]
    },
    {
      id: 'cost-management',
      title: t('learn.accountingTopics.costManagement.title'),
      description: t('learn.accountingTopics.costManagement.description'),
      topics: [
        {
          term: t('learn.accountingTopics.costManagement.cogs.term'),
          definition: t('learn.accountingTopics.costManagement.cogs.definition'),
          example: t('learn.accountingTopics.costManagement.cogs.example'),
          context: t('learn.accountingTopics.costManagement.cogs.context')
        },
        {
          term: t('learn.accountingTopics.costManagement.foodCostPct.term'),
          definition: t('learn.accountingTopics.costManagement.foodCostPct.definition'),
          example: t('learn.accountingTopics.costManagement.foodCostPct.example'),
          context: t('learn.accountingTopics.costManagement.foodCostPct.context')
        },
        {
          term: t('learn.accountingTopics.costManagement.laborCostPct.term'),
          definition: t('learn.accountingTopics.costManagement.laborCostPct.definition'),
          example: t('learn.accountingTopics.costManagement.laborCostPct.example'),
          context: t('learn.accountingTopics.costManagement.laborCostPct.context')
        },
        {
          term: t('learn.accountingTopics.costManagement.overheadCosts.term'),
          definition: t('learn.accountingTopics.costManagement.overheadCosts.definition'),
          example: t('learn.accountingTopics.costManagement.overheadCosts.example'),
          context: t('learn.accountingTopics.costManagement.overheadCosts.context')
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
          {t('learn.page.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('learn.page.description')}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('learn.searchPlaceholder')}
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
                      {t('learn.available')}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {t('learn.comingSoon')}
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
                      {t('learn.startLearning')}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {t('learn.comingSoon')}
                    </Button>
                  )}
                  <Link to={module.route} className="text-sm text-muted-foreground hover:text-foreground">
                    {t('learn.viewSection', { section: module.title.split(' ')[0] })}
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
              {t('learn.accounting.title')}
            </CardTitle>
            <CardDescription>
              {t('learn.accounting.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic-concepts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic-concepts">{t('learn.tabs.basics')}</TabsTrigger>
                <TabsTrigger value="transaction-types">{t('learn.tabs.transactions')}</TabsTrigger>
                <TabsTrigger value="financial-health">{t('learn.tabs.financialHealth')}</TabsTrigger>
                <TabsTrigger value="cost-management">{t('learn.tabs.costManagement')}</TabsTrigger>
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
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">{t('learn.section.definition')}</h4>
                            <p className="text-sm">{topic.definition}</p>
                          </div>
                          <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">{t('learn.section.example')}</h4>
                            <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                              {topic.example}
                            </p>
                          </div>
                          <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">{t('learn.section.context')}</h4>
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
              <h3 className="font-semibold mb-3">{t('learn.quickLinks.title')}</h3>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/accounting">
                    <Receipt className="h-4 w-4 mr-2" />
                    {t('learn.quickLinks.goToAccounting')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/cogs">
                    <Calculator className="h-4 w-4 mr-2" />
                    {t('learn.quickLinks.cogsCalculator')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('learn.quickLinks.viewAnalytics')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {t('learn.quickLinks.financialDashboard')}
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
            <h3 className="text-lg font-semibold mb-2">{t('learn.comingSoonMessage.title')}</h3>
            <p className="text-muted-foreground">
              {t('learn.comingSoonMessage.description')}
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