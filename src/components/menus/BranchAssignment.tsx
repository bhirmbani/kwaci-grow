import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { MenuService } from '@/lib/services/menuService'
import { BranchService } from '@/lib/services/branchService'
import type { MenuWithProductCount, Branch } from '@/lib/db/schema'

const branchAssignmentSchema = z.object({
  branchIds: z.array(z.string()).min(1, 'At least one branch must be selected'),
})

type BranchAssignmentData = z.infer<typeof branchAssignmentSchema>

interface BranchAssignmentProps {
  menu: MenuWithProductCount
  onSuccess: () => void
  onCancel: () => void
}

export function BranchAssignment({ menu, onSuccess, onCancel }: BranchAssignmentProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [assignedBranches, setAssignedBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const form = useForm<BranchAssignmentData>({
    resolver: zodResolver(branchAssignmentSchema),
    defaultValues: {
      branchIds: [],
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, watch, setValue } = form
  const watchedBranchIds = watch('branchIds')

  // Load branches and current assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [allBranches, currentAssignments] = await Promise.all([
          BranchService.getAll(),
          MenuService.getAssignedBranches(menu.id)
        ])
        
        setBranches(allBranches)
        setAssignedBranches(currentAssignments)
        
        // Set initial form values
        setValue('branchIds', currentAssignments.map(branch => branch.id))
      } catch (error) {
        console.error('Failed to load branch data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [menu.id, setValue])

  const onSubmit = async (data: BranchAssignmentData) => {
    try {
      await MenuService.assignToBranches(menu.id, data.branchIds)
      onSuccess()
    } catch (error) {
      console.error('Failed to assign branches:', error)
    }
  }

  const toggleBranch = (branchId: string) => {
    const currentIds = watchedBranchIds
    const newIds = currentIds.includes(branchId)
      ? currentIds.filter(id => id !== branchId)
      : [...currentIds, branchId]
    
    setValue('branchIds', newIds)
  }

  const getSelectedBranchNames = () => {
    const selectedBranches = branches.filter(branch => watchedBranchIds.includes(branch.id))
    if (selectedBranches.length === 0) return 'Select branches...'
    if (selectedBranches.length === 1) return selectedBranches[0].name
    return `${selectedBranches.length} branches selected`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading branches...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {/* Error Display */}
      {errors.branchIds && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.branchIds.message}
        </div>
      )}

      {/* Menu Info */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-sm text-muted-foreground mb-1">Assigning branches to:</h3>
        <p className="font-semibold">{menu.name}</p>
        {menu.description && (
          <p className="text-sm text-muted-foreground mt-1">{menu.description}</p>
        )}
      </div>

      {/* Branch Selection */}
      <div className="space-y-2">
        <Label>Select Branches *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {getSelectedBranchNames()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search branches..." />
              <CommandList>
                <CommandEmpty>No branches found.</CommandEmpty>
                <CommandGroup>
                  {branches.map((branch) => (
                    <CommandItem
                      key={branch.id}
                      value={branch.name}
                      onSelect={() => toggleBranch(branch.id)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox
                          checked={watchedBranchIds.includes(branch.id)}
                          onChange={() => toggleBranch(branch.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{branch.name}</p>
                          {branch.location && (
                            <p className="text-xs text-muted-foreground">{branch.location}</p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Select which branches this menu should be available at
        </p>
      </div>

      {/* Current Assignments Summary */}
      {watchedBranchIds.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Branches ({watchedBranchIds.length})</Label>
          <div className="space-y-2">
            {branches
              .filter(branch => watchedBranchIds.includes(branch.id))
              .map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <p className="font-medium text-sm">{branch.name}</p>
                    {branch.location && (
                      <p className="text-xs text-muted-foreground">{branch.location}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBranch(branch.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || watchedBranchIds.length === 0}
        >
          {isSubmitting ? 'Assigning...' : 'Assign Branches'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <p className="font-medium mb-1">Branch Assignment:</p>
        <ul className="space-y-1">
          <li>• Menus can be assigned to multiple branches</li>
          <li>• Each branch can have multiple menus</li>
          <li>• Use this to control which menus are available at each location</li>
          <li>• You can set different sales targets per branch later</li>
        </ul>
      </div>
    </form>
  )
}
