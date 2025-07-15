import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLanguageStore } from '@/lib/stores/languageStore'
import { type Language } from '@/lib/i18n'
import { toast } from 'sonner'

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function LanguageSwitcher({ 
  variant = 'ghost', 
  size = 'icon',
  showLabel = false 
}: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const { 
    currentLanguage, 
    availableLanguages, 
    isChangingLanguage, 
    changeLanguage,
    getLanguageDisplayName 
  } = useLanguageStore()

  const handleLanguageChange = async (language: Language) => {
    if (language === currentLanguage || isChangingLanguage) return

    try {
      await changeLanguage(language)
      
      // Show success toast
      toast.success(
        t('language.switchLanguage'), 
        {
          description: `${t('language.currentLanguage')}: ${getLanguageDisplayName(language)}`
        }
      )
    } catch (error) {
      console.error('Failed to change language:', error)
      toast.error(t('common.error'), {
        description: 'Failed to change language. Please try again.'
      })
    }
  }

  const currentLanguageDisplay = getLanguageDisplayName(currentLanguage)

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={variant} 
                size={size}
                disabled={isChangingLanguage}
                className="relative"
              >
                {isChangingLanguage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                {showLabel && (
                  <span className="ml-2 hidden sm:inline-block">
                    {currentLanguageDisplay}
                  </span>
                )}
                <span className="sr-only">{t('language.switchLanguage')}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent>
            <p>{t('language.switchLanguage')}</p>
            <p className="text-xs text-muted-foreground">
              {t('language.currentLanguage')}: {currentLanguageDisplay}
            </p>
          </TooltipContent>
          
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(availableLanguages).map(([langCode, langName]) => {
              const language = langCode as Language
              const isSelected = language === currentLanguage
              
              return (
                <DropdownMenuItem
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  disabled={isChangingLanguage}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {language === 'en' ? '🇺🇸' : '🇮🇩'}
                    </span>
                    <span>{langName}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  )
}
