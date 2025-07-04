import {
  Calculator,
  DollarSign,
  Home,
  BarChart3,
  Settings,
  User,
  ChevronUp,
  Coffee,
  TrendingUp,
  FileText,
  PieChart,
  Keyboard,
  Package,
} from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Menu items for the financial dashboard
const items = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
    isActive: true, // Mark dashboard as active by default
  },
  {
    title: "COGS Calculator",
    url: "#cogs",
    icon: Calculator,
    description: "Calculate cost of goods sold",
  },
  {
    title: "Warehouse",
    url: "#warehouse",
    icon: Package,
    description: "Manage warehouse stock and inventory",
  },
  {
    title: "Fixed Assets",
    url: "#fixed-assets",
    icon: DollarSign,
    description: "Manage fixed assets and depreciation",
  },
  {
    title: "Reports",
    url: "#reports",
    icon: BarChart3,
    description: "Financial reports and analytics",
    items: [
      {
        title: "Financial Overview",
        url: "#reports/financial",
        icon: PieChart,
      },
      {
        title: "Profit Analysis",
        url: "#reports/profit",
        icon: TrendingUp,
      },
      {
        title: "Cost Breakdown",
        url: "#reports/costs",
        icon: FileText,
      },
    ],
  },
]

interface AppSidebarProps {
  onNavigate?: (url: string) => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const handleNavigation = (url: string) => {
    if (onNavigate) {
      onNavigate(url)
    } else {
      // Fallback behavior
      console.log('Navigating to:', url)
    }
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Coffee className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Coffee Cart
                  </span>
                  <span className="truncate text-xs">
                    Financial Dashboard
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    onClick={() => handleNavigation(item.url)}
                  >
                    <a href={item.url} title={item.description}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url} title={subItem.title}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </a>
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
                  <a href="#settings">
                    <Settings />
                    <span>Settings</span>
                  </a>
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
                  <User className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Coffee Cart Owner</span>
                    <span className="truncate text-xs">owner@coffeecart.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Keyboard />
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
    </Sidebar>
  )
}
