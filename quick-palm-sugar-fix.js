// Quick fix for Palm Sugar Total Needed issue
// Run this in the browser console to immediately fix the problem

async function quickFixPalmSugar() {
  console.log('⚡ Quick Fix for Palm Sugar...');
  
  try {
    // Import the service
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    console.log('✅ Service imported');
    
    // Get all COGS items to find Palm Sugar
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items`);
    
    // Find Palm Sugar (try different name variations)
    let palmSugar = cogsItems.find(item => item.name.includes('Palm Sugar'));
    if (!palmSugar) {
      palmSugar = cogsItems.find(item => item.name.toLowerCase().includes('sugar'));
    }
    if (!palmSugar) {
      palmSugar = cogsItems.find(item => item.name.toLowerCase().includes('palm'));
    }
    
    if (!palmSugar) {
      console.error('❌ Palm Sugar not found! Available items:');
      cogsItems.forEach(item => console.log(`  - "${item.name}"`));
      return;
    }
    
    console.log(`🎯 Found: "${palmSugar.name}" (ID: ${palmSugar.id})`);
    
    // Check current data
    console.log('Current data:');
    console.log(`  usagePerCup: ${palmSugar.usagePerCup}`);
    console.log(`  unit: "${palmSugar.unit}"`);
    console.log(`  baseUnitCost: ${palmSugar.baseUnitCost}`);
    console.log(`  baseUnitQuantity: ${palmSugar.baseUnitQuantity}`);
    
    // Check if data is missing
    const needsFix = !palmSugar.unit || 
                     palmSugar.usagePerCup === undefined || 
                     palmSugar.usagePerCup === null ||
                     !palmSugar.baseUnitCost ||
                     !palmSugar.baseUnitQuantity;
    
    if (needsFix) {
      console.log('🔧 Data needs fixing, applying correct values...');
      
      const correctData = {
        baseUnitCost: 48500,      // 48,500 IDR per liter
        baseUnitQuantity: 1000,   // 1000 ml
        usagePerCup: 10,          // 10 ml per cup
        unit: 'ml',               // milliliters
        value: 485                // Calculated value
      };
      
      await FinancialItemsService.update(palmSugar.id, correctData);
      console.log('✅ Palm Sugar updated with correct data!');
      
      // Verify the update
      const updated = await FinancialItemsService.getById(palmSugar.id);
      console.log('Updated data:');
      console.log(`  usagePerCup: ${updated.usagePerCup}`);
      console.log(`  unit: "${updated.unit}"`);
      console.log(`  baseUnitCost: ${updated.baseUnitCost}`);
      console.log(`  baseUnitQuantity: ${updated.baseUnitQuantity}`);
      
      console.log('🔄 Please refresh the page to see "600 ml" in Total Needed column');
      
    } else {
      console.log('✅ Data looks correct, testing calculation...');
      
      // Test the calculation manually
      const dailyTarget = 60;
      const totalNeeded = palmSugar.usagePerCup * dailyTarget;
      
      console.log(`Calculation: ${palmSugar.usagePerCup} × ${dailyTarget} = ${totalNeeded} ${palmSugar.unit}`);
      
      // Test the conditional logic
      const hasValidUsage = (palmSugar.usagePerCup !== undefined && palmSugar.usagePerCup !== null && palmSugar.usagePerCup >= 0);
      const hasValidUnit = (palmSugar.unit && palmSugar.unit.trim() !== '');
      const hasValidTarget = (dailyTarget > 0);
      
      console.log(`Conditional checks:`);
      console.log(`  hasValidUsage: ${hasValidUsage}`);
      console.log(`  hasValidUnit: ${hasValidUnit}`);
      console.log(`  hasValidTarget: ${hasValidTarget}`);
      
      const shouldShow = hasValidUsage && hasValidUnit && hasValidTarget;
      console.log(`  shouldShow: ${shouldShow}`);
      
      if (shouldShow) {
        console.log('✅ Should show Total Needed value');
        console.log('🤔 If still showing "-", there might be a component rendering issue');
        console.log('💡 Try refreshing the page or checking browser console for errors');
      } else {
        console.log('❌ Conditions not met, will show "-"');
      }
    }
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
  }
}

// Function to check all COGS items status
async function checkAllCOGSItems() {
  console.log('📊 Checking all COGS items...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    
    console.log(`Found ${cogsItems.length} COGS items:`);
    
    cogsItems.forEach((item, index) => {
      const hasValidUsage = (item.usagePerCup !== undefined && item.usagePerCup !== null && item.usagePerCup >= 0);
      const hasValidUnit = (item.unit && item.unit.trim() !== '');
      const shouldShow = hasValidUsage && hasValidUnit;
      
      console.log(`${index + 1}. ${item.name}:`);
      console.log(`   usagePerCup: ${item.usagePerCup}, unit: "${item.unit}"`);
      console.log(`   Should show Total Needed: ${shouldShow ? '✅' : '❌'}`);
      
      if (shouldShow) {
        const totalNeeded = item.usagePerCup * 60; // 60 cups daily target
        console.log(`   Expected: ${totalNeeded} ${item.unit}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Auto-run the quick fix
console.log(`
⚡ Palm Sugar Quick Fix

Running automatic fix...
`);

// Auto-execute the fix
quickFixPalmSugar();

// Export for manual use
window.quickFixPalmSugar = quickFixPalmSugar;
window.checkAllCOGSItems = checkAllCOGSItems;
