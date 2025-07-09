import { createFileRoute } from '@tanstack/react-router'
import { RecurringExpenseManagement } from '../components/recurring-expenses/RecurringExpenseManagement'

function RecurringExpensesPage() {
  return <RecurringExpenseManagement />
}

export const Route = createFileRoute('/recurring-expenses')({
  component: RecurringExpensesPage,
})
