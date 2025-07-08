# Minimum Purchase Quantity Feature

## Overview
Added automatic quantity rounding to match real-world purchasing constraints in the warehouse form. The system now rounds up ingredient quantities to the nearest multiple of the minimum purchase unit size.

## Implementation Details

### 1. Data Structure Updates
- **CalculatedIngredient Interface**: Added new fields:
  - `baseUnitQuantity`: Minimum purchasable unit size
  - `actualQuantityToAdd`: Rounded-up quantity to purchase
  - `purchaseUnits`: Number of base units to buy

### 2. Calculation Logic
- **Formula**: `actualQuantityToAdd = Math.ceil(quantityToAdd / baseUnitQuantity) * baseUnitQuantity`
- **Purchase Units**: `purchaseUnits = Math.ceil(quantityToAdd / baseUnitQuantity)`
- **Applied to both modes**: Regular and Smart Stock Calculation

### 3. UI Enhancements
- **New Table Columns**:
  - "Theoretical Need": Shows calculated requirement
  - "Actual Quantity to Add": Shows rounded-up amount
  - "Purchase Info": Shows units to buy (e.g., "2 units of 1000ml each")
- **Visual Indicators**: 
  - Orange text when rounding occurs
  - Green text for sufficient stock
  - Clear purchase unit information

### 4. Cost Calculations
- Total costs now reflect actual purchase quantities
- Cost per unit remains based on base unit pricing
- Batch totals show real purchase costs

## Example Scenarios

### Scenario 1: Regular Mode
- **Product**: Cappuccino (10 cups)
- **Ingredient**: Milk (100ml per cup)
- **Required**: 1000ml
- **Base Unit**: 1000ml bottle
- **Result**: Purchase 1000ml (1 bottle) - exact match

### Scenario 2: Regular Mode with Rounding
- **Product**: Latte (11 cups) 
- **Ingredient**: Milk (100ml per cup)
- **Required**: 1100ml
- **Base Unit**: 1000ml bottle
- **Result**: Purchase 2000ml (2 bottles) - rounded up from 1100ml

### Scenario 3: Smart Stock Mode
- **Current Stock**: 500ml milk
- **Required**: 1100ml milk
- **Deficit**: 600ml
- **Base Unit**: 1000ml bottle
- **Result**: Purchase 1000ml (1 bottle) - rounded up from 600ml deficit

### Scenario 4: Smart Stock Mode - Sufficient Stock
- **Current Stock**: 1500ml milk
- **Required**: 1100ml milk
- **Deficit**: 0ml (sufficient)
- **Result**: No purchase needed

## Technical Features

### Error Handling
- Handles zero or negative quantities gracefully
- Falls back to original behavior for invalid base unit quantities
- Maintains backward compatibility

### Form Validation
- Submit button disabled when no actual quantities needed
- Proper validation for Smart Stock mode
- Clear messaging for sufficient stock scenarios

### Performance
- Calculations performed in useMemo for efficiency
- Real-time updates without component re-renders
- Optimized table rendering

## Benefits

1. **Real-World Accuracy**: Matches actual purchasing constraints
2. **Cost Transparency**: Shows true purchase costs vs theoretical needs
3. **Inventory Planning**: Helps with accurate stock planning
4. **User Experience**: Clear visual feedback and explanations
5. **Business Logic**: Reflects how ingredients are actually purchased

## Files Modified
- `src/components/warehouse/ProductBasedWarehouseForm.tsx`: Main implementation
- Added utility functions for quantity calculations
- Enhanced UI with new table columns and information
- Updated form submission and validation logic

## Testing
- Created comprehensive test suite covering all scenarios
- Verified calculations for edge cases
- Tested both Regular and Smart Stock modes
- Confirmed UI updates and cost calculations
