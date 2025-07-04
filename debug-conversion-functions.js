// Debug script to test the conversion functions
// Run this in the browser console after opening the app

console.log('🔍 Testing Fixed Asset Conversion Functions...');

// Test data
const testAppItem = {
  id: 'test-123',
  name: 'Test Equipment',
  value: 12000000,
  note: 'Test note',
  isFixedAsset: true,
  estimatedUsefulLifeYears: 4,
  sourceAssetId: undefined
};

const testDbItem = {
  id: 'test-123',
  name: 'Test Equipment',
  value: 12000000,
  category: 'initial_capital',
  note: 'Test note',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isFixedAsset: true,
  estimatedUsefulLifeYears: 4,
  sourceAssetId: undefined
};

console.log('📝 Test App Item:', testAppItem);
console.log('📝 Test DB Item:', testDbItem);

// The conversion functions are not exported, so we'll test through the actual data flow
// by checking what happens when we interact with the UI

console.log('✅ Test data prepared. Now test the UI:');
console.log('1. Open Initial Capital sheet');
console.log('2. Add a new item with fixed asset checkbox checked');
console.log('3. Enter useful life value');
console.log('4. Save and close sheet');
console.log('5. Reopen sheet and check if values persist');
console.log('6. Check console logs for conversion function output');
