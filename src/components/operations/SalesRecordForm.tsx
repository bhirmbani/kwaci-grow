import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import { SalesRecordService } from '@/lib/services/salesRecordService'
import { SalesTargetService } from '@/lib/services/salesTargetService'
import { MenuService } from '@/lib/services/menuService'
import { BranchService } from '@/lib/services/branchService'
import { formatCurrency } from '@/utils/formatters'
import type { Branch, MenuWithProducts, Product, MenuProduct } from '@/lib/db/schema'

const salesRecordSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  menuId: z.string().min(1, 'Menu is required'),
  productId: z.string().min(1, 'Product is required'),
  saleDate: z.string().min(1, 'Sale date is required'),
  saleTime: z.string().min(1, 'Sale time is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  note: z.string().optional(),
})

type SalesRecordData = z.infer<typeof salesRecordSchema>

interface SalesRecordFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function SalesRecordForm({ onSuccess, onCancel }: SalesRecordFormProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [menus, setMenus] = useState<MenuWithProducts[]>([])
  const [availableProducts, setAvailableProducts] = useState<(Product & { menuProduct: MenuProduct })[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const form = useForm<SalesRecordData>({
    resolver: zodResolver(salesRecordSchema),
    defaultValues: {
      branchId: '',
      menuId: '',
      productId: '',
      saleDate: format(new Date(), 'yyyy-MM-dd'),
      saleTime: format(new Date(), 'HH:mm:ss'),
      quantity: 1,
      unitPrice: 0,
      note: '',
    },
  })

  const { watch, setValue } = form
  const selectedMenuId = watch('menuId')
  const selectedProductId = watch('productId')
  const quantity = watch('quantity')
  const unitPrice = watch('unitPrice')

  // Calculate total amount
  const totalAmount = quantity * unitPrice

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesData, menusData] = await Promise.all([
          BranchService.getAllBranches(),
          MenuService.getAllMenusWithProducts()
        ])

        setBranches(branchesData.filter(branch => branch.isActive))
        setMenus(menusData.filter(menu => menu.status === 'active'))
      } catch (error) {
        console.error('Failed to load form data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Update available products when menu changes
  useEffect(() => {
    if (selectedMenuId) {
      const selectedMenu = menus.find(menu => menu.id === selectedMenuId)
      if (selectedMenu) {
        const products = selectedMenu.products
          .filter(mp => mp.product.isActive)
          .map(mp => ({
            ...mp.product,
            menuProduct: mp
          }))
        setAvailableProducts(products)
        
        // Reset product selection
        setValue('productId', '')
        setValue('unitPrice', 0)
      }
    } else {
      setAvailableProducts([])
    }
  }, [selectedMenuId, menus, setValue])

  // Update unit price when product changes
  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = availableProducts.find(p => p.id === selectedProductId)
      if (selectedProduct) {
        setValue('unitPrice', selectedProduct.menuProduct.price)
      }
    }
  }, [selectedProductId, availableProducts, setValue])

  const onSubmit = async (data: SalesRecordData) => {
    try {
      await SalesRecordService.createRecord({
        ...data,
        totalAmount,
        note: data.note || '',
      })

      onSuccess()
    } catch (error) {
      console.error('Failed to create sales record:', error)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('saleDate', format(date, 'yyyy-MM-dd'))
      setCalendarOpen(false)
    }
  }

  const setCurrentTime = () => {
    setValue('saleTime', format(new Date(), 'HH:mm:ss'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Branch Selection */}
        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Menu Selection */}
        <FormField
          control={form.control}
          name="menuId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a menu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name} ({menu.products.length} products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Selection */}
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!selectedMenuId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.menuProduct.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sale Date */}
          <FormField
            control={form.control}
            name="saleDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sale Date</FormLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Time */}
          <FormField
            control={form.control}
            name="saleTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Time</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="time"
                      step="1"
                      {...field}
                      className="flex-1"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={setCurrentTime}
                    title="Set current time"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quantity and Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Price */}
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price (IDR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Amount (Read-only) */}
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this sale..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Record Sale
          </Button>
        </div>
      </form>
    </Form>
  )
}
