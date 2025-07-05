import { createFileRoute } from '@tanstack/react-router'
import { WarehouseManagement } from '../components/warehouse/WarehouseManagement'

function Warehouse() {
  return <WarehouseManagement />
}

export const Route = createFileRoute('/warehouse')({
  component: Warehouse,
})
