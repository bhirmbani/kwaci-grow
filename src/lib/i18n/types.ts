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
    plan: {
      title: string
      description: string
      tabs: {
        journey: string
        planningDashboard: string
      }
      journeyMap: {
        loading: string
        error: string
        title: string
        description: string
        autoCheck: string
        reset: string
        overallProgress: string
        complete: string
        nextStep: string
        start: string
        completeTitle: string
        completeDescription: string
        tabs: {
          map: string
          guided: string
        }
        stepsMap: {
          title: string
          description: string
          bonus: string
          status: {
            completed: string
            ready: string
            locked: string
          }
        }
      }
      planningDashboard: {
        loading: string
        title: string
        description: string
        stats: {
          activePlans: string
          goalsAchieved: string
          tasksCompleted: string
          completionRate: string
        }
        templates: {
          title: string
          description: string
          default: string
          duration: string
          useTemplate: string
        }
        journey: {
          title: string
          description: string
          overallProgress: string
          incompleteTitle: string
          incompleteDescription: string
          completeTitle: string
          completeDescription: string
        }
        recentPlans: {
          title: string
          noPlansTitle: string
          noPlansDescription: string
          createFirst: string
          view: string
        }
        analytics: {
          title: string
          description: string
          planDistribution: string
          statusOverview: string
          performanceMetrics: string
          averageTaskDuration: string
          mostUsedTemplate: string
          totalPlansCreated: string
          goalCategories: string
        }
      }
    }
    dashboard: {
      title: string
      description: string
      lastUpdated: string
      refresh: string
      realTimeData: string
      dataUpdatesAutomatically: string
      welcome: {
        title: string
        description: string
        selectBusiness: string
        multiBusinessEnabled: string
      }
      noBusinessSelected: string
      selectBusinessToView: string
      errorLoading: string
      tryAgain: string
      salesAnalytics: {
        title: string
        description: string
        selectPeriod: string
        periods: {
          today: string
          week: string
          month: string
          quarter: string
        }
        metrics: {
          totalRevenue: string
          transactions: string
          avgOrderValue: string
          topProduct: string
          perTransactionAverage: string
          sold: string
          noSales: string
          active: string
        }
        hourlyChart: {
          title: string
          description: string
          peakHours: string
        }
        noData: {
          title: string
          description: string
        }
      }
      financialOverview: {
        title: string
        description: string
        metrics: {
          availableCash: string
          monthlyExpenses: string
          netPosition: string
          cashRunway: string
          burnRate: string
          months: string
          atCurrentBurnRate: string
          positive: string
          negative: string
        }
        healthStatus: {
          healthy: string
          caution: string
          critical: string
        }
        summary: {
          title: string
          description: string
          cashFlowStatus: string
          positiveCashFlow: string
          negativeCashFlow: string
          revenueVsExpenses: string
          monthlyRevenue: string
          monthlyExpenses: string
          netResult: string
          recommendations: string
          focusOnRevenue: string
          considerOptimization: string
          considerReinvestment: string
          immediateAttention: string
        }
        error: {
          title: string
        }
      }
      operationsStatus: {
        title: string
        description: string
        overview: string
        status: {
          pending: string
          inProgress: string
          completed: string
          cancelled: string
        }
        priority: {
          overdue: string
          urgent: string
          normal: string
        }
        columns: {
          batch: string
          product: string
          status: string
          priority: string
          lastUpdate: string
        }
        noData: {
          title: string
          description: string
        }
      }
      inventoryAlerts: {
        title: string
        description: string
        summary: {
          title: string
          criticalItems: string
          lowStockItems: string
          totalItems: string
        }
        alertLevels: {
          critical: string
          lowStock: string
          normal: string
        }
        columns: {
          ingredient: string
          currentStock: string
          minimumLevel: string
          alertLevel: string
          lastRestocked: string
        }
        stockLevel: string
        noAlerts: {
          title: string
          description: string
        }
      }
      branchPerformance: {
        title: string
        description: string
        summary: {
          title: string
          topPerformer: string
          totalBranches: string
          avgRevenue: string
        }
        columns: {
          rank: string
          branch: string
          revenue: string
          transactions: string
          avgOrderValue: string
          performance: string
        }
        performanceLabels: {
          excellent: string
          good: string
          average: string
          belowAverage: string
        }
        noData: {
          title: string
          description: string
        }
      }
    }
    people: Record<string, any>
    cogs: Record<string, any>
  }
}

// Extend react-i18next module to include our types
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof NAMESPACES.common
    resources: TranslationResources
  }
}
