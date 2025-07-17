import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Package, Calculator, Plus, Zap } from 'lucide-react'
import { ProductService } from '@/lib/services/productService'
import { WarehouseService } from '@/lib/services/warehouseService'
import { useStockLevels } from '@/hooks/useStock'
import { formatCurrency } from '@/utils/formatters'
import type { Product, ProductWithIngredients } from '@/lib/db/schema'

// Form schema for validation
const warehouseFormSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  numberOfCups: z.number().min(1, 'Number of cups must be at least 1'),
  smartStockCalculation: z.boolean().default(false),
  batchNote: z.string().optional()
})

type WarehouseFormData = z.infer<typeof warehouseFormSchema>

interface ProductBasedWarehouseFormProps {
  onSuccess?: () => void
}

// Utility functions for minimum purchase quantity calculations
function calculateActualQuantityToAdd(quantityToAdd: number, baseUnitQuantity: number): number {
  if (quantityToAdd <= 0 || baseUnitQuantity <= 0) {
    return quantityToAdd
  }
  return Math.ceil(quantityToAdd / baseUnitQuantity) * baseUnitQuantity
}

function calculatePurchaseUnits(quantityToAdd: number, baseUnitQuantity: number): number {
  if (quantityToAdd <= 0 || baseUnitQuantity <= 0) {
    return 0
  }
  return Math.ceil(quantityToAdd / baseUnitQuantity)
}

interface CalculatedIngredient {
  ingredientId: string
  ingredientName: string
  unit: string
  usagePerCup: number
  requiredQuantity: number
  currentStock: number
  quantityToAdd: number
  baseUnitQuantity: number
  actualQuantityToAdd: number
  purchaseUnits: number
  costPerUnit: number
  totalCost: number
}

export function ProductBasedWarehouseForm({ onSuccess }: ProductBasedWarehouseFormProps) {
  const { t } = useTranslation()
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
      smartStockCalculation: false,
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
        setMessage({ type: 'error', text: t('warehouse.form.messages.failedLoadProducts') })
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
      setMessage({ type: 'error', text: t('warehouse.form.messages.failedLoadIngredients') })
    } finally {
      setLoading(false)
    }
  }

  // Get current stock for an ingredient
  const getCurrentStock = (ingredientName: string, unit: string) => {
    const stock = stockLevels.find(s => s.ingredientName === ingredientName && s.unit === unit)
    return stock ? stock.currentStock - stock.reservedStock : 0
  }

  // Calculate ingredient quantities and costs based on number of cups
  const numberOfCups = form.watch('numberOfCups') || 1
  const smartStockCalculation = form.watch('smartStockCalculation') || false
  const calculatedIngredients = useMemo((): CalculatedIngredient[] => {
    if (!selectedProduct) return []

    return selectedProduct.ingredients.map(pi => {
      const ingredient = pi.ingredient
      const requiredQuantity = numberOfCups * pi.usagePerCup
      const currentStock = getCurrentStock(ingredient.name, ingredient.unit)
      const quantityToAdd = smartStockCalculation
        ? Math.max(0, requiredQuantity - currentStock)
        : requiredQuantity

      // Calculate actual quantity to add based on minimum purchase quantity
      const actualQuantityToAdd = calculateActualQuantityToAdd(quantityToAdd, ingredient.baseUnitQuantity)
      const purchaseUnits = calculatePurchaseUnits(quantityToAdd, ingredient.baseUnitQuantity)

      const costPerUnit = ingredient.baseUnitCost / ingredient.baseUnitQuantity
      const totalCost = actualQuantityToAdd * costPerUnit

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        usagePerCup: pi.usagePerCup,
        requiredQuantity,
        currentStock,
        quantityToAdd,
        baseUnitQuantity: ingredient.baseUnitQuantity,
        actualQuantityToAdd,
        purchaseUnits,
        costPerUnit,
        totalCost
      }
    })
  }, [selectedProduct, numberOfCups, smartStockCalculation, stockLevels])

  // Calculate total batch cost
  const totalBatchCost = useMemo(() => {
    return calculatedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  }, [calculatedIngredients])

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      setSubmitting(true)
      setMessage(null)

      if (calculatedIngredients.length === 0) {
        setMessage({ type: 'error', text: t('warehouse.form.messages.noIngredients') })
        return
      }

      // Filter ingredients that need to be added (actual quantity > 0)
      const itemsToAdd = calculatedIngredients.filter(ing => ing.actualQuantityToAdd > 0)

      if (itemsToAdd.length === 0) {
        setMessage({
          type: 'error',
          text: t('warehouse.form.messages.stockSufficient')
        })
        return
      }

      // Create warehouse batch
      const batchNote = data.batchNote ||
        `${data.numberOfCups} cups of ${selectedProduct?.name} - ${data.smartStockCalculation ? 'Smart stock calculation' : 'Auto-calculated from product recipe'}`

      const batch = await WarehouseService.createBatch({
        dateAdded: new Date().toISOString(),
        note: batchNote
      })

      // Prepare warehouse items from ingredients that need to be added
      const warehouseItems = itemsToAdd.map(ing => ({
        ingredientName: ing.ingredientName,
        quantity: ing.actualQuantityToAdd,
        unit: ing.unit,
        costPerUnit: ing.costPerUnit,
        totalCost: ing.totalCost,
        note: data.smartStockCalculation
          ? `Smart calculation: ${ing.actualQuantityToAdd} ${ing.unit} purchased (${ing.quantityToAdd} ${ing.unit} needed, ${ing.purchaseUnits} units of ${ing.baseUnitQuantity}${ing.unit} each)`
          : `Auto-calculated: ${ing.actualQuantityToAdd} ${ing.unit} purchased (${data.numberOfCups} cups × ${ing.usagePerCup} ${ing.unit}/cup, ${ing.purchaseUnits} units of ${ing.baseUnitQuantity}${ing.unit} each)`
      }))

      // Add items to batch
      await WarehouseService.addItemsToBatch(batch.id, warehouseItems)

      setMessage({
        type: 'success',
        text: t('warehouse.form.messages.successAdd', {
          count: itemsToAdd.length,
          batch: batch.batchNumber,
          cups: data.numberOfCups,
          product: selectedProduct?.name
        })
      })

      // Reset form
      form.reset()
      setSelectedProduct(null)

      // Call success callback
      onSuccess?.()

    } catch (error) {
      console.error('Failed to add items to warehouse:', error)
      setMessage({ type: 'error', text: t('warehouse.form.messages.failedAdd') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('warehouse.form.header')}</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection and Cups Input */}
          <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('warehouse.form.productQuantity')}</CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.form.fields.product')}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleProductChange(value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('warehouse.form.placeholders.product')} />
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
                    <FormLabel>{t('warehouse.form.fields.numberOfCups')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder={t('warehouse.form.placeholders.numberOfCups')}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedProduct && (
                      <p className="text-xs text-muted-foreground">
                        {t('warehouse.form.autoCalcHint')}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smartStockCalculation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {t('warehouse.form.fields.smartStock')}
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {t('warehouse.form.smartStockHint')}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.form.fields.batchNote')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('warehouse.form.placeholders.batchNote')}
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
                  {smartStockCalculation ? <Zap className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
                  {t(smartStockCalculation ? 'warehouse.form.calculated.titleSmart' : 'warehouse.form.calculated.titleDefault')} {t('warehouse.form.calculated.forCups', { cups: numberOfCups, product: selectedProduct.name })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {smartStockCalculation
                    ? t('warehouse.form.calculated.explanationSmart')
                    : t('warehouse.form.calculated.explanation')
                  }
                  {t('warehouse.form.calculated.roundedInfo')}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('warehouse.form.table.ingredient')}</TableHead>
                      <TableHead>{t('warehouse.form.table.currentStock')}</TableHead>
                      <TableHead>{t('warehouse.form.table.usagePerCup')}</TableHead>
                      <TableHead>{t('warehouse.form.table.requiredQuantity')}</TableHead>
                      <TableHead>{t('warehouse.form.table.theoreticalNeed')}</TableHead>
                      <TableHead>{t('warehouse.form.table.actualQuantityToAdd')}</TableHead>
                      <TableHead>{t('warehouse.form.table.purchaseInfo')}</TableHead>
                      <TableHead>{t('warehouse.form.table.costPerUnit')}</TableHead>
                      <TableHead>{t('warehouse.form.table.totalCost')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculatedIngredients.map((ingredient) => {
                      return (
                        <TableRow key={ingredient.ingredientId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ingredient.ingredientName}</p>
                              <p className="text-xs text-muted-foreground">Unit: {ingredient.unit}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={ingredient.currentStock <= 10 ? 'text-orange-600' : 'text-green-600'}>
                              {ingredient.currentStock} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {ingredient.usagePerCup} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {ingredient.requiredQuantity.toFixed(2)} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm ${ingredient.quantityToAdd === 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {ingredient.quantityToAdd.toFixed(2)} {ingredient.unit}
                              {ingredient.quantityToAdd === 0 && smartStockCalculation && (
                                <span className="text-xs text-green-600 ml-1">✓ {t('warehouse.form.table.sufficient')}</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className={`font-medium ${ingredient.actualQuantityToAdd === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {ingredient.actualQuantityToAdd.toFixed(2)} {ingredient.unit}
                              </span>
                              {ingredient.actualQuantityToAdd !== ingredient.quantityToAdd && ingredient.actualQuantityToAdd > 0 && (
                                <p className="text-xs text-orange-600">
                                  {t('warehouse.form.table.roundedUpFrom', { quantity: ingredient.quantityToAdd.toFixed(2), unit: ingredient.unit })}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {ingredient.purchaseUnits > 0 ? (
                                <>
                                  <span className="font-medium">{ingredient.purchaseUnits}</span>
                                  <span className="text-muted-foreground"> units of </span>
                                  <span className="font-medium">{ingredient.baseUnitQuantity}{ingredient.unit}</span>
                                  <span className="text-muted-foreground"> each</span>
                                </>
                              ) : (
                                <span className="text-green-600">{t('warehouse.form.table.noPurchaseNeeded')}</span>
                              )}
                            </div>
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
                    <span className="font-medium">{t('warehouse.form.totalCost.label')}</span>
                    <span className="text-lg font-bold">{formatCurrency(totalBatchCost)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {smartStockCalculation
                      ? t('warehouse.form.totalCost.costForDeficit', { cups: numberOfCups, product: selectedProduct.name })
                      : t('warehouse.form.totalCost.costFor', { cups: numberOfCups, product: selectedProduct.name })
                    }
                  </p>
                  {smartStockCalculation && totalBatchCost === 0 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✓</span>
                      {t('warehouse.form.totalCost.sufficient')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              submitting ||
              !selectedProduct ||
              loading ||
              calculatedIngredients.length === 0 ||
              (smartStockCalculation && calculatedIngredients.every(ing => ing.actualQuantityToAdd === 0))
            }
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {submitting
              ? t('warehouse.form.buttons.submitAdding')
              : smartStockCalculation && calculatedIngredients.every(ing => ing.actualQuantityToAdd === 0)
                ? t('warehouse.form.buttons.submitNoItems')
                : t('warehouse.form.buttons.submitAdd', { count: calculatedIngredients.filter(ing => ing.actualQuantityToAdd > 0).length })
            }
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
