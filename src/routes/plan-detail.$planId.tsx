import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlanDetailView } from '@/components/plan/PlanDetailView'

function PlanDetailPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate({ to: '/plan' })
  }

  return (
    <div className="space-y-6">
      <PlanDetailView planId={planId} onBack={handleBack} />
    </div>
  )
}

export const Route = createFileRoute('/plan-detail/$planId')({
  component: PlanDetailPage,
})
