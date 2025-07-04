# Fixed Asset Management - Testing Instructions

## Critical Issues Fixed

### ✅ Issue 1: Real-time UI Updates
**Problem**: Depreciation entries didn't appear in Fixed Costs without browser refresh
**Solution**: Implemented event-driven architecture with automatic refresh

### ✅ Issue 2: Data Persistence  
**Problem**: Fixed asset data wasn't being saved to database
**Solution**: Fixed operation order and data conversion in useInitialCapitalItems hook

## Testing Steps

### 1. Open the Application
1. Navigate to `http://localhost:5173/`
2. Open browser developer tools (F12) to monitor console logs
3. You should see detailed logging for all fixed asset operations

### 2. Test Data Persistence
1. Click "Manage Initial Capital"
2. Add a new item:
   - Name: "Test Equipment"
   - Amount: 10000000 (10 million IDR)
   - Check the "Fixed Asset" checkbox ✅
   - Enter "5" in the "Useful Life (years)" field
   - Note: "Test fixed asset"
3. Click the "+" button to add
4. **Expected Console Logs**:
   ```
   🔄 useInitialCapitalItems: Starting update with items: [...]
   📝 Step 1: Updating base items in database...
   ✅ Step 1: Base items updated successfully
   🏭 Step 2: Processing depreciation logic...
   🔧 Processing fixed asset changes for: Test Equipment
   ✅ Depreciation entry created and event emitted for: Test Equipment
   ✅ Fixed asset processing completed for: Test Equipment
   ✅ Step 2: Depreciation logic completed successfully
   ```

### 3. Test Real-time UI Updates
1. **Without closing the Initial Capital sheet**, open a new tab/window
2. Navigate to the same URL: `http://localhost:5173/`
3. Click "Manage Fixed Costs" in the new tab
4. **Expected Result**: You should immediately see "Depreciation: Test Equipment" with value 166,667 IDR
5. **Expected Console Logs in Fixed Costs**:
   ```
   📡 DepreciationEvent emitted: {type: "depreciation-changed", assetId: "...", assetName: "Test Equipment", action: "created"}
   🔄 Fixed Costs: Received depreciation event, refreshing...
   ```

### 4. Test Data Persistence After Refresh
1. Close both Initial Capital and Fixed Costs sheets
2. Refresh the browser page (F5)
3. Click "Manage Initial Capital"
4. **Expected Result**: 
   - "Test Equipment" should still be there
   - "Fixed Asset" checkbox should be checked ✅
   - "Useful Life (years)" should show "5"
   - All data should be preserved

### 5. Test Update Operations
1. In Initial Capital, change "Test Equipment" amount to 15000000 (15 million IDR)
2. **Expected Console Logs**:
   ```
   🔧 Processing fixed asset changes for: Test Equipment
   ✅ Depreciation entry updated and event emitted for: Test Equipment
   ```
3. Check Fixed Costs - depreciation should update to 250,000 IDR (15M ÷ 5 ÷ 12)

### 6. Test Useful Life Changes
1. Change useful life from 5 to 3 years
2. **Expected Result**: Depreciation updates to 416,667 IDR (15M ÷ 3 ÷ 12)

### 7. Test Unmark as Fixed Asset
1. Uncheck the "Fixed Asset" checkbox
2. **Expected Console Logs**:
   ```
   🗑️ Handling deletion of fixed asset: Test Equipment
   ✅ Depreciation entry deleted and event emitted for: Test Equipment
   ```
3. **Expected Result**: Depreciation entry disappears from Fixed Costs immediately

### 8. Test Asset Deletion
1. Re-check "Fixed Asset" and set useful life to 4 years
2. Verify depreciation entry is recreated
3. Delete the entire "Test Equipment" item (trash icon)
4. **Expected Result**: Depreciation entry is automatically removed from Fixed Costs

## Expected Calculations

| Asset Value | Useful Life | Annual Depreciation | Monthly Depreciation |
|-------------|-------------|-------------------|-------------------|
| 10,000,000 | 5 years | 2,000,000 | 166,667 |
| 15,000,000 | 5 years | 3,000,000 | 250,000 |
| 15,000,000 | 3 years | 5,000,000 | 416,667 |

## Console Commands for Debugging

Open browser console and run these commands to inspect the database:

```javascript
// Check database version (should be 3)
await db.verno

// List all initial capital items with fixed asset fields
const capitalItems = await db.financialItems.where('category').equals('initial_capital').toArray()
console.table(capitalItems.map(item => ({
  name: item.name,
  value: item.value,
  isFixedAsset: item.isFixedAsset,
  usefulLife: item.estimatedUsefulLifeYears,
  sourceAssetId: item.sourceAssetId
})))

// List all fixed cost items (including depreciation entries)
const fixedCosts = await db.financialItems.where('category').equals('fixed_costs').toArray()
console.table(fixedCosts.map(item => ({
  name: item.name,
  value: item.value,
  sourceAssetId: item.sourceAssetId
})))

// Find depreciation entries specifically
const depreciationEntries = await db.financialItems.where('category').equals('fixed_costs').and(item => item.sourceAssetId != null).toArray()
console.table(depreciationEntries)
```

## Success Criteria

### ✅ Data Persistence
- [ ] Fixed asset checkbox state persists after page refresh
- [ ] Useful life values persist after page refresh
- [ ] Database contains isFixedAsset and estimatedUsefulLifeYears fields
- [ ] Console shows successful database updates

### ✅ Real-time UI Updates
- [ ] Depreciation entries appear immediately in Fixed Costs (no refresh needed)
- [ ] Updates to assets immediately update depreciation entries
- [ ] Deleting assets immediately removes depreciation entries
- [ ] Console shows depreciation events being emitted and received

### ✅ Cross-category Relationships
- [ ] Depreciation entries have correct sourceAssetId linking to assets
- [ ] Depreciation calculations are accurate
- [ ] Multiple fixed assets work independently
- [ ] No orphaned depreciation entries

## Troubleshooting

### If Data Doesn't Persist
1. Check console for error messages
2. Verify database version is 3: `await db.verno`
3. Check if items have the new fields: `await db.financialItems.toArray()`

### If Real-time Updates Don't Work
1. Check console for depreciation events
2. Verify event listeners are attached
3. Look for error messages in Fixed Costs component

### If Calculations Are Wrong
1. Verify the formula: (Asset Value ÷ Useful Life Years) ÷ 12
2. Check console logs for calculation details
3. Ensure useful life is greater than 0
