// Test script for ingredient fix - run in browser console
// Copy and paste this entire script into the browser console

(async function testIngredientFix() {
  console.log('🔍 Starting ingredient integrity test...')
  
  try {
    // Import the necessary modules
    const { ProductService } = await import('./src/lib/services/productService.js')
    const { db } = await import('./src/lib/db/index.js')
    
    console.log('✅ Modules imported successfully')
    
    // Get all product ingredients
    const productIngredients = await db.productIngredients.toArray()
    console.log(`Found ${productIngredients.length} product-ingredient relationships`)
    
    // Get all ingredients
    const ingredients = await db.ingredients.toArray()
    console.log(`Found ${ingredients.length} ingredient records`)
    
    // Check for missing ingredient records
    let missingCount = 0
    let validCount = 0
    const missingIngredients = []
    
    for (const pi of productIngredients) {
      const ingredient = await db.ingredients.get(pi.ingredientId)
      if (!ingredient) {
        missingCount++
        missingIngredients.push(pi)
        console.warn(`❌ Missing ingredient record for ID: ${pi.ingredientId} in product: ${pi.productId}`)
      } else {
        validCount++
        console.log(`✅ Found ingredient: ${ingredient.name} (ID: ${ingredient.id})`)
      }
    }
    
    console.log(`📊 Summary: ${validCount} valid, ${missingCount} missing`)
    
    if (missingCount > 0) {
      console.log('🧹 Running cleanup...')
      await ProductService.cleanupOrphanedRelationships()
      console.log('✅ Cleanup completed')
      
      // Re-check after cleanup
      const remainingPI = await db.productIngredients.toArray()
      console.log(`After cleanup: ${remainingPI.length} product-ingredient relationships remain`)
    }
    
    // Test product view
    console.log('\n🔍 Testing product view...')
    const products = await db.products.toArray()
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      console.log(`Testing product: ${product.name} (${product.id})`)
      
      try {
        const productWithIngredients = await ProductService.getWithIngredients(product.id)
        if (productWithIngredients) {
          console.log(`✅ Product loaded with ${productWithIngredients.ingredients.length} ingredients`)
          
          // Check for null ingredients
          const nullIngredients = productWithIngredients.ingredients.filter(pi => !pi.ingredient)
          if (nullIngredients.length > 0) {
            console.warn(`⚠️ Found ${nullIngredients.length} null ingredients in product ${product.name}`)
          }
          
          // Test COGS calculation
          const cogsBreakdown = await ProductService.getCOGSBreakdown(product.id)
          console.log(`✅ COGS calculated: ${cogsBreakdown.totalCostPerCup} IDR`)
          console.log(`   Ingredients: ${cogsBreakdown.ingredients.map(i => i.name).join(', ')}`)
        } else {
          console.warn(`❌ Product not found: ${product.id}`)
        }
      } catch (error) {
        console.error(`❌ Error loading product ${product.id}:`, error)
      }
    }
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  }
})()
