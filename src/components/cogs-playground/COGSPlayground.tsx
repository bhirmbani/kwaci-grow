import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Database, 
  Info, 
  Beaker, 
  Package, 
  PlayCircle,
  Save
} from 'lucide-react'
import { TempIngredientList } from './TempIngredientList'
import { TempProductList } from './TempProductList'
import { SaveToDatabaseDialog } from './SaveToDatabaseDialog'
import { generateTempId } from './types'
import type { TempIngredient, TempProduct, COGSPlaygroundState } from './types'

export function COGSPlayground() {
  const { t } = useTranslation()
  const [state, setState] = useState<COGSPlaygroundState>({
    ingredients: [],
    products: []
  })
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  // Ingredient management
  const handleAddIngredient = (ingredientData: Omit<TempIngredient, 'id'>) => {
    const newIngredient: TempIngredient = {
      ...ingredientData,
      id: generateTempId()
    }
    setState(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }))
  }

  const handleEditIngredient = (id: string, ingredientData: Omit<TempIngredient, 'id'>) => {
    setState(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ingredientData, id } : ing
      )
    }))
  }

  const handleDeleteIngredient = (id: string) => {
    setState(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id),
      // Also remove this ingredient from any products
      products: prev.products.map(product => ({
        ...product,
        ingredients: product.ingredients.filter(pi => pi.ingredientId !== id)
      }))
    }))
  }

  // Product management
  const handleAddProduct = (productData: Omit<TempProduct, 'id'>) => {
    const newProduct: TempProduct = {
      ...productData,
      id: generateTempId()
    }
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }))
  }

  const handleEditProduct = (id: string, productData: Omit<TempProduct, 'id'>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(prod => 
        prod.id === id ? { ...productData, id } : prod
      )
    }))
  }

  const handleDeleteProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(prod => prod.id !== id)
    }))
  }

  // Save to database
  const handleSaveComplete = () => {
    setState({
      ingredients: [],
      products: []
    })
  }

  const hasData = state.ingredients.length > 0 || state.products.length > 0
  const hasActiveData = state.ingredients.some(ing => ing.isActive) || state.products.some(prod => prod.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('cogs.playground.title')}</h1>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {t('cogs.playground.sandboxBadge')}
          </Badge>
        </div>
        <Button 
          onClick={() => setIsSaveDialogOpen(true)}
          disabled={!hasActiveData}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t('cogs.playground.saveToDatabase')}
        </Button>
      </div>

      {/* Description */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('cogs.playground.description.welcome')}</p>
            <p className="text-sm">
              {t('cogs.playground.description.line1')} {t('cogs.playground.description.line2')} {t('cogs.playground.description.line3')}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <Calculator className="h-3 w-3 mr-1" />
                {t('cogs.playground.badges.realTime')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Beaker className="h-3 w-3 mr-1" />
                {t('cogs.playground.badges.temporaryIngredients')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                {t('cogs.playground.badges.productExperimentation')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                {t('cogs.playground.badges.optionalSave')}
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue="ingredients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            {t('cogs.playground.tabs.ingredients')} ({state.ingredients.length})
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('cogs.playground.tabs.products')} ({state.products.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-6">
          <TempIngredientList
            ingredients={state.ingredients}
            onAdd={handleAddIngredient}
            onEdit={handleEditIngredient}
            onDelete={handleDeleteIngredient}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <TempProductList
            products={state.products}
            ingredients={state.ingredients}
            onAdd={handleAddProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>
      </Tabs>

      {/* Getting Started Guide */}
      {!hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              {t('cogs.playground.gettingStarted.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {t('cogs.playground.gettingStarted.description')}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{t('cogs.playground.gettingStarted.steps.createIngredients.title')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('cogs.playground.gettingStarted.steps.createIngredients.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{t('cogs.playground.gettingStarted.steps.buildProducts.title')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('cogs.playground.gettingStarted.steps.buildProducts.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{t('cogs.playground.gettingStarted.steps.saveWhenReady.title')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('cogs.playground.gettingStarted.steps.saveWhenReady.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save to Database Dialog */}
      <SaveToDatabaseDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        ingredients={state.ingredients}
        products={state.products}
        onSaveComplete={handleSaveComplete}
      />
    </div>
  )
}
