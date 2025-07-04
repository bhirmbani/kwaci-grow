// Debug script to investigate Total Needed column issues
// Run this in the browser console to debug the missing values

async function debugTotalNeededIssue() {
  console.log('🔍 Debugging Total Needed Column Issue...');
  
  try {
    // Import database and calculation functions
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { 
      calculateTotalQuantityNeeded,
      getFormattedQuantity,
      hasCompleteCOGSData
    } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Functions imported successfully');
    
    // Get actual COGS items from database
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items in database:`);
    
    const dailyTarget = 60; // Default daily target
    
    // Debug each item individually
    cogsItems.forEach((item, index) => {
      console.log(`\n🔍 Item ${index + 1}: ${item.name}`);
      console.log(`   - ID: ${item.id}`);
      console.log(`   - usagePerCup: ${item.usagePerCup} (type: ${typeof item.usagePerCup})`);
      console.log(`   - unit: "${item.unit}" (type: ${typeof item.unit})`);
      console.log(`   - baseUnitCost: ${item.baseUnitCost}`);
      console.log(`   - baseUnitQuantity: ${item.baseUnitQuantity}`);
      
      // Test the conditional logic
      const hasUsagePerCup = (item.usagePerCup !== undefined && item.usagePerCup !== null);
      const hasUnit = !!item.unit;
      const shouldShow = hasUsagePerCup && hasUnit;
      
      console.log(`   - Has usagePerCup: ${hasUsagePerCup}`);
      console.log(`   - Has unit: ${hasUnit}`);
      console.log(`   - Should show Total Needed: ${shouldShow}`);
      
      if (shouldShow) {
        const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget);
        const formattedQuantity = getFormattedQuantity(totalNeeded, item.unit);
        console.log(`   - Total needed: ${totalNeeded} ${item.unit}`);
        console.log(`   - Formatted: ${formattedQuantity}`);
      } else {
        console.log(`   - ❌ Will show "-" because missing data`);
      }
      
      // Test hasCompleteCOGSData
      const hasCompleteData = hasCompleteCOGSData(item);
      console.log(`   - Has complete COGS data: ${hasCompleteData}`);
    });
    
    // Test the specific problematic items
    console.log('\n🎯 Testing Specific Problematic Items:');
    
    const problematicItems = ['Milk (100ml)', 'Palm Sugar (10ml)'];
    
    problematicItems.forEach(itemName => {
      const item = cogsItems.find(i => i.name === itemName);
      if (item) {
        console.log(`\n🔍 ${itemName}:`);
        console.log(`   Raw data:`, JSON.stringify(item, null, 2));
        
        // Test each condition separately
        console.log(`   usagePerCup !== undefined: ${item.usagePerCup !== undefined}`);
        console.log(`   usagePerCup !== null: ${item.usagePerCup !== null}`);
        console.log(`   Boolean(item.unit): ${Boolean(item.unit)}`);
        console.log(`   item.unit truthy: ${!!item.unit}`);
        
        // Test the exact conditional from the component
        const condition = (item.usagePerCup !== undefined && item.usagePerCup !== null) && item.unit;
        console.log(`   Final condition result: ${condition}`);
        
        if (condition) {
          const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget);
          const formatted = getFormattedQuantity(totalNeeded, item.unit);
          console.log(`   ✅ Should show: ${formatted}`);
        } else {
          console.log(`   ❌ Will show: "-"`);
        }
      } else {
        console.log(`   ❌ Item "${itemName}" not found in database`);
      }
    });
    
    // Test working items for comparison
    console.log('\n✅ Testing Working Items for Comparison:');
    
    const workingItems = ['Coffee Beans (5g)', 'Cup + Lid'];
    
    workingItems.forEach(itemName => {
      const item = cogsItems.find(i => i.name.includes(itemName.split(' ')[0]));
      if (item) {
        console.log(`\n✅ ${item.name}:`);
        console.log(`   usagePerCup: ${item.usagePerCup} (${typeof item.usagePerCup})`);
        console.log(`   unit: "${item.unit}" (${typeof item.unit})`);
        
        const condition = (item.usagePerCup !== undefined && item.usagePerCup !== null) && item.unit;
        console.log(`   Condition result: ${condition}`);
        
        if (condition) {
          const totalNeeded = calculateTotalQuantityNeeded(item, dailyTarget);
          const formatted = getFormattedQuantity(totalNeeded, item.unit);
          console.log(`   Shows: ${formatted}`);
        }
      }
    });
    
    console.log('\n🎉 Debug analysis complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Quick fix function to update missing unit fields
async function fixMissingUnits() {
  console.log('🔧 Attempting to fix missing unit fields...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    // Get all COGS items
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    
    // Define expected units for known items
    const unitMappings = {
      'Milk (100ml)': 'ml',
      'Palm Sugar (10ml)': 'ml',
      'Coffee Beans (5g)': 'g',
      'Cup + Lid': 'piece',
      'Ice Cubes (100g)': 'g',
      'Amidis': 'ml'
    };
    
    let updatedCount = 0;
    
    for (const item of cogsItems) {
      if (!item.unit && unitMappings[item.name]) {
        console.log(`🔧 Fixing unit for ${item.name}: adding "${unitMappings[item.name]}"`);
        
        await FinancialItemsService.update(item.id, {
          unit: unitMappings[item.name]
        });
        
        updatedCount++;
      }
    }
    
    console.log(`✅ Updated ${updatedCount} items with missing units`);
    console.log('🔄 Please refresh the page to see the changes');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Instructions
console.log(`
🔍 Total Needed Debug Tools

To debug the issue:
1. debugTotalNeededIssue() - Analyze why some items show "-"
2. fixMissingUnits() - Attempt to fix missing unit fields

The issue is likely:
- Missing unit field in database
- Unit field is empty string or null
- Data type mismatch
`);

// Export for use
window.debugTotalNeededIssue = debugTotalNeededIssue;
window.fixMissingUnits = fixMissingUnits;
