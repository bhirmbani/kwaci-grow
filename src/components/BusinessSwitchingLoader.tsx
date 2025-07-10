import { Loader2, Building2, CheckCircle } from "lucide-react"
import { useIsBusinessSwitching, useCurrentBusiness } from "@/lib/stores/businessStore"
import { useState, useEffect } from "react"

export function BusinessSwitchingLoader() {
  const isBusinessSwitching = useIsBusinessSwitching()
  const currentBusiness = useCurrentBusiness()
  const [showCompletion, setShowCompletion] = useState(false)
  const [completionBusinessName, setCompletionBusinessName] = useState<string | null>(null)
  const [wasBusinessSwitching, setWasBusinessSwitching] = useState(false)

  // Track when business switching starts
  useEffect(() => {
    if (isBusinessSwitching) {
      setWasBusinessSwitching(true)
      setShowCompletion(false)
    }
  }, [isBusinessSwitching])

  // Handle completion when business switching ends
  useEffect(() => {
    if (!isBusinessSwitching && wasBusinessSwitching && currentBusiness) {
      // Business switching just completed, show completion message
      setCompletionBusinessName(currentBusiness.name)
      setShowCompletion(true)
      setWasBusinessSwitching(false)
    }
  }, [isBusinessSwitching, wasBusinessSwitching, currentBusiness])

  // Handle hiding completion message after timeout
  useEffect(() => {
    if (showCompletion) {
      const timer = setTimeout(() => {
        setShowCompletion(false)
        setCompletionBusinessName(null)
      }, 2500)
      
      return () => clearTimeout(timer)
    }
  }, [showCompletion])

  if (!isBusinessSwitching && !showCompletion) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        {isBusinessSwitching ? (
          // Loading state
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
        ) : (
          // Completion state
          <div className="flex flex-col items-center space-y-4 p-8 bg-card border rounded-lg shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                <Building2 className="size-4" />
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Business Context Updated</h3>
              <p className="text-sm text-muted-foreground">
                Now managing <span className="font-medium text-foreground">{completionBusinessName}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
