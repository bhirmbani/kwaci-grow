import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface AcronymDefinition {
  letter: string
  meaning: string
  description?: string
}

export interface AcronymOption {
  name: string
  acronym: AcronymDefinition[]
}

// Predefined acronym options
export const KWACI_ACRONYMS: AcronymOption[] = [
  {
    name: 'Mixed (Indonesian-English)',
    acronym: [
      { letter: 'K', meaning: 'Keuangan', description: 'Finance' },
      { letter: 'W', meaning: 'Wirausaha', description: 'Entrepreneur' },
      { letter: 'A', meaning: 'Automated', description: 'Automated processes' },
      { letter: 'C', meaning: 'Commerce', description: 'Commerce management' },
      { letter: 'I', meaning: 'Insights', description: 'Business insights' }
    ]
  },
  {
    name: 'All English',
    acronym: [
      { letter: 'K', meaning: 'Knowledge', description: 'Business knowledge management' },
      { letter: 'W', meaning: 'Warehouse', description: 'Inventory and stock management' },
      { letter: 'A', meaning: 'Analytics', description: 'Data analytics and reporting' },
      { letter: 'C', meaning: 'Commerce', description: 'Business commerce operations' },
      { letter: 'I', meaning: 'Intelligence', description: 'Business intelligence' }
    ]
  },
  {
    name: 'All Bahasa Indonesia',
    acronym: [
      { letter: 'K', meaning: 'Kasir', description: 'Cashier/POS' },
      { letter: 'W', meaning: 'Warung', description: 'Small business/shop' },
      { letter: 'A', meaning: 'Akuntansi', description: 'Accounting' },
      { letter: 'C', meaning: 'Cerdas', description: 'Smart/intelligent' },
      { letter: 'I', meaning: 'Inovasi', description: 'Innovation' }
    ]
  }
]

interface KwaciAcronymAnimationProps {
  /** Which acronym option to use (0 = Mixed, 1 = English, 2 = Bahasa) */
  acronymIndex?: number
  /** Duration each letter is displayed (in milliseconds) */
  letterDuration?: number
  /** Pause duration between full cycles (in milliseconds) */
  cyclePause?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to show the description below the meaning */
  showDescription?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export function KwaciAcronymAnimation({
  acronymIndex = 0,
  letterDuration = 2000,
  cyclePause = 3000,
  className,
  showDescription = true,
  size = 'md'
}: KwaciAcronymAnimationProps) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const selectedAcronym = KWACI_ACRONYMS[acronymIndex] || KWACI_ACRONYMS[0]
  const currentLetter = selectedAcronym.acronym[currentLetterIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) {
        setIsPaused(false)
        setIsVisible(true)
        return
      }

      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentLetterIndex((prev) => {
          const nextIndex = (prev + 1) % selectedAcronym.acronym.length

          // If we've completed a full cycle, add a pause but still move to the first letter
          if (nextIndex === 0) {
            setIsPaused(true)
          }

          return nextIndex
        })
        setIsVisible(true)
      }, 300) // Brief fade-out duration
    }, isPaused ? cyclePause : letterDuration)

    return () => clearInterval(interval)
  }, [selectedAcronym.acronym.length, letterDuration, cyclePause, isPaused])

  const sizeClasses = {
    sm: {
      letter: 'text-lg font-bold',
      meaning: 'text-sm font-medium',
      description: 'text-xs'
    },
    md: {
      letter: 'text-xl font-bold',
      meaning: 'text-base font-medium',
      description: 'text-sm'
    },
    lg: {
      letter: 'text-2xl font-bold',
      meaning: 'text-lg font-medium',
      description: 'text-base'
    }
  }

  return (
    <div className={cn(
      'flex items-center gap-3 transition-all duration-300',
      !isVisible && 'opacity-0',
      className
    )}>
      {/* Letter Display */}
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground transition-all duration-300',
        sizeClasses[size].letter,
        size === 'lg' && 'w-10 h-10',
        size === 'sm' && 'w-6 h-6'
      )}>
        {currentLetter.letter}
      </div>

      {/* Meaning and Description */}
      <div className="flex flex-col">
        <span className={cn(
          'text-foreground transition-all duration-300',
          sizeClasses[size].meaning
        )}>
          {currentLetter.meaning}
        </span>
        {showDescription && currentLetter.description && (
          <span className={cn(
            'text-muted-foreground transition-all duration-300',
            sizeClasses[size].description
          )}>
            {currentLetter.description}
          </span>
        )}
      </div>
    </div>
  )
}

// Compact version for header use
export function KwaciAcronymCompact({
  acronymIndex = 0,
  className
}: {
  acronymIndex?: number
  className?: string
}) {
  return (
    <KwaciAcronymAnimation
      acronymIndex={acronymIndex}
      letterDuration={1500}
      cyclePause={2000}
      size="sm"
      showDescription={false}
      className={className}
    />
  )
}
