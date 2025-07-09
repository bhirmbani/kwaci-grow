import { memo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProductBasedWarehouseForm } from './ProductBasedWarehouseForm'
import { Package, Plus } from 'lucide-react'

interface AddToWarehouseSheetProps {
  onSuccess?: () => void
}

export const AddToWarehouseSheet = memo(function AddToWarehouseSheet({
  onSuccess,
}: AddToWarehouseSheetProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
        aria-label="Add items to warehouse"
      >
        <Plus className="text-primary-foreground m-auto flex h-8 w-8" />
      </SheetTrigger>

      <SheetContent side="right" className="flex h-full w-[800px] flex-col sm:w-[800px]">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add to Warehouse
          </SheetTitle>
          <SheetDescription>
            Add ingredient items to warehouse stock by selecting products and their ingredients
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 -mr-2 flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 pb-6">
            <ProductBasedWarehouseForm onSuccess={onSuccess} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
})
