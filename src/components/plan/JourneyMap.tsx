import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  Circle,
  Lock,
  Play,
  RotateCcw,
  Package,
  Coffee,
  Menu,
  MapPin,
  Plus,
  Warehouse,
  Factory,
  Settings,
  TrendingUp,
  Map,
  List,
  Target
} from 'lucide-react'
import { useJourney } from '@/hooks/useJourney'
import { JOURNEY_STEP_INFO, JOURNEY_STEPS, type JourneyStepId } from '@/lib/services/journeyService'
import { JourneyStepModal } from './JourneyStepModal'
import { GuidedStepInterface } from './GuidedStepInterface'

// Icon mapping for each journey step
const STEP_ICONS: Record<JourneyStepId, React.ComponentType<{ className?: string }>> = {
  [JOURNEY_STEPS.CREATE_INGREDIENT]: Package,
  [JOURNEY_STEPS.CREATE_PRODUCT]: Coffee,
  [JOURNEY_STEPS.CREATE_MENU]: Menu,
  [JOURNEY_STEPS.CREATE_BRANCH]: MapPin,
  [JOURNEY_STEPS.ADD_PRODUCT_TO_MENU]: Plus,
  [JOURNEY_STEPS.ADD_ITEM_TO_WAREHOUSE]: Warehouse,
  [JOURNEY_STEPS.CREATE_PRODUCTION_ALLOCATION]: Factory,
  [JOURNEY_STEPS.CHANGE_PRODUCTION_BATCH_STATUS]: Settings,
  [JOURNEY_STEPS.RECORD_SALES]: TrendingUp,
  [JOURNEY_STEPS.CREATE_SALES_TARGET]: Target
}

export function JourneyMap() {
  const { 
    progress, 
    loading, 
    error, 
    getCompletionPercentage, 
    getNextUnlockedStep, 
    getStepStatus,
    resetProgress,
    autoCheckCompletion
  } = useJourney()
  
  const [selectedStep, setSelectedStep] = useState<JourneyStepId | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const completionPercentage = getCompletionPercentage()
  const nextStep = getNextUnlockedStep()
  const orderedSteps = Object.values(JOURNEY_STEP_INFO).sort((a, b) => a.order - b.order)

  const handleResetProgress = async () => {
    setIsResetting(true)
    try {
      await resetProgress()
    } finally {
      setIsResetting(false)
    }
  }

  const handleAutoCheck = async () => {
    await autoCheckCompletion()
  }

  const getStepColor = (stepId: JourneyStepId) => {
    const status = getStepStatus(stepId)
    const isBonusStep = stepId === JOURNEY_STEPS.CREATE_SALES_TARGET

    switch (status) {
      case 'completed':
        return isBonusStep
          ? 'bg-purple-500 text-white border-purple-500'
          : 'bg-green-500 text-white border-green-500'
      case 'unlocked':
        return isBonusStep
          ? 'bg-purple-400 text-white border-purple-400'
          : 'bg-blue-500 text-white border-blue-500'
      case 'locked':
        return isBonusStep
          ? 'bg-purple-200 text-purple-600 border-purple-200'
          : 'bg-gray-300 text-gray-600 border-gray-300'
      default:
        return 'bg-gray-300 text-gray-600 border-gray-300'
    }
  }

  const getStepIcon = (stepId: JourneyStepId) => {
    const status = getStepStatus(stepId)
    const IconComponent = STEP_ICONS[stepId]
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6" />
      case 'unlocked':
        return <IconComponent className="h-6 w-6" />
      case 'locked':
        return <Lock className="h-6 w-6" />
      default:
        return <Circle className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading journey progress...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading journey progress: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Coffee Shop Setup Journey
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all 9 steps to fully set up your coffee shop operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoCheck}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Auto Check
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetProgress}
                disabled={isResetting}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{completionPercentage}% Complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {/* Next Step Highlight */}
            {nextStep && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Play className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Next Step: {nextStep.title}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {nextStep.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedStep(nextStep.id)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start
                  </Button>
                </div>
              </div>
            )}

            {completionPercentage === 100 && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      🎉 Journey Complete!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Congratulations! You've completed all setup steps for your coffee shop.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Journey Steps Interface */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Journey Map
          </TabsTrigger>
          <TabsTrigger value="guided" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Guided Steps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Journey Steps Map</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any unlocked step to view instructions and get started
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {orderedSteps.map((step, index) => {
                  const status = getStepStatus(step.id)
                  const isClickable = status !== 'locked'
                  const isBonusStep = step.id === JOURNEY_STEPS.CREATE_SALES_TARGET

                  return (
                    <div
                      key={step.id}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                        isClickable
                          ? 'cursor-pointer hover:shadow-md'
                          : 'cursor-not-allowed opacity-60'
                      } ${getStepColor(step.id)} ${
                        isBonusStep ? 'ring-2 ring-purple-300 ring-offset-2' : ''
                      }`}
                      onClick={() => isClickable && setSelectedStep(step.id)}
                    >
                      {/* Bonus Badge */}
                      {isBonusStep && (
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                            Bonus
                          </Badge>
                        </div>
                      )}

                      {/* Step Number */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-background border-2 border-current flex items-center justify-center text-xs font-bold">
                        {step.order}
                      </div>

                      {/* Step Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getStepIcon(step.id)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{step.title}</h3>
                          </div>
                        </div>

                        <p className="text-sm opacity-90 line-clamp-2">
                          {step.description}
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={status === 'completed' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              status === 'completed'
                                ? 'bg-white/20 text-current'
                                : status === 'unlocked'
                                ? 'bg-white/20 text-current'
                                : 'bg-gray-500 text-white'
                            }`}
                          >
                            {status === 'completed' ? 'Completed' :
                             status === 'unlocked' ? 'Ready' : 'Locked'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guided">
          <div className="space-y-4">
            {orderedSteps.map((step) => {
              const status = getStepStatus(step.id)

              // Only show current step and next few steps to avoid overwhelming
              if (status === 'locked' && step.order > (nextStep?.order || 1) + 2) {
                return null
              }

              return (
                <GuidedStepInterface
                  key={step.id}
                  stepId={step.id}
                  onStepComplete={() => {
                    // Refresh the journey state
                    handleAutoCheck()
                  }}
                />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Journey Step Modal */}
      {selectedStep && (
        <JourneyStepModal
          stepId={selectedStep}
          isOpen={!!selectedStep}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  )
}
