import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Package, Calculator, Plus } from 'lucide-react'
import { ProductService } from '@/lib/services/productService'
import { WarehouseService } from '@/lib/services/warehouseService'
import { useStockLevels } from '@/hooks/useStock'
import { formatCurrency } from '@/utils/formatters'
import type { Product, ProductWithIngredients } from '@/lib/db/schema'

// Form schema for validation
const warehouseFormSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  numberOfCups: z.number().min(1, 'Number of cups must be at least 1'),
  batchNote: z.string().optional()
})

type WarehouseFormData = z.infer<typeof warehouseFormSchema>

interface ProductBasedWarehouseFormProps {
  onSuccess?: () => void
}

interface CalculatedIngredient {
  ingredientId: string
  ingredientName: string
  unit: string
  usagePerCup: number
  calculatedQuantity: number
  costPerUnit: number
  totalCost: number
}

export function ProductBasedWarehouseForm({ onSuccess }: ProductBasedWarehouseFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductWithIngredients | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { stockLevels } = useStockLevels()

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      productId: '',
      numberOfCups: 1,
      batchNote: ''
    }
  })

  // Load active products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const allProducts = await ProductService.getAll(false) // Only active products
        setProducts(allProducts)
      } catch (error) {
        console.error('Failed to load products:', error)
        setMessage({ type: 'error', text: 'Failed to load products' })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Load product ingredients when product is selected
  const handleProductChange = async (productId: string) => {
    if (!productId) {
      setSelectedProduct(null)
      return
    }

    try {
      setLoading(true)
      const productWithIngredients = await ProductService.getWithIngredients(productId)
      if (productWithIngredients) {
        setSelectedProduct(productWithIngredients)
      }
    } catch (error) {
      console.error('Failed to load product ingredients:', error)
      setMessage({ type: 'error', text: 'Failed to load product ingredients' })
    } finally {
      setLoading(false)
    }
  }

  // Calculate ingredient quantities and costs based on number of cups
  const numberOfCups = form.watch('numberOfCups') || 1
  const calculatedIngredients = useMemo((): CalculatedIngredient[] => {
    if (!selectedProduct) return []

    return selectedProduct.ingredients.map(pi => {
      const ingredient = pi.ingredient
      const calculatedQuantity = numberOfCups * pi.usagePerCup
      const costPerUnit = ingredient.baseUnitCost / ingredient.baseUnitQuantity
      const totalCost = calculatedQuantity * costPerUnit

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        usagePerCup: pi.usagePerCup,
        calculatedQuantity,
        costPerUnit,
        totalCost
      }
    })
  }, [selectedProduct, numberOfCups])

  // Calculate total batch cost
  const totalBatchCost = useMemo(() => {
    return calculatedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  }, [calculatedIngredients])

  // Get current stock for an ingredient
  const getCurrentStock = (ingredientName: string, unit: string) => {
    const stock = stockLevels.find(s => s.ingredientName === ingredientName && s.unit === unit)
    return stock ? stock.currentStock - stock.reservedStock : 0
  }

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      setSubmitting(true)
      setMessage(null)

      if (calculatedIngredients.length === 0) {
        setMessage({ type: 'error', text: 'No ingredients found for the selected product' })
        return
      }

      // Create warehouse batch
      const batch = await WarehouseService.createBatch({
        dateAdded: new Date().toISOString(),
        note: data.batchNote || `${data.numberOfCups} cups of ${selectedProduct?.name} - Auto-calculated from product recipe`
      })

      // Prepare warehouse items from calculated ingredients
      const warehouseItems = calculatedIngredients.map(ing => ({
        ingredientName: ing.ingredientName,
        quantity: ing.calculatedQuantity,
        unit: ing.unit,
        costPerUnit: ing.costPerUnit,
        totalCost: ing.totalCost,
        note: `Auto-calculated: ${data.numberOfCups} cups × ${ing.usagePerCup} ${ing.unit}/cup`
      }))

      // Add items to batch
      await WarehouseService.addItemsToBatch(batch.id, warehouseItems)

      setMessage({
        type: 'success',
        text: `Successfully added ${calculatedIngredients.length} ingredients to warehouse batch #${batch.batchNumber} for ${data.numberOfCups} cups of ${selectedProduct?.name}`
      })

      // Reset form
      form.reset()
      setSelectedProduct(null)

      // Call success callback
      onSuccess?.()

    } catch (error) {
      console.error('Failed to add items to warehouse:', error)
      setMessage({ type: 'error', text: 'Failed to add items to warehouse' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Add Items to Warehouse</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection and Cups Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product & Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleProductChange(value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product to calculate ingredients for..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfCups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Cups to Prepare</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter number of cups..."
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedProduct && (
                      <p className="text-xs text-muted-foreground">
                        Ingredient quantities will be auto-calculated based on the product recipe
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note for this warehouse batch..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Calculated Ingredients */}
          {selectedProduct && calculatedIngredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculated Ingredients for {numberOfCups} cups of {selectedProduct.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Quantities and costs are automatically calculated based on the product recipe
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Usage per Cup</TableHead>
                      <TableHead>Calculated Quantity</TableHead>
                      <TableHead>Cost per Unit</TableHead>
                      <TableHead>Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculatedIngredients.map((ingredient) => {
                      const currentStock = getCurrentStock(ingredient.ingredientName, ingredient.unit)

                      return (
                        <TableRow key={ingredient.ingredientId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ingredient.ingredientName}</p>
                              <p className="text-xs text-muted-foreground">Unit: {ingredient.unit}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={currentStock <= 10 ? 'text-orange-600' : 'text-green-600'}>
                              {currentStock} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {ingredient.usagePerCup} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {ingredient.calculatedQuantity.toFixed(2)} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatCurrency(ingredient.costPerUnit)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(ingredient.totalCost)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Total Cost Summary */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Batch Cost:</span>
                    <span className="text-lg font-bold">{formatCurrency(totalBatchCost)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cost for {numberOfCups} cups of {selectedProduct.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || !selectedProduct || loading || calculatedIngredients.length === 0}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {submitting ? 'Adding to Warehouse...' : `Add ${calculatedIngredients.length} Ingredients to Warehouse`}
          </Button>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
