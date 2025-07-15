// TypeScript types for i18n translations
import type { NAMESPACES } from './index'

// Define the structure of our translation resources
export interface TranslationResources {
  common: {
    navigation: {
      dashboard: string
      plan: string
      products: string
      menus: string
      salesTargets: string
      operations: string
      people: string
      accounting: string
      recurringExpenses: string
      analytics: string
      ingredients: string
      cogsCalculator: string
      warehouse: string
      production: string
      fixedAssets: string
      reports: string
      kwaciDemo: string
      learningHub: string
      settings: string
      account: string
    }
    navigationDescriptions: {
      dashboard: string
      plan: string
      products: string
      menus: string
      salesTargets: string
      operations: string
      people: string
      accounting: string
      recurringExpenses: string
      analytics: string
      ingredients: string
      cogsCalculator: string
      warehouse: string
      production: string
      fixedAssets: string
      reports: string
      kwaciDemo: string
    }
    reportsSubMenu: {
      financialOverview: string
      profitAnalysis: string
      costBreakdown: string
    }
    sidebarGroups: {
      navigation: string
      learningSupport: string
      quickActions: string
      devTools: string
    }
    devTools: {
      multiBusinessSeed: string
      debugAccounting: string
    }
    userMenu: {
      businessOwner: string
      email: string
      keyboardShortcuts: string
      signOut: string
    }
    common: {
      loading: string
      error: string
      success: string
      cancel: string
      save: string
      delete: string
      edit: string
      create: string
      update: string
      close: string
      back: string
      next: string
      previous: string
      search: string
      filter: string
      sort: string
      export: string
      import: string
      refresh: string
    }
    language: {
      switchLanguage: string
      currentLanguage: string
      english: string
      indonesian: string
    }
    kwaci: {
      brandName: string
      acronyms: {
        mixed: {
          name: string
          k: string
          kDesc: string
          w: string
          wDesc: string
          a: string
          aDesc: string
          c: string
          cDesc: string
          i: string
          iDesc: string
        }
        english: {
          name: string
          k: string
          kDesc: string
          w: string
          wDesc: string
          a: string
          aDesc: string
          c: string
          cDesc: string
          i: string
          iDesc: string
        }
        indonesian: {
          name: string
          k: string
          kDesc: string
          w: string
          wDesc: string
          a: string
          aDesc: string
          c: string
          cDesc: string
          i: string
          iDesc: string
        }
      }
    }
  }
}

// Extend react-i18next module to include our types
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof NAMESPACES.common
    resources: TranslationResources
  }
}
