import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ExternalLink, ArrowRight, Lock } from 'lucide-react'
import { useJourney } from '@/hooks/useJourney'
import { JOURNEY_STEP_INFO, type JourneyStepId } from '@/lib/services/journeyService'
import { Link } from '@tanstack/react-router'

interface JourneyStepModalProps {
  stepId: JourneyStepId
  isOpen: boolean
  onClose: () => void
}

// Route mapping for each journey step
const STEP_ROUTES: Record<JourneyStepId, string> = {
  'create-ingredient': '/ingredients',
  'create-product': '/products',
  'create-menu': '/menus',
  'create-branch': '/menus', // Branches are managed within menus
  'add-product-to-menu': '/menus',
  'add-item-to-warehouse': '/warehouse',
  'create-production-allocation': '/warehouse',
  'change-production-batch-status': '/production',
  'record-sales': '/operations',
  'create-sales-target': '/sales-targets'
}

export function JourneyStepModal({ stepId, isOpen, onClose }: JourneyStepModalProps) {
  const { getStepStatus, completeStep } = useJourney()
  const [isCompleting, setIsCompleting] = useState(false)
  const { t } = useTranslation()
  
  const stepInfo = JOURNEY_STEP_INFO[stepId]
  const status = getStepStatus(stepId)
  const route = STEP_ROUTES[stepId]
  const cleanTitle = stepInfo.title
    .replace(/^Create /, '')
    .replace(/^Add /, '')
    .replace(/^Change /, '')
    .replace(/^Record /, '')

  const handleCompleteStep = async () => {
    setIsCompleting(true)
    try {
      await completeStep(stepId)
      onClose()
    } finally {
      setIsCompleting(false)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unlocked':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'locked':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'unlocked':
        return <ArrowRight className="h-4 w-4" />
      case 'locked':
        return <Lock className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return t('plan.journeyMap.modal.status.completed')
      case 'unlocked':
        return t('plan.journeyMap.modal.status.ready')
      case 'locked':
        return t('plan.journeyMap.modal.status.locked')
      default:
        return t('plan.journeyMap.modal.status.unknown')
    }
  }

  if (!stepInfo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl backdrop-blur-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">
                {t('plan.journeyMap.modal.stepLabel', {
                  number: stepInfo.order,
                  title: t(stepInfo.title)
                })}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t(stepInfo.description)}
              </DialogDescription>
            </div>
            <Badge className={`${getStatusColor()} flex items-center gap-1`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              {t('plan.journeyMap.modal.instructions')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed">
                {t(stepInfo.instructions)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status !== 'locked' && (
                <Button asChild>
                  <Link to={route} onClick={onClose}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('plan.journeyMap.modal.goTo', { title: t(cleanTitle) })}
                  </Link>
                </Button>
              )}
              
              {status === 'locked' && (
                <Button disabled variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  {t('plan.journeyMap.modal.completePrev')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('plan.journeyMap.modal.close')}
              </Button>
              
              {status === 'unlocked' && (
                <Button 
                  onClick={handleCompleteStep}
                  disabled={isCompleting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCompleting
                    ? t('plan.journeyMap.modal.markingComplete')
                    : t('plan.journeyMap.modal.markComplete')}
                </Button>
              )}
            </div>
          </div>

          {/* Additional Tips */}
          {status !== 'locked' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {t('plan.journeyMap.modal.tipsTitle')}
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {(() => {
                  // Transform stepId (e.g., "create-product") to camelCase (e.g., "createProduct") for i18n lookup
                  const stepKey = stepId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                  const tips = t(`plan.journeyMap.modal.tips.${stepKey}`, { returnObjects: true }) as string[];
                  if (tips && Array.isArray(tips)) {
                    return tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ));
                  }
                  return null;
                })()}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
