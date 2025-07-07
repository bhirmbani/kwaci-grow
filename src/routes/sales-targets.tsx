import { createFileRoute } from '@tanstack/react-router'
import DailySalesTargetsPage from '../components/sales-targets/DailySalesTargetsPage'

function SalesTargetsPage() {
  return <DailySalesTargetsPage />
}

export const Route = createFileRoute('/sales-targets')({
  component: SalesTargetsPage,
})
