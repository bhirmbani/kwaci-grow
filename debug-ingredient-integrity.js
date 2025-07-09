// Debug script to check ingredient integrity
// Run this in the browser console to check for missing ingredient records

async function checkIngredientIntegrity() {
  console.log('🔍 Checking ingredient integrity...')
  
  try {
    // Import the database
    const { db } = await import('./src/lib/db/index.js')
    
    // Get all product ingredients
    const productIngredients = await db.productIngredients.toArray()
    console.log(`Found ${productIngredients.length} product-ingredient relationships`)
    
    // Get all ingredients
    const ingredients = await db.ingredients.toArray()
    console.log(`Found ${ingredients.length} ingredient records`)
    
    // Check for missing ingredient records
    const missingIngredients = []
    const validIngredients = []
    
    for (const pi of productIngredients) {
      const ingredient = await db.ingredients.get(pi.ingredientId)
      if (!ingredient) {
        missingIngredients.push(pi)
        console.warn(`❌ Missing ingredient record for ID: ${pi.ingredientId} in product: ${pi.productId}`)
      } else {
        validIngredients.push({ pi, ingredient })
        console.log(`✅ Found ingredient: ${ingredient.name} (ID: ${ingredient.id})`)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`- Valid ingredient relationships: ${validIngredients.length}`)
    console.log(`- Missing ingredient records: ${missingIngredients.length}`)
    
    if (missingIngredients.length > 0) {
      console.log(`\n🔧 Missing ingredient IDs:`)
      missingIngredients.forEach(pi => {
        console.log(`- ${pi.ingredientId} (in product ${pi.productId})`)
      })
    }
    
    // Check ingredient cost data
    console.log(`\n💰 Checking ingredient cost data:`)
    for (const ingredient of ingredients) {
      const hasValidCostData = ingredient.baseUnitCost && ingredient.baseUnitQuantity && ingredient.baseUnitQuantity > 0
      if (!hasValidCostData) {
        console.warn(`⚠️ Ingredient "${ingredient.name}" missing cost data:`, {
          baseUnitCost: ingredient.baseUnitCost,
          baseUnitQuantity: ingredient.baseUnitQuantity
        })
      } else {
        console.log(`✅ Ingredient "${ingredient.name}" has valid cost data`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking ingredient integrity:', error)
  }
}

// Run the check
checkIngredientIntegrity()
