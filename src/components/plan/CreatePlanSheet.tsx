import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreatePlanForm } from './CreatePlanForm'

interface CreatePlanSheetProps {
  onPlanCreated?: () => void
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  triggerText?: string
  triggerClassName?: string
}

export function CreatePlanSheet({ 
  onPlanCreated,
  triggerVariant = 'default',
  triggerSize = 'sm',
  triggerText = 'Create New Plan',
  triggerClassName = ''
}: CreatePlanSheetProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onPlanCreated?.()
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create New Operational Plan</SheetTitle>
          <SheetDescription>
            Create a new operational plan to organize your coffee shop activities.
            You can start from a template or build from scratch.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <CreatePlanForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
