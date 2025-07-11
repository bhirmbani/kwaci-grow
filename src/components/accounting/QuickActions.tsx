/**
 * Quick Actions Component
 * 
 * Provides quick access buttons for common accounting tasks:
 * - Record different types of transactions
 * - Access related financial management features
 * - Navigate to specialized modules
 */

import { useState } from 'react'
import {
  Plus,
  Receipt,
  CreditCard,
  TrendingUp,
  Package,
  DollarSign,
  Building,
  Calculator,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Link } from '@tanstack/react-router'
import { TransactionForm } from './TransactionForm'
import type { TransactionType } from '@/lib/types/accounting'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: 'sheet' | 'navigate' | 'external'
  target?: string
  variant?: 'default' | 'secondary' | 'outline'
  badge?: string
  transactionType?: TransactionType
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'record-sale',
    title: 'Record Sale',
    description: 'Add sales income transaction',
    icon: TrendingUp,
    action: 'sheet',
    variant: 'default',
    badge: 'Income',
    transactionType: 'SALES_INCOME'
  },
  {
    id: 'add-expense',
    title: 'Add Expense',
    description: 'Record operating expense',
    icon: CreditCard,
    action: 'sheet',
    variant: 'outline',
    badge: 'Expense',
    transactionType: 'OPERATING_EXPENSE'
  },
  {
    id: 'capital-investment',
    title: 'Capital Investment',
    description: 'Record capital injection',
    icon: DollarSign,
    action: 'sheet',
    variant: 'secondary',
    badge: 'Capital',
    transactionType: 'CAPITAL_INVESTMENT'
  },
  {
    id: 'asset-purchase',
    title: 'Asset Purchase',
    description: 'Add fixed asset',
    icon: Building,
    action: 'sheet',
    variant: 'outline',
    badge: 'Asset',
    transactionType: 'ASSET_PURCHASE'
  },
  {
    id: 'warehouse',
    title: 'Inventory',
    description: 'Manage stock & purchases',
    icon: Package,
    action: 'navigate',
    target: '/warehouse',
    variant: 'outline'
  },
  {
    id: 'cogs-calculator',
    title: 'COGS Calculator',
    description: 'Calculate product costs',
    icon: Calculator,
    action: 'navigate',
    target: '/cogs',
    variant: 'outline'
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    description: 'View detailed reports',
    icon: FileText,
    action: 'navigate',
    target: '/reports',
    variant: 'outline'
  }
]

export function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleActionClick = (action: QuickAction) => {
    if (action.action === 'sheet') {
      setSelectedAction(action)
      setIsSheetOpen(true)
    }
    // Navigation actions are handled by the Link component
    // External actions would be handled here if needed
  }

  const handleTransactionSuccess = () => {
    setIsSheetOpen(false)
    setSelectedAction(null)
    // The useAccounting hook will automatically refresh the data
  }

  const handleTransactionCancel = () => {
    setIsSheetOpen(false)
    setSelectedAction(null)
  }

  const renderActionButton = (action: QuickAction) => {
    const ButtonContent = (
      <Button
        variant={action.variant || 'outline'}
        className="h-auto p-4 flex flex-col items-center gap-2 relative"
        onClick={() => handleActionClick(action)}
      >
        {action.badge && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5"
          >
            {action.badge}
          </Badge>
        )}
        <action.icon className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium text-sm">{action.title}</div>
          <div className="text-xs text-muted-foreground">{action.description}</div>
        </div>
      </Button>
    )

    if (action.action === 'navigate' && action.target) {
      return (
        <Link key={action.id} to={action.target}>
          {ButtonContent}
        </Link>
      )
    }

    if (action.action === 'sheet') {
      return ButtonContent
    }

    return ButtonContent
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common accounting tasks and financial management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {QUICK_ACTIONS.map(renderActionButton)}
          </div>

          {/* Additional Help Text */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Getting Started</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Record sales and income transactions</li>
              <li>• Add operating and recurring expenses</li>
              <li>• Track capital investments and assets</li>
              <li>• Monitor financial health and cash flow</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedAction?.title || 'Add Transaction'}
            </SheetTitle>
            <SheetDescription>
              {selectedAction?.description || 'Record a new financial transaction'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedAction?.transactionType && (
              <TransactionForm
                defaultType={selectedAction.transactionType}
                onSuccess={handleTransactionSuccess}
                onCancel={handleTransactionCancel}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
