import { createFileRoute } from '@tanstack/react-router'

function COGSCalculator() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">COGS Calculator</h1>
        <p className="text-muted-foreground">Calculate cost of goods sold for your products.</p>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-center text-muted-foreground">
          COGS Calculator functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/cogs')({
  component: COGSCalculator,
})
