import { createFileRoute } from '@tanstack/react-router'
import { AccountingDashboard } from '@/components/accounting/AccountingDashboard'

function AccountingPage() {
  return <AccountingDashboard />
}

export const Route = createFileRoute('/accounting')({
  component: AccountingPage,
})
