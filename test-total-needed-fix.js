// Comprehensive test to verify Total Needed column fixes
// Run this after applying the fixes to verify everything works

async function testTotalNeededFix() {
  console.log('🧪 Testing Total Needed Column Fixes...');
  
  try {
    // Import all necessary functions
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { 
      calculateTotalQuantityNeeded,
      getFormattedQuantity,
      calculateIngredientQuantities,
      hasCompleteCOGSData
    } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Functions imported successfully');
    
    // Get current COGS items
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Testing ${cogsItems.length} COGS items`);
    
    const dailyTarget = 60;
    
    // Test each item individually
    console.log('\n🔍 Individual Item Tests:');
    
    cogsItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}:`);
      
      // Check data completeness
      const hasCompleteData = hasCompleteCOGSData(item);
      console.log(`   Complete COGS data: ${hasCompleteData ? '✅' : '❌'}`);
      
      // Check individual fields
      console.log(`   usagePerCup: ${item.usagePerCup} (${typeof item.usagePerCup})`);
      console.log(`   unit: "${item.unit}" (${typeof item.unit})`);
      console.log(`   baseUnitCost: ${item.baseUnitCost}`);
      console.log(`   baseUnitQuantity: ${item.baseUnitQuantity}`);
      
      // Test the new robust conditional logic
      const hasValidUsage = (item.usagePerCup !== undefined && item.usagePerCup !== null && item.usagePerCup >= 0);
      const hasValidUnit = (item.unit && item.unit.trim() !== '');
      const hasValidTarget = (dailyTarget > 0);
      const shouldShowTotal = hasValidUsage && hasValidUnit && hasValidTarget;
      
      console.log(`   Should show Total Needed: ${shouldShowTotal ? '✅' : '❌'}`);
      
      if (shouldShowTotal) {
        const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget);
        const formattedQuantity = getFormattedQuantity(totalNeeded, item.unit);
        console.log(`   Total needed: ${totalNeeded} ${item.unit}`);
        console.log(`   Formatted: "${formattedQuantity}"`);
      } else {
        console.log(`   Will show: "-"`);
        
        // Explain why it's not showing
        if (!hasValidUsage) console.log(`     ❌ Invalid usage: ${item.usagePerCup}`);
        if (!hasValidUnit) console.log(`     ❌ Invalid unit: "${item.unit}"`);
        if (!hasValidTarget) console.log(`     ❌ Invalid target: ${dailyTarget}`);
      }
    });
    
    // Test the calculateIngredientQuantities function
    console.log('\n🔍 Testing calculateIngredientQuantities:');
    const ingredientQuantities = calculateIngredientQuantities(cogsItems, dailyTarget);
    
    console.log(`Processed ${ingredientQuantities.length} out of ${cogsItems.length} items:`);
    ingredientQuantities.forEach(item => {
      console.log(`✅ ${item.name}: ${item.formattedQuantity}`);
    });
    
    // Check which items were filtered out
    const filteredOut = cogsItems.length - ingredientQuantities.length;
    if (filteredOut > 0) {
      console.log(`\n⚠️ ${filteredOut} items were filtered out:`);
      
      const processedIds = new Set(ingredientQuantities.map(item => item.id));
      const filteredItems = cogsItems.filter(item => !processedIds.has(item.id));
      
      filteredItems.forEach(item => {
        console.log(`❌ ${item.name}: usagePerCup=${item.usagePerCup}, unit="${item.unit}"`);
      });
    } else {
      console.log('\n✅ All items with valid data were processed!');
    }
    
    // Test edge cases
    console.log('\n🧪 Testing Edge Cases:');
    
    // Test with zero usage
    const zeroUsageResult = getFormattedQuantity(0, 'ml');
    console.log(`Zero usage: "${zeroUsageResult}"`);
    
    // Test with empty unit
    const emptyUnitResult = getFormattedQuantity(100, '');
    console.log(`Empty unit: "${emptyUnitResult}"`);
    
    // Test with null unit
    const nullUnitResult = getFormattedQuantity(100, null);
    console.log(`Null unit: "${nullUnitResult}"`);
    
    // Test unit conversions
    console.log('\n🔄 Testing Unit Conversions:');
    
    const conversionTests = [
      { quantity: 6000, unit: 'ml', expected: 'should convert to liters' },
      { quantity: 3000, unit: 'g', expected: 'should convert to kg' },
      { quantity: 500, unit: 'ml', expected: 'should stay as ml' },
      { quantity: 60, unit: 'piece', expected: 'should stay as pieces' }
    ];
    
    conversionTests.forEach(test => {
      const result = getFormattedQuantity(test.quantity, test.unit);
      console.log(`${test.quantity} ${test.unit}: "${result}" (${test.expected})`);
    });
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`Total COGS items: ${cogsItems.length}`);
    console.log(`Items with complete data: ${cogsItems.filter(hasCompleteCOGSData).length}`);
    console.log(`Items showing Total Needed: ${ingredientQuantities.length}`);
    
    const itemsWithUsage = cogsItems.filter(item => 
      item.usagePerCup !== undefined && 
      item.usagePerCup !== null && 
      item.usagePerCup > 0
    ).length;
    
    console.log(`Items with usage > 0: ${itemsWithUsage}`);
    
    if (ingredientQuantities.length === itemsWithUsage) {
      console.log('🎉 SUCCESS: All items with usage > 0 show Total Needed values!');
    } else {
      console.log('⚠️ Some items with usage > 0 are not showing Total Needed values');
    }
    
    console.log('\n🎉 Total Needed Fix Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Quick verification function
async function quickVerifyFix() {
  console.log('⚡ Quick verification of Total Needed fix...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { getFormattedQuantity } = await import('./src/utils/cogsCalculations.ts');
    
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    const dailyTarget = 60;
    
    const expectedResults = {
      'Milk (100ml)': '6,000 ml (6 l)',
      'Coffee Beans (5g)': '300 g',
      'Palm Sugar (10ml)': '600 ml',
      'Cup + Lid': '60 piece',
      'Ice Cubes (100g)': '6,000 g (6 kg)'
    };
    
    console.log('Expected vs Actual results:');
    
    Object.entries(expectedResults).forEach(([itemName, expected]) => {
      const item = cogsItems.find(i => i.name === itemName);
      if (item && item.usagePerCup && item.unit) {
        const actual = getFormattedQuantity(item.usagePerCup * dailyTarget, item.unit);
        const matches = actual === expected;
        console.log(`${itemName}: ${matches ? '✅' : '❌'}`);
        console.log(`  Expected: "${expected}"`);
        console.log(`  Actual: "${actual}"`);
      } else {
        console.log(`${itemName}: ❌ Missing data`);
      }
    });
    
  } catch (error) {
    console.error('❌ Quick verification failed:', error);
  }
}

// Instructions
console.log(`
🧪 Total Needed Fix Testing

To test the fixes:
1. testTotalNeededFix() - Comprehensive test of all fixes
2. quickVerifyFix() - Quick verification of expected results

Run these after applying the fixes to verify everything works correctly.
`);

// Export for use
window.testTotalNeededFix = testTotalNeededFix;
window.quickVerifyFix = quickVerifyFix;
