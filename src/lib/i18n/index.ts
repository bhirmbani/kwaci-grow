import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import enCommon from './locales/en/common.json'
import idCommon from './locales/id/common.json'

// Import types for TypeScript support
import './types'

// Define available languages
export const LANGUAGES = {
  en: 'English',
  id: 'Bahasa Indonesia'
} as const

export type Language = keyof typeof LANGUAGES

// Define namespaces
export const NAMESPACES = {
  common: 'common'
} as const

// i18n configuration
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // Language settings
    lng: 'en', // default language
    fallbackLng: 'en', // fallback language
    supportedLngs: Object.keys(LANGUAGES),
    
    // Namespace settings
    defaultNS: NAMESPACES.common,
    ns: Object.values(NAMESPACES),
    
    // Resources (translations)
    resources: {
      en: {
        [NAMESPACES.common]: enCommon
      },
      id: {
        [NAMESPACES.common]: idCommon
      }
    },
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // React-specific settings
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
    
    // Development settings
    debug: import.meta.env.DEV,
    
    // Detection settings - we'll handle this manually via zustand
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kwaci-language',
    },
    
    // Disable automatic detection since we'll use zustand
    initImmediate: false,
  })

export default i18n
