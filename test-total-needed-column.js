// Test script to verify the Total Needed column functionality
// Run this in the browser console to test the fixes

async function testTotalNeededColumn() {
  console.log('🧪 Testing Total Needed Column Functionality...');
  
  try {
    // Import the calculation functions
    const { 
      getFormattedQuantity, 
      calculateTotalQuantityNeeded,
      calculateIngredientQuantities 
    } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Calculation functions imported successfully');
    
    // Test data based on seed data
    const testIngredients = [
      {
        id: '5',
        name: 'Milk (100ml)',
        usagePerCup: 100,
        unit: 'ml',
        baseUnitCost: 20000,
        baseUnitQuantity: 1000
      },
      {
        id: '6', 
        name: 'Coffee Beans (5g)',
        usagePerCup: 5,
        unit: 'g',
        baseUnitCost: 200000,
        baseUnitQuantity: 1000
      },
      {
        id: '7',
        name: 'Palm Sugar (10ml)',
        usagePerCup: 10,
        unit: 'ml',
        baseUnitCost: 48500,
        baseUnitQuantity: 1000
      },
      {
        id: '8',
        name: 'Cup + Lid',
        usagePerCup: 1,
        unit: 'piece',
        baseUnitCost: 850,
        baseUnitQuantity: 1
      },
      {
        id: '9',
        name: 'Ice Cubes (100g)',
        usagePerCup: 100,
        unit: 'g',
        baseUnitCost: 2920,
        baseUnitQuantity: 1000
      }
    ];
    
    const dailyTarget = 60; // Default daily target
    
    console.log('📊 Testing getFormattedQuantity for each ingredient:');
    
    testIngredients.forEach(ingredient => {
      const totalNeeded = calculateTotalQuantityNeeded(ingredient, dailyTarget);
      const formattedQuantity = getFormattedQuantity(totalNeeded, ingredient.unit);
      
      console.log(`${ingredient.name}:`);
      console.log(`  - Usage per cup: ${ingredient.usagePerCup} ${ingredient.unit}`);
      console.log(`  - Total needed for ${dailyTarget} cups: ${totalNeeded} ${ingredient.unit}`);
      console.log(`  - Formatted quantity: ${formattedQuantity}`);
      console.log('');
    });
    
    // Test calculateIngredientQuantities function
    console.log('🔍 Testing calculateIngredientQuantities function:');
    const ingredientQuantities = calculateIngredientQuantities(testIngredients, dailyTarget);
    
    console.log(`Processed ${ingredientQuantities.length} ingredients:`);
    ingredientQuantities.forEach(item => {
      console.log(`- ${item.name}: ${item.formattedQuantity}`);
    });
    
    // Test edge cases
    console.log('🧪 Testing edge cases:');
    
    // Test with 0 usage per cup
    const zeroUsageItem = { usagePerCup: 0, unit: 'ml' };
    const zeroResult = getFormattedQuantity(calculateTotalQuantityNeeded(zeroUsageItem, dailyTarget), zeroUsageItem.unit);
    console.log(`Zero usage per cup: ${zeroResult}`);
    
    // Test with large quantities that should convert
    const largeQuantityItem = { usagePerCup: 500, unit: 'ml' }; // Should convert to liters
    const largeResult = getFormattedQuantity(calculateTotalQuantityNeeded(largeQuantityItem, dailyTarget), largeQuantityItem.unit);
    console.log(`Large quantity (500ml × 60): ${largeResult}`);
    
    // Test with grams that should convert to kg
    const heavyItem = { usagePerCup: 50, unit: 'g' }; // Should convert to kg
    const heavyResult = getFormattedQuantity(calculateTotalQuantityNeeded(heavyItem, dailyTarget), heavyItem.unit);
    console.log(`Heavy item (50g × 60): ${heavyResult}`);
    
    console.log('🎉 Total Needed Column Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test with actual database data
async function testWithActualData() {
  console.log('🧪 Testing with Actual Database Data...');

  try {
    // Import database and service
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { calculateIngredientQuantities, getFormattedQuantity } = await import('./src/utils/cogsCalculations.ts');

    // Get actual COGS items from database
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items in database:`);

    cogsItems.forEach(item => {
      console.log(`- ${item.name}: usagePerCup=${item.usagePerCup}, unit="${item.unit}"`);
    });

    // Test with default daily target
    const dailyTarget = 60;
    const ingredientQuantities = calculateIngredientQuantities(cogsItems, dailyTarget);

    console.log(`\n🔍 Calculated quantities for ${dailyTarget} cups per day:`);
    ingredientQuantities.forEach(item => {
      console.log(`✅ ${item.name}: ${item.formattedQuantity}`);
    });

    // Check if any items were filtered out
    const filteredOut = cogsItems.length - ingredientQuantities.length;
    if (filteredOut > 0) {
      console.warn(`⚠️ ${filteredOut} items were filtered out (missing usagePerCup or unit)`);

      const missingData = cogsItems.filter(item =>
        !(item.usagePerCup !== undefined && item.usagePerCup !== null && item.unit)
      );

      missingData.forEach(item => {
        console.log(`❌ ${item.name}: usagePerCup=${item.usagePerCup}, unit="${item.unit}"`);
      });
    } else {
      console.log('✅ All COGS items processed successfully!');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Test the conditional logic fix
function testConditionalLogic() {
  console.log('🧪 Testing Conditional Logic Fix...');
  
  const testCases = [
    { usagePerCup: 100, unit: 'ml', expected: true, description: 'Normal case' },
    { usagePerCup: 0, unit: 'ml', expected: true, description: 'Zero usage (should show)' },
    { usagePerCup: undefined, unit: 'ml', expected: false, description: 'Undefined usage' },
    { usagePerCup: null, unit: 'ml', expected: false, description: 'Null usage' },
    { usagePerCup: 100, unit: undefined, expected: false, description: 'Undefined unit' },
    { usagePerCup: 100, unit: null, expected: false, description: 'Null unit' },
    { usagePerCup: 100, unit: '', expected: false, description: 'Empty unit' }
  ];
  
  testCases.forEach(testCase => {
    // Simulate the new conditional logic
    const shouldShow = (testCase.usagePerCup !== undefined && testCase.usagePerCup !== null) && testCase.unit;
    const result = shouldShow === testCase.expected ? '✅' : '❌';
    
    console.log(`${result} ${testCase.description}: usagePerCup=${testCase.usagePerCup}, unit="${testCase.unit}" → ${shouldShow ? 'SHOW' : 'HIDE'}`);
  });
}

// Instructions
console.log(`
🧪 Total Needed Column Bug Investigation

To run tests:
1. testTotalNeededColumn() - Test calculation functions with sample data
2. testConditionalLogic() - Test the conditional logic fix
3. testWithActualData() - Test with actual database data

Or test manually:
1. Open COGS Calculator
2. Check that all ingredients show Total Needed values
3. Verify unit conversions work (ml→l, g→kg)
4. Verify all 5 seed ingredients show calculations
`);

// Export for use
window.testTotalNeededColumn = testTotalNeededColumn;
window.testConditionalLogic = testConditionalLogic;
window.testWithActualData = testWithActualData;
