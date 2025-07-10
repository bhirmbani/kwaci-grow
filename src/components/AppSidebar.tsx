import {
  Calculator,
  DollarSign,
  Home,
  BarChart3,
  Settings,
  User,
  ChevronUp,
  TrendingUp,
  FileText,
  PieChart,
  Keyboard,
  Package,
  Factory,
  Beaker,
  Database,
  Menu,
  Target,
  Activity,
  Map,
  CreditCard,
} from "lucide-react"
import { useState } from "react"

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
]

export function AppSidebar() {
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} title={item.description}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} title={subItem.title}>
                              <subItem.icon aria-hidden="true" />
                              <span>{subItem.title}</span>
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
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings">
                    <Settings aria-hidden="true" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Dev Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/test-database">
                    <Database aria-hidden="true" />
                    <span>Database Test</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/seed-multi-business">
                    <Database aria-hidden="true" />
                    <span>Multi-Business Seed</span>
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User className="size-4" aria-hidden="true" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Coffee Cart Owner</span>
                    <span className="truncate text-xs">owner@coffeecart.com</span>
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
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings aria-hidden="true" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Keyboard aria-hidden="true" />
                  Keyboard Shortcuts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sign out
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
    </Sidebar>
  )
}
