import { createFileRoute } from '@tanstack/react-router'

function AccountComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input 
                type="tel" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Business License</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="License Number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tax ID</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tax Identification Number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business Address</label>
              <textarea 
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90">
                Enable
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive updates about your business</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Marketing Communications</h4>
                <p className="text-sm text-muted-foreground">Receive tips and product updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/account')({
  component: AccountComponent,
})
