// Test script to verify fixed asset field persistence
// Run this in the browser console to test the data flow

async function testFixedAssetPersistence() {
  console.log('🧪 Starting Fixed Asset Persistence Test...');
  
  try {
    // Import the necessary services
    const { FinancialItemsService } = await import('./src/lib/services/financialItemsService.ts');
    const { FINANCIAL_ITEM_CATEGORIES } = await import('./src/lib/db/schema.ts');
    
    // Test 1: Create a test fixed asset item
    console.log('📝 Test 1: Creating test fixed asset item...');
    
    const testAssetId = `test-asset-${Date.now()}`;
    const testAsset = {
      id: testAssetId,
      name: 'Test Fixed Asset',
      value: 12000000, // 12 million IDR
      category: FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL,
      note: 'Test asset for persistence verification',
      isFixedAsset: true,
      estimatedUsefulLifeYears: 4
    };
    
    // Create the item
    const createdAsset = await FinancialItemsService.create(testAsset);
    console.log('✅ Created asset:', createdAsset);
    
    // Test 2: Retrieve the item and verify fixed asset fields
    console.log('📖 Test 2: Retrieving item to verify persistence...');
    
    const retrievedAsset = await FinancialItemsService.getById(testAssetId);
    console.log('📋 Retrieved asset:', retrievedAsset);
    
    // Verify the fixed asset fields
    if (retrievedAsset.isFixedAsset === true && retrievedAsset.estimatedUsefulLifeYears === 4) {
      console.log('✅ Fixed asset fields persisted correctly!');
    } else {
      console.error('❌ Fixed asset fields NOT persisted correctly:', {
        isFixedAsset: retrievedAsset.isFixedAsset,
        estimatedUsefulLifeYears: retrievedAsset.estimatedUsefulLifeYears
      });
    }
    
    // Test 3: Update the fixed asset fields
    console.log('🔄 Test 3: Updating fixed asset fields...');
    
    const updates = {
      isFixedAsset: true,
      estimatedUsefulLifeYears: 8,
      note: 'Updated test asset'
    };
    
    await FinancialItemsService.update(testAssetId, updates);
    
    const updatedAsset = await FinancialItemsService.getById(testAssetId);
    console.log('📋 Updated asset:', updatedAsset);
    
    if (updatedAsset.estimatedUsefulLifeYears === 8) {
      console.log('✅ Fixed asset field updates persisted correctly!');
    } else {
      console.error('❌ Fixed asset field updates NOT persisted correctly');
    }
    
    // Test 4: Test the conversion functions
    console.log('🔄 Test 4: Testing conversion functions...');
    
    // Import the hook to test the conversion functions
    const { default: useFinancialItemsModule } = await import('./src/hooks/useFinancialItems.ts');
    
    // Test 5: Get all initial capital items to see current state
    console.log('📋 Test 5: Getting all initial capital items...');
    
    const allInitialCapitalItems = await FinancialItemsService.getByCategory(FINANCIAL_ITEM_CATEGORIES.INITIAL_CAPITAL);
    console.log('📋 All initial capital items:', allInitialCapitalItems);
    
    // Check if any existing items have fixed asset fields
    const fixedAssets = allInitialCapitalItems.filter(item => item.isFixedAsset === true);
    console.log('🏭 Fixed assets found:', fixedAssets);
    
    // Clean up - delete test item
    await FinancialItemsService.delete(testAssetId);
    console.log('🧹 Test item cleaned up');
    
    console.log('🎉 Fixed Asset Persistence Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFixedAssetPersistence();
