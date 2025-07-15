import {
  Calculator,
  DollarSign,
  Home,
  BarChart3,
  Settings,
  User,
  Users,
  ChevronUp,
  TrendingUp,
  FileText,
  PieChart,
  Keyboard,
  Package,
  Factory,
  Beaker,
  Menu,
  Target,
  Activity,
  Map,
  CreditCard,
  Receipt,
  Bug,
  Building2,
  BookOpen,
  Info,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from 'react-i18next'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BusinessSwitcher } from "./BusinessSwitcher"
import { BusinessManagementSheet } from "./BusinessManagementSheet"

// Helper function to convert navigation titles to translation keys
const getNavigationKey = (title: string): string => {
  const keyMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Plan': 'plan',
    'Products': 'products',
    'Menus': 'menus',
    'Sales Targets': 'salesTargets',
    'Operations': 'operations',
    'People': 'people',
    'Accounting': 'accounting',
    'Recurring Expenses': 'recurringExpenses',
    'Analytics': 'analytics',
    'Ingredients': 'ingredients',
    'COGS Calculator': 'cogsCalculator',
    'Warehouse': 'warehouse',
    'Production': 'production',
    'Fixed Assets': 'fixedAssets',
    'Reports': 'reports',
    'KWACI Demo': 'kwaciDemo',
    'Learning Hub': 'learningHub',
    'Settings': 'settings',
    'Account': 'account',
    'Financial Overview': 'financialOverview',
    'Profit Analysis': 'profitAnalysis',
    'Cost Breakdown': 'costBreakdown'
  }
  return keyMap[title] || title.toLowerCase().replace(/\s+/g, '')
}

// Menu items for the financial dashboard
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Main financial dashboard",
  },
  {
    title: "Plan",
    url: "/plan",
    icon: Map,
    description: "Guided onboarding and operational planning",
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    description: "Manage products and their compositions",
  },
  {
    title: "Menus",
    url: "/menus",
    icon: Menu,
    description: "Create and manage coffee shop menus",
  },
  {
    title: "Sales Targets",
    url: "/sales-targets",
    icon: Target,
    description: "Set daily sales targets for menu products",
  },
  {
    title: "Operations",
    url: "/operations",
    icon: Activity,
    description: "Sales recording, analytics, and operational tracking",
  },
  {
    title: "People",
    url: "/people",
    icon: Users,
    description: "Manage employees and point-of-contact assignments",
  },
  {
    title: "Accounting",
    url: "/accounting",
    icon: Receipt,
    description: "Comprehensive financial transaction management and accounting",
  },
  {
    title: "Recurring Expenses",
    url: "/recurring-expenses",
    icon: CreditCard,
    description: "Manage monthly and yearly recurring operational expenses",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    description: "Product-specific income projections and profit analysis",
  },
  {
    title: "Ingredients",
    url: "/ingredients",
    icon: Beaker,
    description: "Manage ingredients and their properties",
  },
  {
    title: "COGS Calculator",
    url: "/cogs",
    icon: Calculator,
    description: "Calculate cost of goods sold",
  },
  {
    title: "Warehouse",
    url: "/warehouse",
    icon: Package,
    description: "Manage warehouse stock and inventory",
  },
  {
    title: "Production",
    url: "/production",
    icon: Factory,
    description: "Manage production batches and allocations",
  },
  {
    title: "Fixed Assets",
    url: "/fixed-assets",
    icon: DollarSign,
    description: "Manage fixed assets and depreciation",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    description: "Financial reports and analytics",
    items: [
      {
        title: "Financial Overview",
        url: "/reports/financial",
        icon: PieChart,
      },
      {
        title: "Profit Analysis",
        url: "/reports/profit",
        icon: TrendingUp,
      },
      {
        title: "Cost Breakdown",
        url: "/reports/costs",
        icon: FileText,
      },
    ],
  },
  {
    title: "KWACI Demo",
    url: "/kwaci-demo",
    icon: Info,
    description: "Explore KWACI acronym meanings and animations",
  },
]

export function AppSidebar() {
  const { t } = useTranslation()
  const [isBusinessManagementOpen, setIsBusinessManagementOpen] = useState(false)

  const handleCreateBusiness = () => {
    setIsBusinessManagementOpen(true)
  }

  const handleManageBusinesses = () => {
    setIsBusinessManagementOpen(true)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <BusinessSwitcher
          onCreateBusiness={handleCreateBusiness}
          onManageBusinesses={handleManageBusinesses}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebarGroups.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={t(`navigation.${getNavigationKey(item.title)}`)}>
                    <Link to={item.url} title={t(`navigationDescriptions.${getNavigationKey(item.title)}`)}>
                      <item.icon aria-hidden="true" />
                      <span>{t(`navigation.${getNavigationKey(item.title)}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} title={t(`reportsSubMenu.${getNavigationKey(subItem.title)}`)}>
                              <subItem.icon aria-hidden="true" />
                              <span>{t(`reportsSubMenu.${getNavigationKey(subItem.title)}`)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebarGroups.learningSupport')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('navigation.learningHub')}>
                  <Link to="/learn">
                    <BookOpen aria-hidden="true" />
                    <span>{t('navigation.learningHub')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebarGroups.quickActions')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('navigation.settings')}>
                  <Link to="/settings">
                    <Settings aria-hidden="true" />
                    <span>{t('navigation.settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebarGroups.devTools')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('devTools.multiBusinessSeed')}>
                  <Link to="/seed-multi-business">
                    <Building2 aria-hidden="true" />
                    <span>{t('devTools.multiBusinessSeed')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('devTools.debugAccounting')}>
                  <Link to="/debug-accounting">
                    <Bug aria-hidden="true" />
                    <span>{t('devTools.debugAccounting')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Test Accounting Integration">
                  <Link to="/test-accounting-integration">
                    <Bug aria-hidden="true" />
                    <span>Test Accounting Integration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={t('userMenu.businessOwner')}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User className="size-4" aria-hidden="true" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{t('userMenu.businessOwner')}</span>
                    <span className="truncate text-xs">{t('userMenu.email')}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" aria-hidden="true" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <User aria-hidden="true" />
                    {t('navigation.account')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings aria-hidden="true" />
                    {t('navigation.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Keyboard aria-hidden="true" />
                  {t('userMenu.keyboardShortcuts')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t('userMenu.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Business Management Sheet */}
      <BusinessManagementSheet
        open={isBusinessManagementOpen}
        onOpenChange={setIsBusinessManagementOpen}
      />
      
      {/* Rail for easier expansion when collapsed */}
      <SidebarRail />
    </Sidebar>
  )
}
