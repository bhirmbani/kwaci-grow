import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { type Language, LANGUAGES } from '../i18n'

interface LanguageState {
  // Current language
  currentLanguage: Language
  
  // Available languages
  availableLanguages: typeof LANGUAGES
  
  // Loading state for language switching
  isChangingLanguage: boolean
  
  // Actions
  changeLanguage: (language: Language) => Promise<void>
  initializeLanguage: () => Promise<void>
  
  // Getters
  getCurrentLanguage: () => Language
  getLanguageDisplayName: (language: Language) => string
  isLanguageSupported: (language: string) => language is Language
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      availableLanguages: LANGUAGES,
      isChangingLanguage: false,

      changeLanguage: async (language: Language) => {
        const currentLang = get().currentLanguage
        if (currentLang === language) return

        set({ isChangingLanguage: true })
        
        try {
          // Change i18next language
          await i18n.changeLanguage(language)
          
          // Update store state
          set({ 
            currentLanguage: language,
            isChangingLanguage: false 
          })
          
          // Store in localStorage (handled by persist middleware)
          localStorage.setItem('kwaci-language', language)
          
        } catch (error) {
          console.error('Failed to change language:', error)
          set({ isChangingLanguage: false })
          throw error
        }
      },

      initializeLanguage: async () => {
        try {
          // Get stored language from localStorage
          const storedLanguage = localStorage.getItem('kwaci-language') as Language
          
          // Validate stored language
          const isValidLanguage = storedLanguage && get().isLanguageSupported(storedLanguage)
          const languageToUse = isValidLanguage ? storedLanguage : 'en'
          
          // Initialize i18next with the determined language
          if (i18n.language !== languageToUse) {
            await i18n.changeLanguage(languageToUse)
          }
          
          // Update store state
          set({ currentLanguage: languageToUse })
          
        } catch (error) {
          console.error('Failed to initialize language:', error)
          // Fallback to English on error
          set({ currentLanguage: 'en' })
          await i18n.changeLanguage('en')
        }
      },

      getCurrentLanguage: () => {
        return get().currentLanguage
      },

      getLanguageDisplayName: (language: Language) => {
        return get().availableLanguages[language]
      },

      isLanguageSupported: (language: string): language is Language => {
        return language in LANGUAGES
      },
    }),
    {
      name: 'language-store',
      // Only persist the current language
      partialize: (state) => ({ 
        currentLanguage: state.currentLanguage 
      }),
    }
  )
)
