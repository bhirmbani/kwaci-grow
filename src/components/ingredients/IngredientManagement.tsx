import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Package, Plus, List, TrendingUp } from 'lucide-react'
import { useIngredientsWithCounts, useIngredientCategories } from '@/hooks/useIngredients'
import { IngredientList } from './IngredientList'
import { IngredientForm } from './IngredientForm'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function IngredientManagement() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients'>('overview')
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)
  const { ingredients, loading, error, loadIngredients } = useIngredientsWithCounts(includeInactive)
  const { categories } = useIngredientCategories()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('ingredients.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>{t('ingredients.errorLoading', { error })}</p>
          <Button onClick={loadIngredients} className="mt-4">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    )
  }

  const totalIngredients = ingredients.length
  const totalUsages = ingredients.reduce((sum, ingredient) => sum + ingredient.usageCount, 0)
  const averageUsagePerIngredient = totalIngredients > 0 ? (totalUsages / totalIngredients).toFixed(1) : '0'
  const totalCategories = categories.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('ingredients.title')}</h1>
          <p className="text-muted-foreground">
            {t('ingredients.description')}
          </p>
        </div>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('ingredients.create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('ingredients.createNewTitle')}</SheetTitle>
              <SheetDescription>
                {t('ingredients.createNewDescription')}
              </SheetDescription>
            </SheetHeader>
            <IngredientForm
              onSuccess={() => {
                setIsCreateSheetOpen(false)
                loadIngredients()
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
            {t('ingredients.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            {t('ingredients.tabs.ingredients')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ingredients.overview.totalIngredients')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIngredients}</div>
                <p className="text-xs text-muted-foreground">
                  {t('ingredients.overview.totalIngredientsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ingredients.overview.categories')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">
                  {t('ingredients.overview.categoriesDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ingredients.overview.totalUsages')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsages}</div>
                <p className="text-xs text-muted-foreground">
                  {t('ingredients.overview.totalUsagesDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ingredients.overview.avgUsage')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageUsagePerIngredient}</div>
                <p className="text-xs text-muted-foreground">
                  {t('ingredients.overview.avgUsageDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Recent Ingredients */}
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('ingredients.overview.recentIngredients')}</CardTitle>
              </CardHeader>
              <CardContent>
                {ingredients.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('ingredients.overview.noIngredients')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('ingredients.overview.noIngredientsDesc')}
                    </p>
                    <Button onClick={() => setIsCreateSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('ingredients.create')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ingredients.slice(0, 5).map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{ingredient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {ingredient.categoryName || t('ingredients.overview.noCategory')} • {ingredient.unit}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('ingredients.overview.usedInProducts', { count: ingredient.usageCount })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('ingredients')}
                        >
                          {t('ingredients.overview.viewDetails')}
                        </Button>
                      </div>
                    ))}
                    {ingredients.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('ingredients')}
                        >
                          {t('ingredients.overview.viewAll', { count: ingredients.length })}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ingredients">
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('ingredients.filters.title')}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-inactive"
                      checked={includeInactive}
                      onCheckedChange={setIncludeInactive}
                    />
                    <Label htmlFor="include-inactive" className="text-sm font-medium">
                      {t('ingredients.filters.showInactive')}
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <IngredientList ingredients={ingredients} onIngredientsChange={loadIngredients} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
