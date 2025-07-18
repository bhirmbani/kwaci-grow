import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Building2, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBusinessStore, useBusinesses, useCurrentBusiness } from "@/lib/stores/businessStore"
import { BusinessService } from "@/lib/services/businessService"
import { getCurrencyOptions, DEFAULT_CURRENCY } from "@/lib/utils/currencyUtils"
import type { Business } from "@/lib/db/schema"

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  note: z.string().max(1000, "Note must be less than 1000 characters").optional(),
  currency: z.string().min(1, "Currency is required"),
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessManagementSheetProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: 'create' | 'manage' // Add mode to distinguish between create and manage
}

export function BusinessManagementSheet({
  children,
  open,
  onOpenChange,
  mode = 'manage' // Default to manage mode
}: BusinessManagementSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const businesses = useBusinesses()
  const currentBusiness = useCurrentBusiness()
  const { addBusiness, updateBusiness, removeBusiness, setCurrentBusiness, loadBusinesses } = useBusinessStore()

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      description: "",
      note: "",
      currency: DEFAULT_CURRENCY,
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }

    if (!newOpen) {
      setEditingBusiness(null)
      // Reset form to default values
      form.reset({
        name: "",
        description: "",
        note: "",
        currency: DEFAULT_CURRENCY,
      })
    }
  }

  // Reset form when opening in create mode
  React.useEffect(() => {
    if (open && mode === 'create' && !editingBusiness) {
      form.reset({
        name: "",
        description: "",
        note: "",
        currency: DEFAULT_CURRENCY,
      })
    }
  }, [open, mode, editingBusiness, form])

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    form.reset({
      name: business.name,
      description: business.description || "",
      note: business.note || "",
      currency: business.currency || DEFAULT_CURRENCY,
    })
  }

  const handleDelete = async (business: Business) => {
    if (businesses.length <= 1) {
      alert("Cannot delete the last business. At least one business must exist.")
      return
    }

    try {
      await BusinessService.delete(business.id)
      removeBusiness(business.id)
      
      // If we deleted the current business, switch to another one
      if (currentBusiness?.id === business.id && businesses.length > 1) {
        const remainingBusiness = businesses.find(b => b.id !== business.id)
        if (remainingBusiness) {
          setCurrentBusiness(remainingBusiness)
        }
      }
      
      setDeletingBusiness(null)
    } catch (error) {
      console.error("Failed to delete business:", error)
      alert("Failed to delete business. Please try again.")
    }
  }

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true)
    try {
      if (editingBusiness) {
        // Update existing business
        await BusinessService.update(editingBusiness.id, data)
        updateBusiness(editingBusiness.id, data)
      } else {
        // Create new business
        const newBusiness = await BusinessService.create({
          name: data.name,
          description: data.description,
          note: data.note || "",
          currency: data.currency,
        })
        addBusiness(newBusiness)
      }

      form.reset()
      setEditingBusiness(null)
      handleOpenChange(false)
    } catch (error) {
      console.error("Failed to save business:", error)
      alert("Failed to save business. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSheetOpen = open !== undefined ? open : isOpen

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
        {children && <SheetTrigger asChild>{children}</SheetTrigger>}
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingBusiness
                ? "Edit Business"
                : mode === 'create'
                  ? "Add New Business"
                  : "Manage Businesses"
              }
            </SheetTitle>
            <SheetDescription>
              {editingBusiness
                ? "Update business information (currency cannot be changed)"
                : mode === 'create'
                  ? "Create a new business with your preferred currency"
                  : "Create and manage your businesses"
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Business Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Coffee Shop" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={editingBusiness ? "text-muted-foreground" : ""}>
                        Currency {editingBusiness && <span className="text-xs font-normal">(Read-only)</span>}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!editingBusiness} // Disable when editing existing business
                      >
                        <FormControl>
                          <SelectTrigger className={editingBusiness ? "opacity-60 cursor-not-allowed" : ""}>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCurrencyOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {editingBusiness
                          ? "Currency cannot be changed after business creation for data consistency"
                          : "Select the currency for this business (cannot be changed later)"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A cozy coffee shop in downtown" {...field} />
                      </FormControl>
                      <FormDescription>
                        A brief description of your business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this business..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional notes or information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingBusiness ? "Update Business" : "Create Business"}
                  </Button>
                  {editingBusiness && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingBusiness(null)
                        form.reset()
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            {/* Existing Businesses List - only show in manage mode */}
            {!editingBusiness && mode === 'manage' && businesses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Existing Businesses</h3>
                <div className="space-y-2">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="size-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{business.name}</div>
                          {business.description && (
                            <div className="text-sm text-muted-foreground">
                              {business.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(business)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingBusiness(business)}
                          disabled={businesses.length <= 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBusiness} onOpenChange={() => setDeletingBusiness(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBusiness?.name}"? This action cannot be undone.
              All data associated with this business will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBusiness && handleDelete(deletingBusiness)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
