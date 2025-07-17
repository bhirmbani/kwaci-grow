import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit2, Check, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { formatCurrency } from "@/utils/formatters"
import type { ProductTargetForDate } from "@/lib/services/dailyProductSalesTargetService"

const productTargetSchema = z.object({
  targetQuantity: z.number().min(0, 'Target must be 0 or greater'),
  note: z.string().optional(),
})

type ProductTargetFormData = z.infer<typeof productTargetSchema>

interface ProductTargetRowProps {
  product: ProductTargetForDate
  onUpdate: (productId: string, targetQuantity: number, note: string) => Promise<void>
  isUpdating?: boolean
}

export function ProductTargetRow({
  product,
  onUpdate,
  isUpdating = false
}: ProductTargetRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { t } = useTranslation()

  const form = useForm<ProductTargetFormData>({
    resolver: zodResolver(productTargetSchema),
    defaultValues: {
      targetQuantity: product.targetQuantity,
      note: product.note || '',
    },
  })

  const estimatedRevenue = product.targetQuantity * product.menuProduct.price

  const handleEdit = () => {
    setIsEditing(true)
    form.reset({
      targetQuantity: product.targetQuantity,
      note: product.note || '',
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset({
      targetQuantity: product.targetQuantity,
      note: product.note || '',
    })
  }

  const handleSave = async (data: ProductTargetFormData) => {
    setIsSaving(true)
    try {
      await onUpdate(
        product.productId,
        data.targetQuantity,
        data.note || ''
      )
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving target:', error)
      // Form will show validation errors if any
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      form.handleSubmit(handleSave)()
    }
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/20 rounded-lg border">
            {/* Product Info */}
            <div className="col-span-4">
              <div className="font-medium">{product.product.name}</div>
              <div className="text-sm text-muted-foreground">
                {product.product.description}
              </div>
              {product.menuProduct.category && (
                <Badge variant="outline" className="text-xs mt-1">
                  {product.menuProduct.category}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="col-span-2 text-center flex items-center justify-center">
              <span className="text-sm font-medium">
                {formatCurrency(product.menuProduct.price)}
              </span>
            </div>

            {/* Target Quantity Input */}
            <div className="col-span-2 flex items-center">
              <FormField
                control={form.control}
                name="targetQuantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="text-center"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estimated Revenue */}
            <div className="col-span-2 text-center flex items-center justify-center">
              <span className="text-sm">
                {formatCurrency(
                  (form.watch('targetQuantity') || 0) * product.menuProduct.price
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="sm"
                      variant="default"
                      disabled={isSaving || isUpdating}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('salesTargets.productRow.saveTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving || isUpdating}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('salesTargets.productRow.cancelTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Note Input (Full Width) */}
            <div className="col-span-12 mt-2">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t('salesTargets.productRow.notePlaceholder')}
                        className="min-h-[60px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 rounded-lg transition-colors">
      {/* Product Info */}
      <div className="col-span-4">
        <div className="font-medium">{product.product.name}</div>
        <div className="text-sm text-muted-foreground">
          {product.product.description}
        </div>
        {product.menuProduct.category && (
          <Badge variant="outline" className="text-xs mt-1">
            {product.menuProduct.category}
          </Badge>
        )}
        {product.note && (
          <div className="text-xs text-muted-foreground mt-1 italic">
            {t('salesTargets.productRow.noteLabel', { note: product.note })}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="col-span-2 text-center flex items-center justify-center">
        <span className="text-sm font-medium">
          {formatCurrency(product.menuProduct.price)}
        </span>
      </div>

      {/* Target Quantity */}
      <div className="col-span-2 text-center flex items-center justify-center">
        <Badge 
          variant={product.targetQuantity > 0 ? "default" : "secondary"}
          className="text-sm"
        >
          {product.targetQuantity}
        </Badge>
      </div>

      {/* Estimated Revenue */}
      <div className="col-span-2 text-center flex items-center justify-center">
        <span className="text-sm font-medium">
          {formatCurrency(estimatedRevenue)}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                disabled={isUpdating}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('salesTargets.productRow.editTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
