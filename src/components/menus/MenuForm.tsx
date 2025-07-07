import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MenuService } from '@/lib/services/menuService'
import type { Menu } from '@/lib/db/schema'

const menuFormSchema = z.object({
  name: z.string().min(1, 'Menu name is required').max(100, 'Menu name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['active', 'inactive']),
  note: z.string().max(1000, 'Note must be less than 1000 characters').optional(),
})

type MenuFormData = z.infer<typeof menuFormSchema>

interface MenuFormProps {
  menu?: Menu
  onSuccess: () => void
  onCancel: () => void
}

export function MenuForm({ menu, onSuccess, onCancel }: MenuFormProps) {
  const isEditing = !!menu

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      note: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch, register } = form

  // Initialize form data when menu prop changes
  useEffect(() => {
    if (menu) {
      reset({
        name: menu.name,
        description: menu.description || '',
        status: menu.status,
        note: menu.note || '',
      })
    } else {
      reset({
        name: '',
        description: '',
        status: 'active',
        note: '',
      })
    }
  }, [menu, reset])

  const onSubmit = async (data: MenuFormData) => {
    try {
      if (isEditing) {
        await MenuService.update(menu.id, {
          name: data.name.trim(),
          description: data.description?.trim() || '',
          status: data.status,
          note: data.note?.trim() || '',
        })
      } else {
        await MenuService.create({
          name: data.name.trim(),
          description: data.description?.trim() || '',
          note: data.note?.trim() || '',
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save menu:', error)
      // You might want to show a toast notification here
    }
  }

  const watchedStatus = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error?.message}</div>
          ))}
        </div>
      )}

      {/* Menu Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Menu Name *</Label>
        <Input
          id="name"
          placeholder="Enter menu name"
          {...register('name')}
        />
        <p className="text-xs text-muted-foreground">
          A descriptive name for your menu (e.g., "Morning Coffee Menu", "Afternoon Specials")
        </p>
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter menu description"
          rows={3}
          {...register('description')}
        />
        <p className="text-xs text-muted-foreground">
          Optional description of the menu and its purpose
        </p>
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Active Status</Label>
          <p className="text-sm text-muted-foreground">
            {watchedStatus === 'active'
              ? 'Menu is active and available for use'
              : 'Menu is inactive and hidden from operations'
            }
          </p>
        </div>
        <Switch
          checked={watchedStatus === 'active'}
          onCheckedChange={(checked) => {
            const newStatus = checked ? 'active' : 'inactive'
            form.setValue('status', newStatus)
          }}
        />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Add any additional notes or comments"
          rows={2}
          {...register('note')}
        />
        <p className="text-xs text-muted-foreground">
          Optional notes for internal reference
        </p>
        {errors.note && (
          <p className="text-sm text-red-600">{errors.note.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Menu' : 'Create Menu')
          }
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
      {!isEditing && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Next steps:</p>
          <ul className="space-y-1">
            <li>• After creating the menu, you can add products with pricing</li>
            <li>• Assign the menu to specific branches/locations</li>
            <li>• Set daily sales targets for each branch</li>
            <li>• Use the menu in your daily operations</li>
          </ul>
        </div>
      )}
    </form>
  )
}
