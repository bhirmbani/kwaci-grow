// Simple ingredient integrity check for browser console
// Copy and paste this into the browser console

(async function checkIngredients() {
  console.log('🔍 Checking ingredient integrity...')
  
  try {
    // Access the global database instance
    if (typeof window !== 'undefined' && window.db) {
      const db = window.db
      
      // Get all product ingredients
      const productIngredients = await db.productIngredients.toArray()
      console.log(`Found ${productIngredients.length} product-ingredient relationships`)
      
      // Get all ingredients
      const ingredients = await db.ingredients.toArray()
      console.log(`Found ${ingredients.length} ingredient records`)
      
      // Check for missing ingredient records
      let missingCount = 0
      let validCount = 0
      
      for (const pi of productIngredients) {
        const ingredient = await db.ingredients.get(pi.ingredientId)
        if (!ingredient) {
          missingCount++
          console.warn(`❌ Missing ingredient record for ID: ${pi.ingredientId} in product: ${pi.productId}`)
        } else {
          validCount++
          console.log(`✅ Found ingredient: ${ingredient.name} (ID: ${ingredient.id})`)
          
          // Check cost data
          const hasValidCostData = ingredient.baseUnitCost && ingredient.baseUnitQuantity && ingredient.baseUnitQuantity > 0
          if (!hasValidCostData) {
            console.warn(`⚠️ Ingredient "${ingredient.name}" missing cost data:`, {
              baseUnitCost: ingredient.baseUnitCost,
              baseUnitQuantity: ingredient.baseUnitQuantity
            })
          }
        }
      }
      
      console.log(`\n📊 Summary:`)
      console.log(`- Valid ingredient relationships: ${validCount}`)
      console.log(`- Missing ingredient records: ${missingCount}`)
      
    } else {
      console.error('❌ Database not found on window object')
    }
    
  } catch (error) {
    console.error('❌ Error checking ingredient integrity:', error)
  }
})()
