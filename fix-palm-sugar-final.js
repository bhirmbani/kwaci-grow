// Final comprehensive fix for Palm Sugar Total Needed issue
// This will definitely resolve the problem

async function finalFixPalmSugar() {
  console.log('🔧 Final Fix for Palm Sugar Total Needed Issue...');
  
  try {
    // Import necessary modules
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { getFormattedQuantity } = await import('./src/utils/cogsCalculations.ts');
    
    console.log('✅ Modules imported successfully');
    
    // Step 1: Get all COGS items and identify the issue
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items in database`);
    
    // List all items to see exact names
    console.log('\n📋 All COGS items:');
    cogsItems.forEach((item, index) => {
      console.log(`${index + 1}. "${item.name}" (ID: ${item.id})`);
      console.log(`   usagePerCup: ${item.usagePerCup}, unit: "${item.unit}"`);
    });
    
    // Step 2: Find Palm Sugar with flexible matching
    let palmSugar = null;
    const searchTerms = ['Palm Sugar', 'palm sugar', 'Sugar', 'sugar', 'Palm', 'palm'];
    
    for (const term of searchTerms) {
      palmSugar = cogsItems.find(item => item.name.includes(term));
      if (palmSugar) {
        console.log(`\n🎯 Found Palm Sugar using search term "${term}": "${palmSugar.name}"`);
        break;
      }
    }
    
    if (!palmSugar) {
      console.error('❌ Palm Sugar not found with any search term!');
      console.log('💡 Creating Palm Sugar item...');
      
      // Create Palm Sugar if it doesn't exist
      const newPalmSugar = {
        id: 'palm-sugar-' + Date.now(),
        name: 'Palm Sugar (10ml)',
        value: 485,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 48500,
        baseUnitQuantity: 1000,
        usagePerCup: 10,
        unit: 'ml'
      };
      
      await FinancialItemsService.create(newPalmSugar);
      console.log('✅ Palm Sugar created successfully!');
      palmSugar = newPalmSugar;
    }
    
    // Step 3: Analyze current Palm Sugar data
    console.log('\n🔍 Current Palm Sugar Data Analysis:');
    console.log('Raw data:', JSON.stringify(palmSugar, null, 2));
    
    // Check each field
    const checks = {
      'usagePerCup exists': palmSugar.usagePerCup !== undefined,
      'usagePerCup not null': palmSugar.usagePerCup !== null,
      'usagePerCup >= 0': palmSugar.usagePerCup >= 0,
      'unit exists': !!palmSugar.unit,
      'unit not empty': palmSugar.unit && palmSugar.unit.trim() !== '',
      'baseUnitCost exists': !!palmSugar.baseUnitCost,
      'baseUnitQuantity exists': !!palmSugar.baseUnitQuantity
    };
    
    console.log('\n✅ Field Checks:');
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`  ${result ? '✅' : '❌'} ${check}`);
    });
    
    // Step 4: Fix any missing or incorrect data
    const needsUpdate = Object.values(checks).some(check => !check);
    
    if (needsUpdate) {
      console.log('\n🔧 Updating Palm Sugar with correct data...');
      
      const correctData = {
        baseUnitCost: 48500,      // 48,500 IDR per liter
        baseUnitQuantity: 1000,   // 1000 ml
        usagePerCup: 10,          // 10 ml per cup
        unit: 'ml',               // milliliters
        value: 485,               // Calculated: (48500 / 1000) * 10 = 485
        name: 'Palm Sugar (10ml)' // Ensure consistent name
      };
      
      await FinancialItemsService.update(palmSugar.id, correctData);
      console.log('✅ Palm Sugar updated successfully!');
      
      // Get updated data
      palmSugar = await FinancialItemsService.getById(palmSugar.id);
      console.log('Updated data:', JSON.stringify(palmSugar, null, 2));
    } else {
      console.log('✅ Palm Sugar data is already correct');
    }
    
    // Step 5: Test the calculation
    console.log('\n🧮 Testing Calculation:');
    const dailyTarget = 60;
    const expectedTotal = 600; // 10ml × 60 cups
    const expectedFormatted = '600 ml';
    
    // Manual calculation
    const actualTotal = palmSugar.usagePerCup * dailyTarget;
    const actualFormatted = getFormattedQuantity(actualTotal, palmSugar.unit);
    
    console.log(`Expected: ${palmSugar.usagePerCup} × ${dailyTarget} = ${expectedTotal} ml`);
    console.log(`Actual: ${palmSugar.usagePerCup} × ${dailyTarget} = ${actualTotal} ${palmSugar.unit}`);
    console.log(`Formatted: "${actualFormatted}"`);
    console.log(`Expected formatted: "${expectedFormatted}"`);
    
    if (actualFormatted === expectedFormatted) {
      console.log('✅ Calculation is correct!');
    } else {
      console.log('❌ Calculation mismatch');
    }
    
    // Step 6: Test the conditional logic from the component
    console.log('\n🧪 Testing Component Conditional Logic:');
    
    const hasValidUsage = (palmSugar.usagePerCup !== undefined && palmSugar.usagePerCup !== null && palmSugar.usagePerCup >= 0);
    const hasValidUnit = (palmSugar.unit && palmSugar.unit.trim() !== '');
    const hasValidTarget = (dailyTarget > 0);
    
    console.log(`hasValidUsage: ${hasValidUsage}`);
    console.log(`hasValidUnit: ${hasValidUnit}`);
    console.log(`hasValidTarget: ${hasValidTarget}`);
    
    const shouldShow = hasValidUsage && hasValidUnit && hasValidTarget;
    console.log(`Final result - shouldShow: ${shouldShow}`);
    
    if (shouldShow) {
      console.log('✅ Palm Sugar should show Total Needed value in the UI');
      console.log(`Expected display: "${expectedFormatted}"`);
    } else {
      console.log('❌ Palm Sugar will show "-" in the UI');
    }
    
    // Step 7: Force refresh recommendation
    console.log('\n🔄 Next Steps:');
    console.log('1. Refresh the page (F5 or Ctrl+R)');
    console.log('2. Open COGS Calculator');
    console.log('3. Check Palm Sugar Total Needed column');
    console.log('4. Should show "600 ml" for 60 cups daily target');
    
    console.log('\n🎉 Final fix complete!');
    
    return {
      success: shouldShow,
      palmSugar: palmSugar,
      expectedDisplay: expectedFormatted,
      actualDisplay: shouldShow ? actualFormatted : '-'
    };
    
  } catch (error) {
    console.error('❌ Final fix failed:', error);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

// Function to verify the fix worked
async function verifyPalmSugarFix() {
  console.log('🔍 Verifying Palm Sugar fix...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { getFormattedQuantity } = await import('./src/utils/cogsCalculations.ts');
    
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    const palmSugar = cogsItems.find(item => 
      item.name.toLowerCase().includes('palm') || 
      item.name.toLowerCase().includes('sugar')
    );
    
    if (!palmSugar) {
      console.log('❌ Palm Sugar still not found');
      return false;
    }
    
    const dailyTarget = 60;
    const hasValidUsage = (palmSugar.usagePerCup !== undefined && palmSugar.usagePerCup !== null && palmSugar.usagePerCup >= 0);
    const hasValidUnit = (palmSugar.unit && palmSugar.unit.trim() !== '');
    const shouldShow = hasValidUsage && hasValidUnit && dailyTarget > 0;
    
    if (shouldShow) {
      const totalNeeded = palmSugar.usagePerCup * dailyTarget;
      const formatted = getFormattedQuantity(totalNeeded, palmSugar.unit);
      console.log(`✅ Palm Sugar verification successful!`);
      console.log(`   Should display: "${formatted}"`);
      return true;
    } else {
      console.log(`❌ Palm Sugar verification failed`);
      console.log(`   usagePerCup: ${palmSugar.usagePerCup}`);
      console.log(`   unit: "${palmSugar.unit}"`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Auto-run the final fix
console.log('🚀 Running Final Palm Sugar Fix...');
finalFixPalmSugar().then(result => {
  if (result.success) {
    console.log('🎉 SUCCESS! Palm Sugar should now show Total Needed values.');
    console.log('🔄 Please refresh the page to see the changes.');
  } else {
    console.log('❌ Fix failed. Please check the console for details.');
  }
});

// Export functions
window.finalFixPalmSugar = finalFixPalmSugar;
window.verifyPalmSugarFix = verifyPalmSugarFix;
