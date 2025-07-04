import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    toggleTheme()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun
        className={`h-4 w-4 transition-all ${theme === 'dark' ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'}`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
      />
    </button>
  )
}
