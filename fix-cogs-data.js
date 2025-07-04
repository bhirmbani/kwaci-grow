// Comprehensive fix for COGS data issues
// This script will ensure all COGS items have complete and correct data

async function fixCOGSData() {
  console.log('🔧 Fixing COGS Data Issues...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    // Get all COGS items
    const cogsItems = await FinancialItemsService.getByCategory('variable_cogs');
    console.log(`📊 Found ${cogsItems.length} COGS items`);
    
    // Define the correct data for each ingredient based on seed data
    const correctData = {
      'Milk (100ml)': {
        baseUnitCost: 20000,
        baseUnitQuantity: 1000,
        usagePerCup: 100,
        unit: 'ml',
        value: 2000
      },
      'Coffee Beans (5g)': {
        baseUnitCost: 200000,
        baseUnitQuantity: 1000,
        usagePerCup: 5,
        unit: 'g',
        value: 1000
      },
      'Palm Sugar (10ml)': {
        baseUnitCost: 48500,
        baseUnitQuantity: 1000,
        usagePerCup: 10,
        unit: 'ml',
        value: 485
      },
      'Cup + Lid': {
        baseUnitCost: 850,
        baseUnitQuantity: 1,
        usagePerCup: 1,
        unit: 'piece',
        value: 850
      },
      'Ice Cubes (100g)': {
        baseUnitCost: 2920,
        baseUnitQuantity: 1000,
        usagePerCup: 100,
        unit: 'g',
        value: 292
      }
    };
    
    let fixedCount = 0;
    
    for (const item of cogsItems) {
      const correctItemData = correctData[item.name];
      
      if (correctItemData) {
        console.log(`🔧 Checking ${item.name}...`);
        
        // Check if any field is missing or incorrect
        const needsUpdate = 
          !item.unit || 
          !item.baseUnitCost || 
          !item.baseUnitQuantity || 
          item.usagePerCup === undefined || 
          item.usagePerCup === null;
        
        if (needsUpdate) {
          console.log(`   ⚠️ Missing data detected, updating...`);
          console.log(`   - Current unit: "${item.unit}"`);
          console.log(`   - Current usagePerCup: ${item.usagePerCup}`);
          console.log(`   - Current baseUnitCost: ${item.baseUnitCost}`);
          
          await FinancialItemsService.update(item.id, correctItemData);
          
          console.log(`   ✅ Updated with correct data`);
          fixedCount++;
        } else {
          console.log(`   ✅ Data is correct`);
        }
      } else {
        console.log(`   ⚠️ Unknown ingredient: ${item.name}`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} items`);
    console.log('🔄 Please refresh the page to see the changes');
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const updatedItems = await FinancialItemsService.getByCategory('variable_cogs');
    
    updatedItems.forEach(item => {
      const hasCompleteData = !!(
        item.baseUnitCost &&
        item.baseUnitQuantity &&
        item.usagePerCup !== undefined &&
        item.usagePerCup !== null &&
        item.unit
      );
      
      console.log(`${item.name}: ${hasCompleteData ? '✅' : '❌'} Complete data`);
      if (!hasCompleteData) {
        console.log(`   Missing: ${!item.unit ? 'unit ' : ''}${!item.baseUnitCost ? 'baseUnitCost ' : ''}${!item.baseUnitQuantity ? 'baseUnitQuantity ' : ''}${(item.usagePerCup === undefined || item.usagePerCup === null) ? 'usagePerCup' : ''}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Function to add missing ingredients if they don't exist
async function ensureAllIngredients() {
  console.log('🔧 Ensuring all required ingredients exist...');
  
  try {
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    const requiredIngredients = [
      {
        id: '5',
        name: 'Milk (100ml)',
        value: 2000,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 20000,
        baseUnitQuantity: 1000,
        usagePerCup: 100,
        unit: 'ml'
      },
      {
        id: '6',
        name: 'Coffee Beans (5g)',
        value: 1000,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 200000,
        baseUnitQuantity: 1000,
        usagePerCup: 5,
        unit: 'g'
      },
      {
        id: '7',
        name: 'Palm Sugar (10ml)',
        value: 485,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 48500,
        baseUnitQuantity: 1000,
        usagePerCup: 10,
        unit: 'ml'
      },
      {
        id: '8',
        name: 'Cup + Lid',
        value: 850,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 850,
        baseUnitQuantity: 1,
        usagePerCup: 1,
        unit: 'piece'
      },
      {
        id: '9',
        name: 'Ice Cubes (100g)',
        value: 292,
        category: 'variable_cogs',
        note: '',
        baseUnitCost: 2920,
        baseUnitQuantity: 1000,
        usagePerCup: 100,
        unit: 'g'
      }
    ];
    
    for (const ingredient of requiredIngredients) {
      try {
        const existing = await FinancialItemsService.getById(ingredient.id);
        if (!existing) {
          console.log(`➕ Creating missing ingredient: ${ingredient.name}`);
          await FinancialItemsService.create(ingredient);
        } else {
          console.log(`✅ ${ingredient.name} already exists`);
        }
      } catch (error) {
        console.log(`⚠️ Issue with ${ingredient.name}:`, error.message);
      }
    }
    
    console.log('✅ All required ingredients ensured');
    
  } catch (error) {
    console.error('❌ Ensure ingredients failed:', error);
  }
}

// Instructions
console.log(`
🔧 COGS Data Fix Tools

To fix the Total Needed issues:
1. fixCOGSData() - Fix missing/incorrect COGS data
2. ensureAllIngredients() - Ensure all required ingredients exist

After running these, refresh the page to see the fixes.
`);

// Export for use
window.fixCOGSData = fixCOGSData;
window.ensureAllIngredients = ensureAllIngredients;
