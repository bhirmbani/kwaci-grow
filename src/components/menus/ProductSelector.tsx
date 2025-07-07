import { useState, useEffect } from 'react'
import { Search, Package, Plus, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ProductService } from '@/lib/services/productService'
import { MenuProductForm } from './MenuProductForm'
import type { Product } from '@/lib/db/schema'

interface ProductSelectorProps {
  menuId: string
  existingProductIds: string[]
  onProductAdded: () => void
  onCancel: () => void
}

export function ProductSelector({ 
  menuId, 
  existingProductIds, 
  onProductAdded, 
  onCancel 
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await ProductService.getAll(false) // Only active products
      setProducts(allProducts)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Filter products
  const availableProducts = products.filter(product => 
    !existingProductIds.includes(product.id)
  )

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsAddFormOpen(true)
  }

  const handleProductAdded = () => {
    setIsAddFormOpen(false)
    setSelectedProduct(null)
    onProductAdded()
  }

  const handleFormCancel = () => {
    setIsAddFormOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 mt-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {availableProducts.length === 0 
                ? 'All products already added'
                : searchQuery 
                  ? 'No products found'
                  : 'No products available'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {availableProducts.length === 0 
                ? 'All available products have been added to this menu'
                : searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create some products first to add them to menus'
              }
            </p>
            {availableProducts.length === 0 && (
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleSelectProduct(product)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-foreground truncate">
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Coffee className="h-3 w-3 mr-1" />
                          Product
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectProduct(product)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Note */}
                  {product.note && (
                    <div className="mt-3 p-2 bg-muted/30 rounded-md">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-medium">Note:</span> {product.note}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge 
                      variant={product.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>
              Showing {filteredProducts.length} of {availableProducts.length} available products
              {existingProductIds.length > 0 && (
                <span> ({existingProductIds.length} already in menu)</span>
              )}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Add Product Form Sheet */}
      <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <SheetContent className="w-[600px] sm:w-[600px] bg-background/20 dark:bg-background/80 backdrop-blur-3xl">
          <SheetHeader>
            <SheetTitle>Add Product to Menu</SheetTitle>
            <SheetDescription>
              Set the price, category, and display order for "{selectedProduct?.name}"
            </SheetDescription>
          </SheetHeader>
          {selectedProduct && (
            <MenuProductForm
              menuId={menuId}
              productId={selectedProduct.id}
              onSuccess={handleProductAdded}
              onCancel={handleFormCancel}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
