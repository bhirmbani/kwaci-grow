import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Package, Plus, List, TrendingUp } from 'lucide-react'
import { useProductsWithCounts } from '@/hooks/useProducts'
import { ProductList } from './ProductList'
import { ProductForm } from './ProductForm'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function ProductManagement() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview')
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)
  const { products, loading, error, loadProducts } = useProductsWithCounts(includeInactive)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('products.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>{t('products.errorLoading', { error })}</p>
          <Button onClick={loadProducts} className="mt-4">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    )
  }

  const totalProducts = products.length
  const totalIngredients = products.reduce((sum, product) => sum + product.ingredientCount, 0)
  const averageIngredientsPerProduct = totalProducts > 0 ? (totalIngredients / totalProducts).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('products.title')}</h1>
          <p className="text-muted-foreground">
            {t('products.description')}
          </p>
        </div>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('products.create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('products.createNewTitle')}</SheetTitle>
              <SheetDescription>
                {t('products.createNewDescription')}
              </SheetDescription>
            </SheetHeader>
            <ProductForm
              onSuccess={() => {
                setIsCreateSheetOpen(false)
                loadProducts()
              }}
              onCancel={() => setIsCreateSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('products.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            {t('products.tabs.products')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('products.overview.totalProducts')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {t('products.overview.totalProductsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('products.overview.totalIngredients')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIngredients}</div>
                <p className="text-xs text-muted-foreground">
                  {t('products.overview.totalIngredientsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('products.overview.avgIngredients')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageIngredientsPerProduct}</div>
                <p className="text-xs text-muted-foreground">
                  {t('products.overview.avgIngredientsDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Recent Products */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('products.overview.recentProducts')}</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('products.overview.noProducts')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('products.overview.noProductsDesc')}
                    </p>
                    <Button onClick={() => setIsCreateSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('products.create')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('products.overview.ingredientsCount', { count: product.ingredientCount })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('products')}
                        >
                          {t('products.overview.viewDetails')}
                        </Button>
                      </div>
                    ))}
                    {products.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('products')}
                        >
                          {t('products.overview.viewAll', { count: products.length })}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('products.filters.title')}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-inactive"
                      checked={includeInactive}
                      onCheckedChange={setIncludeInactive}
                    />
                    <Label htmlFor="include-inactive" className="text-sm font-medium">
                      {t('products.filters.showInactive')}
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <ProductList products={products} onProductsChange={loadProducts} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
