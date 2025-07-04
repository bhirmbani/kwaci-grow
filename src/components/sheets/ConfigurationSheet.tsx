import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface ConfigurationSheetProps {
  title: string
  description?: string
  triggerLabel: string
  triggerIcon?: ReactNode
  children: ReactNode
  side?: "left" | "right" | "top" | "bottom"
}

export function ConfigurationSheet({
  title,
  description,
  triggerLabel,
  triggerIcon = <Settings className="h-4 w-4" />,
  children,
  side = "right"
}: ConfigurationSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={`Open ${title} configuration`}
        >
          {triggerIcon}
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
