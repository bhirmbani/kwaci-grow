import { createFileRoute } from '@tanstack/react-router'
import { ProductionManagement } from '../components/production/ProductionManagement'

function Production() {
  return <ProductionManagement />
}

export const Route = createFileRoute('/production')({
  component: Production,
})
