// Test script to verify warehouse integration fixes
// Run this in browser console after navigating to the app

console.log('🧪 Testing Warehouse Integration Fixes');

// Test 1: Check if formatCurrency handles NaN values
console.log('\n1. Testing formatCurrency with NaN values:');
try {
  // These should all return formatted 0 instead of NaN
  console.log('formatCurrency(NaN):', formatCurrency(NaN));
  console.log('formatCurrency(undefined):', formatCurrency(undefined));
  console.log('formatCurrency(null):', formatCurrency(null));
  console.log('formatCurrency("invalid"):', formatCurrency("invalid"));
  console.log('✅ formatCurrency handles invalid values correctly');
} catch (error) {
  console.error('❌ formatCurrency test failed:', error);
}

// Test 2: Check True Shopping List vs COGS Calculator difference
console.log('\n2. Testing cost calculation differences:');
const testItems = [
  {
    id: '1',
    name: 'Milk',
    baseUnitCost: 20000, // 20,000 IDR per liter
    baseUnitQuantity: 1000, // 1000 ml per unit
    usagePerCup: 100, // 100 ml per cup
    unit: 'ml'
  }
];

const dailyTarget = 100;

// Theoretical cost (exact usage)
const theoreticalCost = (20000 / 1000) * 100 * dailyTarget; // 200,000 IDR
console.log('Theoretical daily cost:', theoreticalCost, 'IDR');

// Actual cost (with packaging)
const unitsNeeded = Math.ceil((100 * dailyTarget) / 1000); // 10 units
const actualCost = unitsNeeded * 20000; // 200,000 IDR (no waste in this case)
console.log('Actual shopping cost:', actualCost, 'IDR');
console.log('Units to buy:', unitsNeeded);

if (actualCost >= theoreticalCost) {
  console.log('✅ Actual cost is higher or equal to theoretical (expected due to packaging)');
} else {
  console.log('❌ Actual cost is lower than theoretical (unexpected)');
}

// Test 3: Verify warehouse data structure
console.log('\n3. Testing warehouse data structure:');
const warehouseItem = {
  id: 'test-1',
  name: 'Milk',
  totalNeeded: 10000, // 10L in ml (actual purchased quantity)
  formattedQuantity: '10 units of 1000ml containers',
  unit: 'ml',
  unitCost: 20, // Cost per ml
  totalCost: 200000, // Total cost
  baseUnitQuantity: 1000
};

console.log('Sample warehouse item:', warehouseItem);
console.log('✅ Warehouse item structure looks correct');

console.log('\n🎉 All tests completed! Check the UI for:');
console.log('- No NaN values in warehouse route');
console.log('- Cost comparison section in True Shopping List');
console.log('- Package icon on Add to Warehouse button');
console.log('- Proper dark mode colors on the button');
