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
import { Edit3 } from "lucide-react"

interface DataInputSheetProps {
  title: string
  description?: string
  triggerLabel: string
  triggerIcon?: ReactNode
  children: ReactNode
  side?: "left" | "right" | "top" | "bottom"
  buttonColor?: "blue" | "green" | "yellow"
}

export function DataInputSheet({
  title,
  description,
  triggerLabel,
  triggerIcon = <Edit3 className="h-4 w-4" />,
  children,
  side = "right",
  buttonColor = "blue"
}: DataInputSheetProps) {
  const buttonVariants = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white", 
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-white"
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={`gap-2 w-full justify-start transition-colors ${buttonVariants[buttonColor]}`}
          aria-label={`Open ${title} data input`}
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
