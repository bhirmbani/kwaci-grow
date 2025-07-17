/**
 * Quick Actions Component
 * 
 * Provides quick access buttons for common accounting tasks:
 * - Record different types of transactions
 * - Access related financial management features
 * - Navigate to specialized modules
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
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
} from '@/components/ui/sheet'
import { Link } from '@tanstack/react-router'
import { TransactionForm } from './TransactionForm'
import type { TransactionType } from '@/lib/types/accounting'

interface QuickAction {
  id: string
  titleKey: string
  descriptionKey: string
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
    titleKey: 'accounting.quickActions.actions.recordSale.title',
    descriptionKey: 'accounting.quickActions.actions.recordSale.description',
    icon: TrendingUp,
    action: 'sheet',
    variant: 'default',
    badge: 'Income',
    transactionType: 'SALES_INCOME'
  },
  {
    id: 'add-expense',
    titleKey: 'accounting.quickActions.actions.addExpense.title',
    descriptionKey: 'accounting.quickActions.actions.addExpense.description',
    icon: CreditCard,
    action: 'sheet',
    variant: 'outline',
    badge: 'Expense',
    transactionType: 'OPERATING_EXPENSE'
  },
  {
    id: 'capital-investment',
    titleKey: 'accounting.quickActions.actions.capitalInvestment.title',
    descriptionKey: 'accounting.quickActions.actions.capitalInvestment.description',
    icon: DollarSign,
    action: 'sheet',
    variant: 'secondary',
    badge: 'Capital',
    transactionType: 'CAPITAL_INVESTMENT'
  },
  {
    id: 'asset-purchase',
    titleKey: 'accounting.quickActions.actions.assetPurchase.title',
    descriptionKey: 'accounting.quickActions.actions.assetPurchase.description',
    icon: Building,
    action: 'sheet',
    variant: 'outline',
    badge: 'Asset',
    transactionType: 'ASSET_PURCHASE'
  },
  {
    id: 'warehouse',
    titleKey: 'accounting.quickActions.actions.inventory.title',
    descriptionKey: 'accounting.quickActions.actions.inventory.description',
    icon: Package,
    action: 'navigate',
    target: '/warehouse',
    variant: 'outline'
  },
  {
    id: 'cogs-calculator',
    titleKey: 'accounting.quickActions.actions.cogsCalculator.title',
    descriptionKey: 'accounting.quickActions.actions.cogsCalculator.description',
    icon: Calculator,
    action: 'navigate',
    target: '/cogs',
    variant: 'outline'
  },
  {
    id: 'reports',
    titleKey: 'accounting.quickActions.actions.reports.title',
    descriptionKey: 'accounting.quickActions.actions.reports.description',
    icon: FileText,
    action: 'navigate',
    target: '/reports',
    variant: 'outline'
  }
]

export function QuickActions() {
  const { t } = useTranslation()
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
        className="h-28 w-full p-2 flex flex-col items-center justify-between relative overflow-hidden"
        onClick={() => handleActionClick(action)}
      >
        {action.badge && (
          <Badge 
            variant="default" 
            className="absolute top-1 right-1 text-xs px-1.5 py-0.5 z-10"
          >
          {t(`accounting.quickActions.badges.${action.badge.toLowerCase()}`, action.badge)}
          </Badge>
        )}
        <div className="flex-shrink-0 mt-1">
          <action.icon className="h-5 w-5" />
        </div>
        <div className="text-center flex-1 flex flex-col justify-center px-1 min-h-0">
          <div className="font-medium text-xs leading-none mb-1 line-clamp-1">{t(action.titleKey)}</div>
          <div className="text-xs text-muted-foreground leading-none line-clamp-2">{t(action.descriptionKey)}</div>
        </div>
        <div className="flex-shrink-0 h-1"></div>
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
            {t('accounting.quickActions.title')}
          </CardTitle>
          <CardDescription>
            {t('accounting.quickActions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.id} className="flex">
                {renderActionButton(action)}
              </div>
            ))}
          </div>

          {/* Additional Help Text */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">{t('accounting.quickActions.gettingStarted.title')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('accounting.quickActions.gettingStarted.items.0')}</li>
              <li>• {t('accounting.quickActions.gettingStarted.items.1')}</li>
              <li>• {t('accounting.quickActions.gettingStarted.items.2')}</li>
              <li>• {t('accounting.quickActions.gettingStarted.items.3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedAction ? t(selectedAction.titleKey) : t('accounting.quickActions.sheet.title')}
            </SheetTitle>
            <SheetDescription>
              {selectedAction ? t(selectedAction.descriptionKey) : t('accounting.quickActions.sheet.description')}
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
