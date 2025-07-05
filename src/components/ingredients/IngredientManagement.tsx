import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Plus, List, TrendingUp } from 'lucide-react'
import { useIngredientsWithCounts, useIngredientCategories } from '@/hooks/useIngredients'
import { IngredientList } from './IngredientList'
import { IngredientForm } from './IngredientForm'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function IngredientManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients'>('overview')
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const { ingredients, loading, error, loadIngredients } = useIngredientsWithCounts()
  const { categories } = useIngredientCategories()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ingredients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>Error loading ingredients: {error}</p>
          <Button onClick={loadIngredients} className="mt-4">
            Retry
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
          <h1 className="text-2xl font-bold">Ingredient Management</h1>
          <p className="text-muted-foreground">
            Manage your ingredients and their properties
          </p>
        </div>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ingredient
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[600px]">
            <SheetHeader>
              <SheetTitle>Create New Ingredient</SheetTitle>
              <SheetDescription>
                Add a new ingredient to your inventory
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
            Overview
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Ingredients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIngredients}</div>
                <p className="text-xs text-muted-foreground">
                  Active ingredients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">
                  Ingredient categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsages}</div>
                <p className="text-xs text-muted-foreground">
                  Across all products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageUsagePerIngredient}</div>
                <p className="text-xs text-muted-foreground">
                  Per ingredient
                </p>
              </CardContent>
            </Card>

            {/* Recent Ingredients */}
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                {ingredients.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No ingredients yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first ingredient to get started
                    </p>
                    <Button onClick={() => setIsCreateSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ingredient
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
                            {ingredient.category || 'No category'} • {ingredient.unit}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Used in {ingredient.usageCount} products
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('ingredients')}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                    {ingredients.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('ingredients')}
                        >
                          View All Ingredients ({ingredients.length})
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
          <IngredientList ingredients={ingredients} onIngredientsChange={loadIngredients} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
