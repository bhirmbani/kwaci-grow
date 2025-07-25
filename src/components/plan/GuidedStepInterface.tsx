import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ArrowRight, ExternalLink, AlertCircle, Lightbulb } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useJourney } from '@/hooks/useJourney'
import { JOURNEY_STEP_INFO, type JourneyStepId } from '@/lib/services/journeyService'

interface GuidedStepInterfaceProps {
  stepId: JourneyStepId
  onStepComplete?: () => void
}

interface StepValidation {
  isValid: boolean
  message: string
  suggestions: string[]
}

export function GuidedStepInterface({ stepId, onStepComplete }: GuidedStepInterfaceProps) {
  const { getStepStatus, completeStep, autoCheckCompletion } = useJourney()
  const { t } = useTranslation()
  const [validation, setValidation] = useState<StepValidation>({
    isValid: false,
    message: t('plan.journeyMap.guidedSteps.checkingRequirements'),
    suggestions: []
  })
  const [isCompleting, setIsCompleting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const stepInfo = JOURNEY_STEP_INFO[stepId]
  const status = getStepStatus(stepId)
  const cleanTitle = stepInfo.title
    .replace(/^Create /, '')
    .replace(/^Add /, '')
    .replace(/^Change /, '')
    .replace(/^Record /, '')

  // Route mapping for each journey step
  const STEP_ROUTES: Record<JourneyStepId, string> = {
    'create-ingredient': '/ingredients',
    'create-product': '/products',
    'create-menu': '/menus',
    'create-branch': '/menus',
    'add-product-to-menu': '/menus',
    'add-item-to-warehouse': '/warehouse',
    'create-production-allocation': '/warehouse',
    'change-production-batch-status': '/production',
    'record-sales': '/operations',
    'create-sales-target': '/sales-targets'
  }

  // Enhanced validation logic for each step
  const validateStep = async (): Promise<StepValidation> => {
    try {
      if (stepInfo.validationFn) {
        const isValid = await stepInfo.validationFn()
        
        if (isValid) {
          return {
            isValid: true,
            message: t('plan.journeyMap.guidedSteps.requirementsMet'),
            suggestions: []
          }
        }
      }

      // Step-specific validation messages and suggestions
      switch (stepId) {
        case 'create-ingredient':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.createIngredient.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.createIngredient.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.createIngredient.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.createIngredient.suggestion3')
            ]
          }

        case 'create-product':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.createProduct.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.createProduct.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.createProduct.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.createProduct.suggestion3')
            ]
          }

        case 'create-menu':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.createMenu.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.createMenu.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.createMenu.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.createMenu.suggestion3')
            ]
          }

        case 'create-branch':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.createBranch.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.createBranch.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.createBranch.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.createBranch.suggestion3')
            ]
          }

        case 'add-product-to-menu':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.addProductToMenu.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.addProductToMenu.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.addProductToMenu.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.addProductToMenu.suggestion3')
            ]
          }

        case 'add-item-to-warehouse':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.addItemToWarehouse.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.addItemToWarehouse.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.addItemToWarehouse.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.addItemToWarehouse.suggestion3')
            ]
          }

        case 'create-production-allocation':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.createProductionAllocation.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.createProductionAllocation.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.createProductionAllocation.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.createProductionAllocation.suggestion3')
            ]
          }

        case 'change-production-batch-status':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.changeProductionBatchStatus.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.changeProductionBatchStatus.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.changeProductionBatchStatus.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.changeProductionBatchStatus.suggestion3')
            ]
          }

        case 'record-sales':
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validation.recordSales.message'),
            suggestions: [
              t('plan.journeyMap.guidedSteps.validation.recordSales.suggestion1'),
              t('plan.journeyMap.guidedSteps.validation.recordSales.suggestion2'),
              t('plan.journeyMap.guidedSteps.validation.recordSales.suggestion3')
            ]
          }

        default:
          return {
            isValid: false,
            message: t('plan.journeyMap.guidedSteps.validationNotConfigured'),
            suggestions: []
          }
      }
    } catch (error) {
      return {
        isValid: false,
        message: t('plan.journeyMap.guidedSteps.validationError'),
        suggestions: [t('plan.journeyMap.guidedSteps.tryAgain')]
      }
    }
  }

  // Check validation on mount and periodically
  useEffect(() => {
    const checkValidation = async () => {
      const result = await validateStep()
      setValidation(result)
    }

    checkValidation()
    
    // Auto-check every 10 seconds if step is not completed
    const interval = status !== 'completed' ? setInterval(checkValidation, 10000) : null
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [stepId, status])

  const handleCompleteStep = async () => {
    setIsCompleting(true)
    try {
      await autoCheckCompletion() // Auto-check all steps first
      await completeStep(stepId)
      onStepComplete?.()
    } finally {
      setIsCompleting(false)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'unlocked':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'locked':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'unlocked':
        return validation.isValid ? <CheckCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
      case 'locked':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return t('plan.journeyMap.guidedSteps.status.completed')
      case 'unlocked':
        return validation.isValid
          ? t('plan.journeyMap.guidedSteps.status.ready')
          : t('plan.journeyMap.guidedSteps.status.inProgress')
      case 'locked':
        return t('plan.journeyMap.guidedSteps.status.locked')
      default:
        return t('plan.journeyMap.guidedSteps.status.unknown')
    }
  }

  if (!stepInfo) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {t('plan.journeyMap.modal.stepLabel', {
                number: stepInfo.order,
                title: t(stepInfo.title)
              })}
            </CardTitle>
            <CardDescription>
              {t(stepInfo.description)}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor()} flex items-center gap-1`}>
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('plan.journeyMap.guidedSteps.progress')}</span>
            <span>{status === 'completed' ? '100%' : validation.isValid ? '90%' : '0%'}</span>
          </div>
          <Progress 
            value={status === 'completed' ? 100 : validation.isValid ? 90 : 0} 
            className="h-2"
          />
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            {t('plan.journeyMap.guidedSteps.instructions')}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(stepInfo.instructions)}
          </p>
        </div>

        {/* Validation Status */}
        <div className={`p-3 rounded-lg border ${
          validation.isValid 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        }`}>
          <div className="flex items-start gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            )}
            <div className="space-y-2">
              <p className={`text-sm font-medium ${
                validation.isValid 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {validation.message}
              </p>
              
              {validation.suggestions.length > 0 && (
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="h-auto p-0 text-xs"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {showDetails
                      ? t('plan.journeyMap.guidedSteps.hideSuggestions')
                      : t('plan.journeyMap.guidedSteps.showSuggestions')}
                  </Button>
                  
                  {showDetails && (
                    <ul className={`text-xs space-y-1 ${
                      validation.isValid 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {status !== 'locked' && (
              <Button asChild variant="outline">
                <Link to={STEP_ROUTES[stepId]}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('plan.journeyMap.guidedSteps.goTo', { title: t(cleanTitle) })}
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status === 'unlocked' && validation.isValid && (
              <Button 
                onClick={handleCompleteStep}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompleting
                  ? t('plan.journeyMap.guidedSteps.completing')
                  : t('plan.journeyMap.guidedSteps.markComplete')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
