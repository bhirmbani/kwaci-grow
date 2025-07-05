// Simple test script to validate the product management system
import { ProductService } from './src/lib/services/productService.js'
import { IngredientService } from './src/lib/services/ingredientService.js'

async function testProductSystem() {
  try {
    console.log('Testing Product Management System...')
    
    // Test 1: Get all products
    console.log('\n1. Testing product retrieval...')
    const products = await ProductService.getAll()
    console.log(`Found ${products.length} products`)
    
    if (products.length > 0) {
      const firstProduct = products[0]
      console.log(`First product: ${firstProduct.name}`)
      
      // Test 2: Get product with ingredients
      console.log('\n2. Testing product with ingredients...')
      const productWithIngredients = await ProductService.getWithIngredients(firstProduct.id)
      if (productWithIngredients) {
        console.log(`Product "${productWithIngredients.name}" has ${productWithIngredients.ingredients.length} ingredients`)
        productWithIngredients.ingredients.forEach(pi => {
          console.log(`  - ${pi.ingredient.name}: ${pi.usagePerCup} ${pi.ingredient.unit} per cup`)
        })
      }
    }
    
    // Test 3: Get all ingredients
    console.log('\n3. Testing ingredient retrieval...')
    const ingredients = await IngredientService.getAll()
    console.log(`Found ${ingredients.length} ingredients`)
    
    ingredients.forEach(ingredient => {
      const unitCost = ingredient.baseUnitQuantity > 0 
        ? ingredient.baseUnitCost / ingredient.baseUnitQuantity 
        : 0
      console.log(`  - ${ingredient.name}: ${unitCost.toFixed(2)} IDR per ${ingredient.unit}`)
    })
    
    console.log('\n✅ Product Management System test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProductSystem()
