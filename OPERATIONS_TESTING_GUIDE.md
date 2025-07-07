# Operations Feature Testing Guide

This guide provides comprehensive testing instructions for the new Operations feature in the Coffee Cart Financial Dashboard.

## Overview

The Operations feature includes:
1. **Sales Recording Interface** - Record actual sales with timestamps
2. **Target vs Actual Analysis** - Real-time comparison with variance calculations
3. **Analytics Dashboard** - Charts for hourly profitability and product popularity
4. **Enhanced Projections** - Multi-product income projections

## Prerequisites

Before testing, ensure you have:
- Active branches in the system
- Active menus with products
- Daily sales targets set up
- Product sales targets configured

## Testing Checklist

### 1. Navigation & Routing ✅
- [ ] Operations section appears in sidebar navigation
- [ ] Operations page loads correctly at `/operations`
- [ ] All four tabs (Sales Recording, Target Analysis, Analytics, Projections) are accessible
- [ ] Tab switching works smoothly

### 2. Sales Recording Interface

#### Basic Functionality
- [ ] Floating action button appears in bottom-right corner
- [ ] Clicking FAB opens sales recording sheet
- [ ] Form loads with all required fields
- [ ] Branch dropdown populates with active branches
- [ ] Menu dropdown populates with active menus
- [ ] Product dropdown updates when menu changes
- [ ] Unit price auto-fills when product is selected

#### Form Validation
- [ ] All required fields show validation errors when empty
- [ ] Date picker works and restricts future dates
- [ ] Time input accepts HH:MM:SS format
- [ ] Current time button sets current timestamp
- [ ] Quantity must be at least 1
- [ ] Unit price must be non-negative
- [ ] Total amount calculates correctly (quantity × unit price)

#### Data Persistence
- [ ] Sales record saves successfully
- [ ] New record appears in sales records table
- [ ] Summary cards update with new data
- [ ] Sheet closes after successful save
- [ ] Error handling works for invalid data

#### UI/UX
- [ ] Form is responsive on mobile devices
- [ ] Sheet scrolls properly on small screens
- [ ] Loading states display correctly
- [ ] Success/error feedback is clear

### 3. Target vs Actual Analysis

#### Data Loading
- [ ] Date filter works correctly
- [ ] Branch filter works (including "All branches")
- [ ] Analysis cards load for existing targets
- [ ] No data message shows when no targets exist

#### Analysis Accuracy
- [ ] Target amounts display correctly
- [ ] Actual sales calculate correctly
- [ ] Variance calculations are accurate (absolute and percentage)
- [ ] Progress percentages are correct
- [ ] Time-based progress tracking works

#### Status Indicators
- [ ] Status badges show correct colors:
  - Green: Ahead (>10% above expected)
  - Blue: On Track (within ±10% of expected)
  - Yellow: Behind (10-20% below expected)
  - Red: At Risk (>20% below expected)
- [ ] Status icons match the status
- [ ] Performance metrics update in real-time

### 4. Analytics Dashboard

#### Chart Functionality
- [ ] Hourly Profitability Chart displays correctly
- [ ] Product Popularity Charts (quantity and revenue) render
- [ ] Daily Progress Chart shows for today's data
- [ ] Charts are responsive and theme-aware
- [ ] Tooltips show correct information

#### Filters
- [ ] Time range presets work (Today, Week, Month, Custom)
- [ ] Custom date range selection works
- [ ] Branch filter affects all charts
- [ ] Loading states display during data fetch

#### Data Accuracy
- [ ] Hourly data aggregates correctly
- [ ] Product popularity rankings are accurate
- [ ] Progress tracking shows cumulative sales
- [ ] Charts update when filters change

### 5. Enhanced Projections

#### Configuration
- [ ] Branch selection works
- [ ] Menu selection filters products correctly
- [ ] Reference date affects calculations
- [ ] Days per month setting updates projections
- [ ] "Use Actual Data" toggle works

#### Calculations
- [ ] Product targets load correctly
- [ ] Actual sales data integrates properly
- [ ] Revenue projections calculate correctly
- [ ] Profit calculations use proper COGS estimates
- [ ] Monthly projections scale daily amounts
- [ ] Performance percentages are accurate

#### Summary Cards
- [ ] Daily revenue/profit totals are correct
- [ ] Monthly projections scale properly
- [ ] Average performance calculates correctly
- [ ] Cards update when configuration changes

### 6. Integration Testing

#### Database Operations
- [ ] Sales records save to correct table
- [ ] Foreign key relationships work properly
- [ ] Data retrieval queries perform well
- [ ] No database errors in console

#### Service Integration
- [ ] SalesRecordService methods work correctly
- [ ] Integration with existing services (Menu, Branch, Target)
- [ ] Error handling in service layer
- [ ] Data consistency across components

#### Theme Support
- [ ] All components work in light mode
- [ ] All components work in dark mode
- [ ] Charts adapt to theme changes
- [ ] Colors and contrast are appropriate

### 7. Performance Testing

#### Load Times
- [ ] Initial page load is under 3 seconds
- [ ] Chart rendering is smooth
- [ ] Large datasets don't cause lag
- [ ] Form interactions are responsive

#### Memory Usage
- [ ] No memory leaks during extended use
- [ ] Charts dispose properly when unmounted
- [ ] Component cleanup works correctly

### 8. Error Handling

#### Network Errors
- [ ] Graceful handling of database connection issues
- [ ] Appropriate error messages for users
- [ ] Retry mechanisms where appropriate

#### Data Validation
- [ ] Invalid form data shows clear errors
- [ ] Edge cases handled properly (zero values, missing data)
- [ ] Calculation errors don't crash the app

### 9. Responsive Design

#### Mobile (< 768px)
- [ ] All components stack properly
- [ ] Touch interactions work correctly
- [ ] Text remains readable
- [ ] Charts scale appropriately

#### Tablet (768px - 1024px)
- [ ] Grid layouts adapt correctly
- [ ] Charts maintain aspect ratios
- [ ] Navigation remains accessible

#### Desktop (> 1024px)
- [ ] Full layout displays properly
- [ ] Charts use available space efficiently
- [ ] Multi-column layouts work correctly

## Test Data Setup

To properly test the Operations feature, set up the following test data:

1. **Branches**: Create 2-3 active branches
2. **Menus**: Create 2-3 active menus with different products
3. **Products**: Ensure each menu has 3-5 products with different prices
4. **Daily Sales Targets**: Set targets for today and recent dates
5. **Product Sales Targets**: Set individual product targets
6. **Sales Records**: Create some test sales records for analysis

## Common Issues & Solutions

### Charts Not Displaying
- Check if Recharts is properly installed
- Verify chart data format matches expected interface
- Ensure theme context is available

### Form Validation Errors
- Verify zod schema matches form fields
- Check react-hook-form integration
- Ensure all required fields are properly marked

### Data Not Loading
- Check database connection
- Verify service method implementations
- Look for console errors in browser dev tools

### Performance Issues
- Check for unnecessary re-renders
- Verify useEffect dependencies
- Consider memoization for expensive calculations

## Success Criteria

The Operations feature is considered fully functional when:
- ✅ All sales recording workflows complete successfully
- ✅ Target analysis shows accurate real-time data
- ✅ Charts display correctly with proper data
- ✅ Projections calculate accurately
- ✅ All components are responsive and accessible
- ✅ Integration with existing systems works seamlessly
- ✅ Performance meets acceptable standards
- ✅ Error handling provides good user experience

## Next Steps

After successful testing:
1. Document any bugs found and create issues
2. Gather user feedback on UX/UI
3. Consider additional features based on usage patterns
4. Plan for future enhancements (export functionality, advanced analytics, etc.)
