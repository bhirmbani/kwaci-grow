import { createFileRoute } from '@tanstack/react-router'

function CostBreakdown() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cost Breakdown</h1>
        <p className="text-muted-foreground">Detailed breakdown of all costs.</p>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-center text-muted-foreground">
          Cost Breakdown report will be implemented here.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reports/costs')({
  component: CostBreakdown,
})
