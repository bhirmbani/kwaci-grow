# Fixed Asset Management Testing Guide

## Overview
This guide provides step-by-step instructions to test the new fixed asset management functionality in the Initial Capital sheet component.

## Features Implemented

### 1. Database Schema (Version 3)
- ✅ Added `isFixedAsset` boolean field
- ✅ Added `estimatedUsefulLifeYears` number field  
- ✅ Added `sourceAssetId` string field for linking depreciation entries
- ✅ Automatic migration from version 2 to version 3

### 2. UI Enhancements
- ✅ Added "Fixed Asset" checkbox column (conditional)
- ✅ Added "Useful Life (years)" input column (conditional, only shows when fixed asset is checked)
- ✅ Responsive design maintained
- ✅ Proper validation and error handling

### 3. Business Logic
- ✅ Automatic depreciation calculation using straight-line method
- ✅ Automatic creation of depreciation entries in Fixed Costs
- ✅ Automatic updates when asset values or useful life changes
- ✅ Automatic cleanup when assets are deleted or unmarked as fixed assets
- ✅ Cross-category data consistency

## Manual Testing Steps

### Test 1: Basic Fixed Asset Creation
1. Open the application at `http://localhost:5173/`
2. Click "Manage Initial Capital" button
3. In the Initial Capital sheet, you should see two new columns:
   - "Fixed Asset" (checkbox column)
   - "Useful Life (years)" (input column, initially hidden)
4. Add a new item:
   - Name: "Test Equipment"
   - Amount: 12000000 (12 million IDR)
   - Check the "Fixed Asset" checkbox
   - Enter "4" in the "Useful Life (years)" field that appears
   - Add a note: "Test fixed asset"
5. Click the "+" button to add the item
6. **Expected Result**: Item is added with fixed asset fields populated

### Test 2: Automatic Depreciation Entry Creation
1. After completing Test 1, close the Initial Capital sheet
2. Click "Manage Fixed Costs" button
3. **Expected Result**: You should see a new entry named "Depreciation: Test Equipment"
4. **Expected Calculation**: 
   - Annual depreciation: 12,000,000 ÷ 4 = 3,000,000 IDR
   - Monthly depreciation: 3,000,000 ÷ 12 = 250,000 IDR
5. Verify the depreciation entry shows 250,000 IDR as the monthly amount

### Test 3: Asset Value Update
1. Go back to "Manage Initial Capital"
2. Change the "Test Equipment" amount from 12,000,000 to 16,000,000
3. Close the Initial Capital sheet and open "Manage Fixed Costs"
4. **Expected Result**: The depreciation entry should automatically update to:
   - New monthly depreciation: 16,000,000 ÷ 4 ÷ 12 = 333,333 IDR (rounded)

### Test 4: Useful Life Update
1. Go back to "Manage Initial Capital"
2. Change the "Test Equipment" useful life from 4 to 2 years
3. Close and check "Manage Fixed Costs"
4. **Expected Result**: Depreciation should update to:
   - New monthly depreciation: 16,000,000 ÷ 2 ÷ 12 = 666,667 IDR (rounded)

### Test 5: Unmark as Fixed Asset
1. Go back to "Manage Initial Capital"
2. Uncheck the "Fixed Asset" checkbox for "Test Equipment"
3. **Expected Result**: The "Useful Life" field should disappear
4. Close and check "Manage Fixed Costs"
5. **Expected Result**: The "Depreciation: Test Equipment" entry should be automatically removed

### Test 6: Asset Deletion
1. Go back to "Manage Initial Capital"
2. Re-check "Fixed Asset" and set useful life to 5 years for "Test Equipment"
3. Verify the depreciation entry is recreated in Fixed Costs
4. Delete the "Test Equipment" item entirely (trash icon)
5. **Expected Result**: The corresponding depreciation entry should be automatically removed from Fixed Costs

### Test 7: Multiple Fixed Assets
1. Create multiple fixed assets with different values and useful lives:
   - "Laptop": 8,000,000 IDR, 3 years
   - "Furniture": 5,000,000 IDR, 10 years
   - "Vehicle": 50,000,000 IDR, 8 years
2. **Expected Results**:
   - Each should create a separate depreciation entry
   - Calculations should be independent
   - All entries should appear in Fixed Costs with correct amounts

### Test 8: Error Handling
1. Try to create a fixed asset with 0 useful life
2. Try to create a fixed asset with negative useful life
3. **Expected Result**: Appropriate validation and error messages

## Expected Calculations

### Depreciation Formula
- **Annual Depreciation** = Asset Value ÷ Useful Life (years)
- **Monthly Depreciation** = Annual Depreciation ÷ 12
- **Final Amount** = Math.round(Monthly Depreciation)

### Example Calculations
| Asset Value | Useful Life | Annual Depreciation | Monthly Depreciation |
|-------------|-------------|-------------------|-------------------|
| 12,000,000 | 4 years | 3,000,000 | 250,000 |
| 8,000,000 | 3 years | 2,666,667 | 222,222 |
| 5,000,000 | 10 years | 500,000 | 41,667 |
| 50,000,000 | 8 years | 6,250,000 | 520,833 |

## Database Verification

### Check Database Schema
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find IndexedDB → FinancialDashboardDB
4. Check that financial items have the new fields:
   - `isFixedAsset`
   - `estimatedUsefulLifeYears`
   - `sourceAssetId`

### Verify Data Relationships
1. Create a fixed asset and note its ID
2. Check that the corresponding depreciation entry has `sourceAssetId` pointing to the asset ID
3. Verify that depreciation entries are in the `fixed_costs` category

## Troubleshooting

### Common Issues
1. **Depreciation not appearing**: Check browser console for errors
2. **Calculation incorrect**: Verify the formula implementation
3. **UI not responsive**: Check that `enableFixedAssets={true}` is set in InitialCapitalSheet
4. **Database errors**: Clear IndexedDB and refresh to trigger migration

### Console Commands for Debugging
```javascript
// Check database version
await db.verno

// List all financial items
await db.financialItems.toArray()

// Find depreciation entries
await db.financialItems.where('category').equals('fixed_costs').toArray()
```

## Success Criteria
- ✅ All manual tests pass
- ✅ Depreciation calculations are accurate
- ✅ Cross-category relationships work correctly
- ✅ Data persists across browser sessions
- ✅ No console errors during normal operation
- ✅ UI is responsive and user-friendly
