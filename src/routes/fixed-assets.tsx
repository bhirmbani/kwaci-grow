import { createFileRoute } from '@tanstack/react-router'

function FixedAssets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fixed Assets</h1>
        <p className="text-muted-foreground">Manage fixed assets and depreciation.</p>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-center text-muted-foreground">
          Fixed Assets management functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/fixed-assets')({
  component: FixedAssets,
})
