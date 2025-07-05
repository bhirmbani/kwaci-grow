import { createFileRoute } from '@tanstack/react-router'

function ProfitAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profit Analysis</h1>
        <p className="text-muted-foreground">Detailed profit and loss analysis.</p>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-center text-muted-foreground">
          Profit Analysis report will be implemented here.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reports/profit')({
  component: ProfitAnalysis,
})
