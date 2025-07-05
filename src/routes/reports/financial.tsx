import { createFileRoute } from '@tanstack/react-router'

function FinancialOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground">Comprehensive financial dashboard and metrics.</p>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-center text-muted-foreground">
          Financial Overview report will be implemented here.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reports/financial')({
  component: FinancialOverview,
})
