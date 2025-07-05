import { createFileRoute } from '@tanstack/react-router'

function SettingsComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Your Coffee Cart Business"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Financial Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Default Tax Rate (%)</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="8.5"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Depreciation Method</label>
              <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="straight-line">Straight Line</option>
                <option value="declining-balance">Declining Balance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download your financial data as CSV</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Reset Database</h4>
                <p className="text-sm text-muted-foreground">Clear all data and start fresh</p>
              </div>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})
