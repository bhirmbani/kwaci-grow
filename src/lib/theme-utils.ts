/**
 * Theme utility functions based on official Tailwind CSS documentation
 * Follows the recommended patterns from https://tailwindcss.com/docs/dark-mode
 */

export type Theme = 'light' | 'dark' | 'system'

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

/**
 * Apply theme to document element following Tailwind CSS best practices
 */
export function applyTheme(theme: 'light' | 'dark') {
  const root = window.document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Initialize theme on app startup
 * Based on the official Tailwind CSS documentation approach
 */
export function initializeTheme(): 'light' | 'dark' {
  // Check if we're in the browser
  if (typeof window === 'undefined') return 'light'
  
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    applyTheme(savedTheme)
    return savedTheme
  }
  
  // Check system preference
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  applyTheme(systemTheme)
  return systemTheme
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(theme: 'light' | 'dark') {
  localStorage.setItem('theme', theme)
}

/**
 * Remove theme preference (will follow system preference)
 */
export function clearThemePreference() {
  localStorage.removeItem('theme')
}
