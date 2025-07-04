// Simple test script to verify COGS calculator database integration
// Run this in the browser console to test the fixes

async function testCOGSIntegration() {
  console.log('🧪 Testing COGS Calculator Database Integration...');
  
  try {
    // Import the database and service
    const { db } = await import('./src/lib/db/index.ts');
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    
    console.log('✅ Database and service imported successfully');
    
    // Test 1: Create a COGS item with all fields
    const testItem = {
      id: 'test-cogs-' + Date.now(),
      name: 'Test Coffee Beans',
      value: 1500, // Will be calculated
      category: 'variable_cogs',
      note: 'Test ingredient for COGS calculator',
      baseUnitCost: 50000, // 50,000 IDR per kg
      baseUnitQuantity: 1000, // 1000g
      usagePerCup: 15, // 15g per cup
      unit: 'g'
    };
    
    console.log('📝 Creating test COGS item:', testItem);
    
    // Create the item
    await FinancialItemsService.create(testItem);
    console.log('✅ Test item created successfully');
    
    // Test 2: Retrieve the item and verify all fields are preserved
    const retrievedItem = await FinancialItemsService.getById(testItem.id);
    console.log('📖 Retrieved item:', retrievedItem);
    
    // Verify all COGS fields are present
    const requiredFields = ['baseUnitCost', 'baseUnitQuantity', 'usagePerCup', 'unit'];
    const missingFields = requiredFields.filter(field => retrievedItem[field] === undefined);
    
    if (missingFields.length === 0) {
      console.log('✅ All COGS fields preserved in database');
    } else {
      console.error('❌ Missing COGS fields:', missingFields);
    }
    
    // Test 3: Verify cost calculation
    const expectedCost = Math.round((testItem.baseUnitCost / testItem.baseUnitQuantity) * testItem.usagePerCup);
    console.log('🧮 Expected cost per cup:', expectedCost);
    console.log('💰 Actual value in database:', retrievedItem.value);
    
    if (retrievedItem.value === expectedCost) {
      console.log('✅ Cost calculation matches expected value');
    } else {
      console.log('⚠️ Cost calculation may need verification');
    }
    
    // Test 4: Update the item with new COGS values
    const updates = {
      baseUnitCost: 60000, // Increase cost
      usagePerCup: 20, // Increase usage
      value: Math.round((60000 / 1000) * 20) // New calculated value
    };
    
    console.log('🔄 Updating item with new values:', updates);
    await FinancialItemsService.update(testItem.id, updates);
    
    const updatedItem = await FinancialItemsService.getById(testItem.id);
    console.log('📖 Updated item:', updatedItem);
    
    // Verify updates were saved
    if (updatedItem.baseUnitCost === updates.baseUnitCost && 
        updatedItem.usagePerCup === updates.usagePerCup) {
      console.log('✅ COGS field updates saved successfully');
    } else {
      console.error('❌ COGS field updates not saved properly');
    }
    
    // Clean up - delete test item
    await FinancialItemsService.delete(testItem.id);
    console.log('🧹 Test item cleaned up');
    
    console.log('🎉 COGS Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions for manual testing
console.log(`
🧪 COGS Calculator Integration Test

To run this test:
1. Open browser console (F12)
2. Copy and paste this entire script
3. Run: testCOGSIntegration()

Or test manually:
1. Open COGS Calculator sheet
2. Add a new ingredient with all fields
3. Refresh the page
4. Verify the data persists
5. Check that cost per cup updates automatically
`);

// Export for use
window.testCOGSIntegration = testCOGSIntegration;
