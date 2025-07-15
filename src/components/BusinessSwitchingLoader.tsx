import { Loader2, CheckCircle } from "lucide-react"
import { useIsBusinessSwitching, useCurrentBusiness } from "@/lib/stores/businessStore"
import { useState, useEffect } from "react"

export function BusinessSwitchingLoader() {
  const isBusinessSwitching = useIsBusinessSwitching()
  const currentBusiness = useCurrentBusiness()
  const [showCompletion, setShowCompletion] = useState(false)
  const [completionBusinessName, setCompletionBusinessName] = useState<string | null>(null)
  const [wasBusinessSwitching, setWasBusinessSwitching] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

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
        setIsAnimatingOut(true)
        // Wait for animation to complete before hiding
        setTimeout(() => {
          setShowCompletion(false)
          setCompletionBusinessName(null)
          setIsAnimatingOut(false)
        }, 600) // Animation duration
      }, 2000) // Show for 2 seconds before starting fade out
      
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
              <img 
                src="/kwaci-grow-webp-transparent.webp" 
                alt="KWACI Grow Logo" 
                className="h-8 w-8 object-contain"
              />
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
          <div 
            className={`flex flex-col items-center space-y-4 p-8 bg-card border rounded-lg shadow-lg transition-all duration-600 ease-in-out ${
              isAnimatingOut 
                ? 'animate-out fade-out-0 zoom-out-110 duration-600' 
                : 'animate-in fade-in-0 slide-in-from-bottom-4 zoom-in-95 duration-500'
            }`}
            style={{
              animation: isAnimatingOut 
                ? 'fadeOutScale 0.6s ease-in-out forwards' 
                : 'fadeInScale 0.5s ease-out forwards'
            }}
          >
            <style>{`
              @keyframes fadeInScale {
                0% {
                  opacity: 0;
                  transform: translateY(20px) scale(0.95);
                }
                50% {
                  opacity: 1;
                  transform: translateY(0) scale(1.05);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              
              @keyframes fadeOutScale {
                0% {
                  opacity: 1;
                  transform: scale(1);
                }
                30% {
                  opacity: 1;
                  transform: scale(1.1);
                }
                100% {
                  opacity: 0;
                  transform: scale(1.2);
                }
              }
            `}</style>
            <div className="flex items-center space-x-3">
              <img 
                src="/kwaci-grow-webp-transparent.webp" 
                alt="KWACI Grow Logo" 
                className="h-8 w-8 object-contain"
              />
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
