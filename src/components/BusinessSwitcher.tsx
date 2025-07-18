import { ChevronsUpDown, Plus, Building2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useBusinessStore, useCurrentBusiness, useBusinesses } from "@/lib/stores/businessStore"
import type { Business } from "@/lib/db/schema"

interface BusinessSwitcherProps {
  onCreateBusiness?: () => void
  onManageBusinesses?: () => void
}

export function BusinessSwitcher({
  onCreateBusiness,
  onManageBusinesses
}: BusinessSwitcherProps) {
  const { isMobile } = useSidebar()
  const currentBusiness = useCurrentBusiness()
  const businesses = useBusinesses()
  const { switchBusiness } = useBusinessStore()

  const handleBusinessSelect = async (business: Business) => {
    await switchBusiness(business)
  }

  const handleCreateBusiness = () => {
    onCreateBusiness?.()
  }

  const handleManageBusinesses = () => {
    onManageBusinesses?.()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border overflow-hidden">
                {currentBusiness?.logo ? (
                  <span className="text-xl">{currentBusiness.logo}</span>
                ) : (
                  <img
                    src="/kwaci-grow-webp-transparent.webp"
                    alt="KWACI Grow"
                    className="size-6 object-contain"
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentBusiness?.name || "Select Business"}
                </span>
                <span className="truncate text-xs">
                  {currentBusiness?.description || "No business selected"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Businesses
            </DropdownMenuLabel>
            {businesses.map((business, index) => (
              <DropdownMenuItem
                key={business.id}
                onClick={() => handleBusinessSelect(business)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {business.logo ? (
                    <span className="text-sm">{business.logo}</span>
                  ) : (
                    <Building2 className="size-4 shrink-0" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{business.name}</span>
                  {business.description && (
                    <span className="text-xs text-muted-foreground">
                      {business.description}
                    </span>
                  )}
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCreateBusiness} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add business</div>
            </DropdownMenuItem>
            {onManageBusinesses && (
              <DropdownMenuItem onClick={handleManageBusinesses} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Manage businesses</div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
