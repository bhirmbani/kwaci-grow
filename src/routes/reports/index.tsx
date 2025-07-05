import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { PieChart, TrendingUp, FileText } from 'lucide-react'

function Reports() {
  const reportTypes = [
    {
      title: 'Financial Overview',
      description: 'Comprehensive financial dashboard and metrics',
      icon: PieChart,
      path: '/reports/financial',
    },
    {
      title: 'Profit Analysis',
      description: 'Detailed profit and loss analysis',
      icon: TrendingUp,
      path: '/reports/profit',
    },
    {
      title: 'Cost Breakdown',
      description: 'Detailed breakdown of all costs',
      icon: FileText,
      path: '/reports/costs',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Financial reports and analytics for your business.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Link key={report.path} to={report.path}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <report.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reports/')({
  component: Reports,
})
