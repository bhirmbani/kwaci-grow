import { Loader2, Building2 } from "lucide-react"
import { useIsBusinessSwitching } from "@/lib/stores/businessStore"

export function BusinessSwitchingLoader() {
  const isBusinessSwitching = useIsBusinessSwitching()

  if (!isBusinessSwitching) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4 p-8 bg-card border rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Switching Business Context</h3>
            <p className="text-sm text-muted-foreground">
              Loading business-specific data...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
