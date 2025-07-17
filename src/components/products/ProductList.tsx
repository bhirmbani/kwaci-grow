import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Search, Package, Calculator } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductForm } from './ProductForm'
import { ProductIngredientManager } from './ProductIngredientManager'
import { formatCurrency } from '@/utils/formatters'
import type { Product } from '@/lib/db/schema'

interface ProductListProps {
  products: Array<Product & { ingredientCount: number, cogsPerCup: number }>
  onProductsChange: () => void
}

export function ProductList({ products, onProductsChange }: ProductListProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false)
  const { deleteProduct } = useProducts()

  // Debug logging to check COGS data
  console.log('ProductList - Received products:', products.length)
  if (products.length > 0) {
    console.log('ProductList - Sample product:', products[0])
    console.log('ProductList - Sample COGS:', products[0].cogsPerCup)
  }

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditSheetOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewSheetOpen(true)
  }

  const handleDelete = async (product: Product) => {
    const result = await deleteProduct(product.id)
    if (result.success) {
      onProductsChange()
    }
  }

  const handleEditSuccess = () => {
    setIsEditSheetOpen(false)
    setEditingProduct(null)
    onProductsChange()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('products.list.title', { count: filteredProducts.length })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('products.list.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? t('products.list.noProductsFound') : t('products.list.noProducts')}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? t('products.list.tryAdjustSearch')
                : t('products.list.createFirst')}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.list.table.name')}</TableHead>
                <TableHead>{t('products.list.table.description')}</TableHead>
                <TableHead>{t('products.list.table.ingredients')}</TableHead>
                <TableHead className="text-right">{t('products.list.table.cogsPerCup')}</TableHead>
                <TableHead>{t('products.list.table.status')}</TableHead>
                <TableHead>{t('products.list.table.created')}</TableHead>
                <TableHead>{t('products.list.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t('products.list.ingredientCount', { count: product.ingredientCount })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium">
                        {product.cogsPerCup > 0 ? formatCurrency(product.cogsPerCup) : '-'}
                      </span>
                      {product.cogsPerCup > 0 && (
                        <Calculator className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? t('products.list.badge.active') : t('products.list.badge.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* View Details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(product)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('products.list.deleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('products.list.deleteDescription', { name: product.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                              {t('common.delete')}
                          </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Product Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('products.list.editSheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('products.list.editSheetDescription')}
              </SheetDescription>
            </SheetHeader>
            {editingProduct && (
              <ProductForm
                product={editingProduct}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditSheetOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* View Product Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent className="w-[800px] sm:w-[800px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('products.list.viewSheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('products.list.viewSheetDescription')}
              </SheetDescription>
            </SheetHeader>
            {selectedProduct && (
              <ProductIngredientManager
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                onClose={() => setIsViewSheetOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}
