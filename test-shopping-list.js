// Test script to verify the Shopping List functionality
// Run this in the browser console to test the shopping list features

async function testShoppingListFunctionality() {
  console.log('🛒 Testing Shopping List Functionality...');
  
  try {
    // Import the shopping list functions
    const { 
      generateShoppingList,
      calculateUnitCost,
      calculateIngredientTotalCost,
      hasCompleteCOGSData
    } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Shopping list functions imported successfully');
    
    // Test data based on seed data
    const testIngredients = [
      {
        id: '5',
        name: 'Milk (100ml)',
        usagePerCup: 100,
        unit: 'ml',
        baseUnitCost: 20000, // 20,000 IDR per liter
        baseUnitQuantity: 1000, // 1000 ml
        value: 2000
      },
      {
        id: '6', 
        name: 'Coffee Beans (5g)',
        usagePerCup: 5,
        unit: 'g',
        baseUnitCost: 200000, // 200,000 IDR per kg
        baseUnitQuantity: 1000, // 1000 g
        value: 1000
      },
      {
        id: '7',
        name: 'Palm Sugar (10ml)',
        usagePerCup: 10,
        unit: 'ml',
        baseUnitCost: 48500, // 48,500 IDR per liter
        baseUnitQuantity: 1000, // 1000 ml
        value: 485
      },
      {
        id: '8',
        name: 'Cup + Lid',
        usagePerCup: 1,
        unit: 'piece',
        baseUnitCost: 850, // 850 IDR per piece
        baseUnitQuantity: 1, // 1 piece
        value: 850
      },
      {
        id: '9',
        name: 'Ice Cubes (100g)',
        usagePerCup: 100,
        unit: 'g',
        baseUnitCost: 2920, // 2,920 IDR per kg
        baseUnitQuantity: 1000, // 1000 g
        value: 292
      }
    ];
    
    const dailyTarget = 60; // Default daily target
    
    console.log('🧪 Testing individual calculation functions:');
    
    testIngredients.forEach(ingredient => {
      const hasCompleteData = hasCompleteCOGSData(ingredient);
      const unitCost = calculateUnitCost(ingredient);
      const totalCost = calculateIngredientTotalCost(ingredient, dailyTarget);
      
      console.log(`${ingredient.name}:`);
      console.log(`  - Complete data: ${hasCompleteData}`);
      console.log(`  - Unit cost: ${unitCost} IDR per ${ingredient.unit}`);
      console.log(`  - Total cost for ${dailyTarget} cups: ${totalCost} IDR`);
      console.log('');
    });
    
    // Test the main shopping list generation
    console.log('🛒 Testing generateShoppingList function:');
    const shoppingList = generateShoppingList(testIngredients, dailyTarget);
    
    console.log(`Generated shopping list with ${shoppingList.totalItems} items:`);
    console.log(`Grand total: ${shoppingList.grandTotal} IDR`);
    console.log('');
    
    shoppingList.items.forEach(item => {
      console.log(`📦 ${item.name}:`);
      console.log(`   - Quantity needed: ${item.formattedQuantity}`);
      console.log(`   - Unit cost: ${item.unitCost} IDR per ${item.unit}`);
      console.log(`   - Total cost: ${item.totalCost} IDR`);
      console.log('');
    });
    
    // Test cost analysis
    console.log('📊 Cost Analysis:');
    const costPerCup = shoppingList.grandTotal / dailyTarget;
    console.log(`Cost per cup: ${costPerCup.toFixed(2)} IDR`);
    
    if (shoppingList.items.length > 0) {
      const mostExpensive = shoppingList.items[0];
      console.log(`Most expensive ingredient: ${mostExpensive.name} (${mostExpensive.totalCost} IDR)`);
      
      const leastExpensive = shoppingList.items[shoppingList.items.length - 1];
      console.log(`Least expensive ingredient: ${leastExpensive.name} (${leastExpensive.totalCost} IDR)`);
    }
    
    // Test edge cases
    console.log('🧪 Testing edge cases:');
    
    // Test with empty array
    const emptyList = generateShoppingList([], dailyTarget);
    console.log(`Empty ingredients list: ${emptyList.totalItems} items, ${emptyList.grandTotal} IDR`);
    
    // Test with zero daily target
    const zeroTargetList = generateShoppingList(testIngredients, 0);
    console.log(`Zero daily target: ${zeroTargetList.totalItems} items, ${zeroTargetList.grandTotal} IDR`);
    
    // Test with incomplete data
    const incompleteIngredient = {
      id: 'incomplete',
      name: 'Incomplete Ingredient',
      usagePerCup: 10,
      unit: 'ml',
      // Missing baseUnitCost and baseUnitQuantity
      value: 100
    };
    
    const incompleteList = generateShoppingList([incompleteIngredient], dailyTarget);
    console.log(`Incomplete data: ${incompleteList.totalItems} items, ${incompleteList.grandTotal} IDR`);
    
    console.log('🎉 Shopping List Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test the UI integration
async function testShoppingListUI() {
  console.log('🖥️ Testing Shopping List UI Integration...');
  
  try {
    // Check if the shopping list component is rendered
    const shoppingListCards = document.querySelectorAll('[data-testid="shopping-list"], .shopping-list, h3:contains("Shopping List")');
    console.log(`Found ${shoppingListCards.length} shopping list elements`);
    
    // Check for shopping cost display in main summary
    const shoppingCostElements = document.querySelectorAll('*:contains("Shopping Cost")');
    console.log(`Found ${shoppingCostElements.length} shopping cost display elements`);
    
    // Check for total amount calculations
    const totalElements = document.querySelectorAll('*:contains("Total"), *:contains("Grand Total")');
    console.log(`Found ${totalElements.length} total calculation elements`);
    
    console.log('✅ UI integration test complete');
    
  } catch (error) {
    console.error('❌ UI test failed:', error);
  }
}

// Instructions
console.log(`
🛒 Shopping List Enhancement Testing

To run tests:
1. testShoppingListFunctionality() - Test calculation functions
2. testShoppingListUI() - Test UI integration

Manual testing steps:
1. Open COGS Calculator
2. Verify "Shopping Cost" appears in main summary
3. Check Shopping List Summary section appears
4. Verify all ingredients show quantities and costs
5. Check grand total calculation
6. Test with different daily targets
`);

// Export for use
window.testShoppingListFunctionality = testShoppingListFunctionality;
window.testShoppingListUI = testShoppingListUI;
