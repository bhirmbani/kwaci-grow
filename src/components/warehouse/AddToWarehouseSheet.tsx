import { memo } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ProductBasedWarehouseForm } from "./ProductBasedWarehouseForm"
import { Package, Plus } from "lucide-react"

interface AddToWarehouseSheetProps {
  onSuccess?: () => void
}

export const AddToWarehouseSheet = memo(function AddToWarehouseSheet({ onSuccess }: AddToWarehouseSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Add items to warehouse"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[800px] sm:w-[800px] flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add to Warehouse
          </SheetTitle>
          <SheetDescription>
            Add ingredient items to warehouse stock by selecting products and their ingredients
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-6 pr-2 -mr-2">
          <div className="space-y-6 pb-6">
            <ProductBasedWarehouseForm onSuccess={onSuccess} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
})
