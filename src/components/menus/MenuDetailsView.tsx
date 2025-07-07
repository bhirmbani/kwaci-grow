import { useState, useEffect } from 'react'
import { Coffee, Plus, Edit, Trash2, Search, ArrowUpDown, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MenuService } from '@/lib/services/menuService'
import { ProductSelector } from './ProductSelector'
import { MenuProductForm } from './MenuProductForm'
import type { MenuWithProducts, MenuProduct, Product } from '@/lib/db/schema'

interface MenuDetailsViewProps {
  menu: MenuWithProducts
  onClose: () => void
  onMenuUpdated: () => void
}

type SortField = 'name' | 'price' | 'category' | 'displayOrder'
type SortDirection = 'asc' | 'desc'

export function MenuDetailsView({ menu, onClose, onMenuUpdated }: MenuDetailsViewProps) {
  const [menuData, setMenuData] = useState<MenuWithProducts>(menu)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('displayOrder')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [loading, setLoading] = useState(false)
  
  // Sheet states
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingMenuProduct, setEditingMenuProduct] = useState<MenuProduct & { product: Product } | null>(null)
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingMenuProduct, setDeletingMenuProduct] = useState<MenuProduct & { product: Product } | null>(null)

  // Load menu data
  const loadMenuData = async () => {
    try {
      setLoading(true)
      const updatedMenu = await MenuService.getWithProducts(menu.id)
      if (updatedMenu) {
        setMenuData(updatedMenu)
      }
    } catch (error) {
      console.error('Failed to load menu data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenuData()
  }, [menu.id])

  // Filter and sort products
  const filteredProducts = menuData.products.filter(menuProduct =>
    menuProduct.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menuProduct.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.product.name.toLowerCase()
        bValue = b.product.name.toLowerCase()
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'category':
        aValue = a.category.toLowerCase()
        bValue = b.category.toLowerCase()
        break
      case 'displayOrder':
        aValue = a.displayOrder
        bValue = b.displayOrder
        break
      default:
        aValue = a.displayOrder
        bValue = b.displayOrder
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleAddProduct = () => {
    setIsProductSelectorOpen(true)
  }

  const handleEditProduct = (menuProduct: MenuProduct & { product: Product }) => {
    setEditingMenuProduct(menuProduct)
    setIsEditProductOpen(true)
  }

  const handleDeleteProduct = (menuProduct: MenuProduct & { product: Product }) => {
    setDeletingMenuProduct(menuProduct)
    setShowDeleteDialog(true)
  }

  const confirmDeleteProduct = async () => {
    if (!deletingMenuProduct) return

    try {
      await MenuService.removeProduct(deletingMenuProduct.id)
      await loadMenuData()
      onMenuUpdated()
      setShowDeleteDialog(false)
      setDeletingMenuProduct(null)
    } catch (error) {
      console.error('Failed to remove product from menu:', error)
    }
  }

  const handleProductAdded = async () => {
    setIsProductSelectorOpen(false)
    await loadMenuData()
    onMenuUpdated()
  }

  const handleProductUpdated = async () => {
    setIsEditProductOpen(false)
    setEditingMenuProduct(null)
    await loadMenuData()
    onMenuUpdated()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Menu Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{menuData.name}</h2>
              {menuData.description && (
                <p className="text-muted-foreground mt-1">{menuData.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={
                  menuData.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {menuData.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {menuData.products.length} products
                </span>
              </div>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Menu Products ({sortedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No products found' : 'No products in this menu'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Add products from your catalog to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="displayOrder">Order</SortableHeader>
                      <SortableHeader field="name">Product</SortableHeader>
                      <SortableHeader field="category">Category</SortableHeader>
                      <SortableHeader field="price">Price</SortableHeader>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((menuProduct) => (
                      <TableRow key={menuProduct.id}>
                        <TableCell className="font-medium">
                          {menuProduct.displayOrder}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{menuProduct.product.name}</p>
                            {menuProduct.note && (
                              <p className="text-xs text-muted-foreground">{menuProduct.note}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{menuProduct.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(menuProduct.price)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                            {menuProduct.product.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Package className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProduct(menuProduct)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(menuProduct)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Selector Sheet */}
      <Sheet open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
        <SheetContent className="w-[800px] sm:w-[800px] bg-background/20 dark:bg-background/80 backdrop-blur-3xl">
          <SheetHeader>
            <SheetTitle>Add Product to Menu</SheetTitle>
            <SheetDescription>
              Select a product from your catalog to add to "{menuData.name}"
            </SheetDescription>
          </SheetHeader>
          <ProductSelector
            menuId={menuData.id}
            existingProductIds={menuData.products.map(p => p.productId)}
            onProductAdded={handleProductAdded}
            onCancel={() => setIsProductSelectorOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Product Sheet */}
      <Sheet open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Menu Product</SheetTitle>
            <SheetDescription>
              Update the price, category, and display order for this product
            </SheetDescription>
          </SheetHeader>
          {editingMenuProduct && (
            <MenuProductForm
              menuProduct={editingMenuProduct}
              onSuccess={handleProductUpdated}
              onCancel={() => {
                setIsEditProductOpen(false)
                setEditingMenuProduct(null)
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product from Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingMenuProduct?.product.name}" from this menu?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
