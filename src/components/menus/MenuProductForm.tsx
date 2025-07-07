import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MenuService } from '@/lib/services/menuService'
import type { MenuProduct, Product } from '@/lib/db/schema'

const menuProductFormSchema = z.object({
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  displayOrder: z.number().min(1, 'Display order must be at least 1'),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
})

type MenuProductFormData = z.infer<typeof menuProductFormSchema>

interface MenuProductFormProps {
  menuId?: string
  productId?: string
  menuProduct?: MenuProduct & { product: Product }
  onSuccess: () => void
  onCancel: () => void
}

// Common categories for coffee shop products
const PRODUCT_CATEGORIES = [
  'Coffee',
  'Tea',
  'Cold Drinks',
  'Hot Drinks',
  'Pastry',
  'Sandwich',
  'Snacks',
  'Dessert',
  'Breakfast',
  'Lunch',
  'Special',
  'Seasonal'
]

export function MenuProductForm({ 
  menuId, 
  productId, 
  menuProduct, 
  onSuccess, 
  onCancel 
}: MenuProductFormProps) {
  const isEditing = !!menuProduct

  const form = useForm<MenuProductFormData>({
    resolver: zodResolver(menuProductFormSchema),
    defaultValues: {
      price: 0,
      category: '',
      displayOrder: 1,
      note: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch } = form

  // Initialize form data when menuProduct prop changes
  useEffect(() => {
    if (menuProduct) {
      reset({
        price: menuProduct.price,
        category: menuProduct.category,
        displayOrder: menuProduct.displayOrder,
        note: menuProduct.note || '',
      })
    } else {
      reset({
        price: 0,
        category: '',
        displayOrder: 1,
        note: '',
      })
    }
  }, [menuProduct, reset])

  const onSubmit = async (data: MenuProductFormData) => {
    try {
      if (isEditing && menuProduct) {
        // Update existing menu product
        await MenuService.updateProduct(menuProduct.id, {
          price: data.price,
          category: data.category.trim(),
          displayOrder: data.displayOrder,
          note: data.note?.trim() || '',
        })
      } else if (menuId && productId) {
        // Add new product to menu
        await MenuService.addProduct(menuId, {
          productId,
          price: data.price,
          category: data.category.trim(),
          displayOrder: data.displayOrder,
          note: data.note?.trim() || '',
        })
      } else {
        throw new Error('Missing required data for menu product operation')
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save menu product:', error)
      // You might want to show a toast notification here
    }
  }

  const watchedPrice = watch('price')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {Object.values(errors).map((error, index) => (
              <div key={index}>{error?.message}</div>
            ))}
          </div>
        )}

        {/* Product Info (if editing) */}
        {isEditing && menuProduct && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2">Product: {menuProduct.product.name}</h3>
            {menuProduct.product.description && (
              <p className="text-sm text-muted-foreground">{menuProduct.product.description}</p>
            )}
          </div>
        )}

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (IDR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter price in IDR"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                {watchedPrice > 0 && (
                  <span className="font-medium text-foreground">
                    Preview: {formatPrice(watchedPrice)}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best describes this product in the menu
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Order */}
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter display order"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first in the menu (1 = first, 2 = second, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any special notes about this product in the menu..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about pricing, availability, or special instructions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Product' : 'Add to Menu')
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
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-1">
            <li>• Set competitive prices based on your target market</li>
            <li>• Use categories to organize your menu logically</li>
            <li>• Display order determines how products appear in the menu</li>
            <li>• Add notes for special pricing or preparation instructions</li>
          </ul>
        </div>
      </form>
    </Form>
  )
}
