import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Users, Coffee, Target } from 'lucide-react'

export function PlanningDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Planning Dashboard</h2>
        <p className="text-muted-foreground">
          Create and manage daily, weekly, and monthly operational plans for your coffee shop
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Targets</p>
                <p className="text-2xl font-bold">150</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Coffee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planning Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick start templates for different planning scenarios
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Daily Operations Template */}
            <Card className="border-dashed border-2 hover:border-solid transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Daily Operations</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Plan daily production, staffing, and sales targets
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Template</Badge>
                    <Badge variant="outline" className="text-xs">Quick Start</Badge>
                  </div>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Planning Template */}
            <Card className="border-dashed border-2 hover:border-solid transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Weekly Planning</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Weekly inventory, production schedules, and staff planning
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Template</Badge>
                    <Badge variant="outline" className="text-xs">Comprehensive</Badge>
                  </div>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Strategy Template */}
            <Card className="border-dashed border-2 hover:border-solid transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Monthly Strategy</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Long-term planning, menu updates, and growth strategies
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Template</Badge>
                    <Badge variant="outline" className="text-xs">Strategic</Badge>
                  </div>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Plans</CardTitle>
            <Button size="sm">
              Create New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for recent plans */}
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first operational plan to get started with structured planning.
              </p>
              <Button>
                Create Your First Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current status of your coffee shop systems
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Setup Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ingredients</span>
                  <Badge variant="default">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Products</span>
                  <Badge variant="default">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Menus</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Warehouse</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Operations</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Production</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sales Tracking</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reporting</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
