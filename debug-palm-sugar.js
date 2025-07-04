// Targeted debug script for Palm Sugar Total Needed issue
// Run this in the browser console to investigate the specific Palm Sugar problem

async function debugPalmSugar() {
  console.log('🔍 Debugging Palm Sugar Total Needed Issue...');
  
  try {
    // Import necessary functions
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { 
      calculateTotalQuantityNeeded,
      getFormattedQuantity,
      hasCompleteCOGSData
    } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Functions imported successfully');
    
    // Get all COGS items
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items in database`);
    
    // Find Palm Sugar specifically
    const palmSugar = cogsItems.find(item => 
      item.name.toLowerCase().includes('palm sugar') || 
      item.name.toLowerCase().includes('sugar')
    );
    
    if (!palmSugar) {
      console.error('❌ Palm Sugar not found in database!');
      console.log('Available items:');
      cogsItems.forEach(item => console.log(`  - ${item.name}`));
      return;
    }
    
    console.log('\n🎯 Palm Sugar Analysis:');
    console.log('Raw database record:');
    console.log(JSON.stringify(palmSugar, null, 2));
    
    // Test each field individually
    console.log('\n🔍 Field Analysis:');
    console.log(`Name: "${palmSugar.name}"`);
    console.log(`ID: "${palmSugar.id}"`);
    console.log(`usagePerCup: ${palmSugar.usagePerCup} (type: ${typeof palmSugar.usagePerCup})`);
    console.log(`unit: "${palmSugar.unit}" (type: ${typeof palmSugar.unit})`);
    console.log(`baseUnitCost: ${palmSugar.baseUnitCost}`);
    console.log(`baseUnitQuantity: ${palmSugar.baseUnitQuantity}`);
    console.log(`value: ${palmSugar.value}`);
    
    // Test each condition from the robust conditional logic
    console.log('\n🧪 Conditional Logic Tests:');
    
    const usagePerCup = palmSugar.usagePerCup;
    const unit = palmSugar.unit;
    const dailyTarget = 60;
    
    // Test individual conditions
    const test1 = usagePerCup !== undefined;
    const test2 = usagePerCup !== null;
    const test3 = usagePerCup >= 0;
    const test4 = !!unit;
    const test5 = unit && unit.trim() !== '';
    const test6 = dailyTarget > 0;
    
    console.log(`usagePerCup !== undefined: ${test1}`);
    console.log(`usagePerCup !== null: ${test2}`);
    console.log(`usagePerCup >= 0: ${test3}`);
    console.log(`!!unit: ${test4}`);
    console.log(`unit && unit.trim() !== '': ${test5}`);
    console.log(`dailyTarget > 0: ${test6}`);
    
    // Combined conditions
    const hasValidUsage = (usagePerCup !== undefined && usagePerCup !== null && usagePerCup >= 0);
    const hasValidUnit = (unit && unit.trim() !== '');
    const hasValidTarget = (dailyTarget > 0);
    
    console.log(`\nCombined conditions:`);
    console.log(`hasValidUsage: ${hasValidUsage}`);
    console.log(`hasValidUnit: ${hasValidUnit}`);
    console.log(`hasValidTarget: ${hasValidTarget}`);
    
    const shouldShow = hasValidUsage && hasValidUnit && hasValidTarget;
    console.log(`shouldShow (final result): ${shouldShow}`);
    
    // Test the calculation functions
    console.log('\n🧮 Calculation Tests:');
    
    if (shouldShow) {
      const totalNeeded = calculateTotalQuantityNeeded(palmSugar, dailyTarget);
      const formattedQuantity = getFormattedQuantity(totalNeeded, unit);
      
      console.log(`✅ Should show Total Needed:`);
      console.log(`  - Raw calculation: ${usagePerCup} × ${dailyTarget} = ${totalNeeded}`);
      console.log(`  - Formatted result: "${formattedQuantity}"`);
      console.log(`  - Expected: "600 ml"`);
      
      if (formattedQuantity === "600 ml") {
        console.log(`  ✅ Calculation is correct!`);
      } else {
        console.log(`  ❌ Calculation doesn't match expected result`);
      }
    } else {
      console.log(`❌ Will show "-" because conditions failed`);
      
      // Explain which condition failed
      if (!hasValidUsage) {
        console.log(`  ❌ Invalid usage: usagePerCup = ${usagePerCup}`);
        if (usagePerCup === undefined) console.log(`    - usagePerCup is undefined`);
        if (usagePerCup === null) console.log(`    - usagePerCup is null`);
        if (usagePerCup < 0) console.log(`    - usagePerCup is negative`);
      }
      if (!hasValidUnit) {
        console.log(`  ❌ Invalid unit: unit = "${unit}"`);
        if (!unit) console.log(`    - unit is falsy`);
        if (unit && unit.trim() === '') console.log(`    - unit is empty string`);
      }
      if (!hasValidTarget) {
        console.log(`  ❌ Invalid target: dailyTarget = ${dailyTarget}`);
      }
    }
    
    // Test hasCompleteCOGSData function
    console.log('\n🔍 Complete COGS Data Test:');
    const hasCompleteData = hasCompleteCOGSData(palmSugar);
    console.log(`hasCompleteCOGSData: ${hasCompleteData}`);
    
    // Compare with working item (Coffee Beans)
    console.log('\n🔄 Comparison with Working Item:');
    const coffeeBeans = cogsItems.find(item => 
      item.name.toLowerCase().includes('coffee') || 
      item.name.toLowerCase().includes('beans')
    );
    
    if (coffeeBeans) {
      console.log(`Coffee Beans data:`);
      console.log(`  usagePerCup: ${coffeeBeans.usagePerCup} (${typeof coffeeBeans.usagePerCup})`);
      console.log(`  unit: "${coffeeBeans.unit}" (${typeof coffeeBeans.unit})`);
      
      const coffeeHasValidUsage = (coffeeBeans.usagePerCup !== undefined && coffeeBeans.usagePerCup !== null && coffeeBeans.usagePerCup >= 0);
      const coffeeHasValidUnit = (coffeeBeans.unit && coffeeBeans.unit.trim() !== '');
      const coffeeShouldShow = coffeeHasValidUsage && coffeeHasValidUnit && hasValidTarget;
      
      console.log(`  Coffee Beans shouldShow: ${coffeeShouldShow}`);
      
      if (coffeeShouldShow) {
        const coffeeTotal = calculateTotalQuantityNeeded(coffeeBeans, dailyTarget);
        const coffeeFormatted = getFormattedQuantity(coffeeTotal, coffeeBeans.unit);
        console.log(`  Coffee Beans result: "${coffeeFormatted}"`);
      }
    }
    
    console.log('\n🎉 Palm Sugar debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Function to specifically fix Palm Sugar data
async function fixPalmSugarData() {
  console.log('🔧 Fixing Palm Sugar Data...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    // Get all COGS items
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    
    // Find Palm Sugar
    const palmSugar = cogsItems.find(item => 
      item.name.toLowerCase().includes('palm sugar') || 
      item.name.toLowerCase().includes('sugar')
    );
    
    if (!palmSugar) {
      console.error('❌ Palm Sugar not found!');
      return;
    }
    
    console.log(`Found Palm Sugar: ${palmSugar.name} (ID: ${palmSugar.id})`);
    
    // Define correct Palm Sugar data
    const correctData = {
      baseUnitCost: 48500,      // 48,500 IDR per liter
      baseUnitQuantity: 1000,   // 1000 ml
      usagePerCup: 10,          // 10 ml per cup
      unit: 'ml',               // milliliters
      value: 485                // Calculated: (48500 / 1000) * 10 = 485
    };
    
    console.log('Updating with correct data:', correctData);
    
    await FinancialItemsService.update(palmSugar.id, correctData);
    
    console.log('✅ Palm Sugar data updated successfully!');
    console.log('🔄 Please refresh the page to see the changes');
    
    // Verify the update
    const updatedPalmSugar = await FinancialItemsService.getById(palmSugar.id);
    console.log('Updated Palm Sugar data:');
    console.log(JSON.stringify(updatedPalmSugar, null, 2));
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Instructions
console.log(`
🔍 Palm Sugar Debug Tools

To debug Palm Sugar issue:
1. debugPalmSugar() - Detailed analysis of Palm Sugar data and logic
2. fixPalmSugarData() - Fix Palm Sugar data with correct values

Expected result: Palm Sugar should show "600 ml" for 60 cups daily target
`);

// Export for use
window.debugPalmSugar = debugPalmSugar;
window.fixPalmSugarData = fixPalmSugarData;
