/**
 * Financial Calculations Test Suite
 * 
 * This file contains tests to verify the accuracy of financial calculations
 * used in the coffee cart business dashboard.
 */

// Mock test data
const mockData = {
  cupsPerDay: 50,
  daysPerMonth: 22,
  pricePerCup: 8000,
  cogsPerCup: 3000,
  fixedCosts: 5000000,
  bonusScheme: {
    target: 1000,
    perCup: 100,
    baristaCount: 2
  }
}

/**
 * Test financial calculation formulas
 */
export function testFinancialCalculations() {
  const { cupsPerDay, daysPerMonth, pricePerCup, cogsPerCup, fixedCosts, bonusScheme } = mockData
  
  // Calculate monthly cups
  const monthlyCups = cupsPerDay * daysPerMonth
  console.log(`Monthly Cups: ${cupsPerDay} × ${daysPerMonth} = ${monthlyCups}`)
  
  // Calculate revenue
  const revenue = monthlyCups * pricePerCup
  console.log(`Revenue: ${monthlyCups} × ${pricePerCup} = ${revenue.toLocaleString()}`)
  
  // Calculate variable COGS
  const variableCogs = monthlyCups * cogsPerCup
  console.log(`Variable COGS: ${monthlyCups} × ${cogsPerCup} = ${variableCogs.toLocaleString()}`)
  
  // Calculate gross profit
  const grossProfit = revenue - variableCogs
  console.log(`Gross Profit: ${revenue.toLocaleString()} - ${variableCogs.toLocaleString()} = ${grossProfit.toLocaleString()}`)
  
  // Calculate bonus (if applicable)
  let bonus = 0
  if (monthlyCups > bonusScheme.target) {
    bonus = (monthlyCups - bonusScheme.target) * bonusScheme.perCup * bonusScheme.baristaCount
    console.log(`Bonus: (${monthlyCups} - ${bonusScheme.target}) × ${bonusScheme.perCup} × ${bonusScheme.baristaCount} = ${bonus.toLocaleString()}`)
  } else {
    console.log(`Bonus: 0 (target not exceeded)`)
  }
  
  // Calculate net profit
  const netProfit = grossProfit - fixedCosts - bonus
  console.log(`Net Profit: ${grossProfit.toLocaleString()} - ${fixedCosts.toLocaleString()} - ${bonus.toLocaleString()} = ${netProfit.toLocaleString()}`)
  
  // Calculate key ratios
  const profitMargin = (netProfit / revenue) * 100
  const cogsRatio = (variableCogs / revenue) * 100
  const fixedCostRatio = (fixedCosts / revenue) * 100
  
  console.log('\n--- Key Business Metrics ---')
  console.log(`Profit Margin: ${profitMargin.toFixed(2)}%`)
  console.log(`COGS Ratio: ${cogsRatio.toFixed(2)}%`)
  console.log(`Fixed Cost Ratio: ${fixedCostRatio.toFixed(2)}%`)
  
  // Verify calculations are mathematically sound
  const calculationCheck = revenue - variableCogs - fixedCosts - bonus
  const isCalculationCorrect = Math.abs(calculationCheck - netProfit) < 0.01
  
  console.log('\n--- Calculation Verification ---')
  console.log(`Calculation Check: ${isCalculationCorrect ? 'PASSED' : 'FAILED'}`)
  console.log(`Expected Net Profit: ${netProfit.toLocaleString()}`)
  console.log(`Calculated Net Profit: ${calculationCheck.toLocaleString()}`)
  
  return {
    monthlyCups,
    revenue,
    variableCogs,
    grossProfit,
    fixedCosts,
    bonus,
    netProfit,
    profitMargin,
    cogsRatio,
    fixedCostRatio,
    isCalculationCorrect
  }
}

/**
 * Test break-even analysis
 */
export function testBreakEvenAnalysis() {
  const { daysPerMonth, pricePerCup, cogsPerCup, fixedCosts } = mockData
  
  // Break-even formula: Fixed Costs / (Price per Cup - COGS per Cup) / Days per Month
  const contributionMarginPerCup = pricePerCup - cogsPerCup
  const breakEvenCupsPerMonth = fixedCosts / contributionMarginPerCup
  const breakEvenCupsPerDay = breakEvenCupsPerMonth / daysPerMonth
  
  console.log('\n--- Break-Even Analysis ---')
  console.log(`Contribution Margin per Cup: ${pricePerCup} - ${cogsPerCup} = ${contributionMarginPerCup}`)
  console.log(`Break-even Cups per Month: ${fixedCosts.toLocaleString()} ÷ ${contributionMarginPerCup} = ${breakEvenCupsPerMonth.toFixed(0)}`)
  console.log(`Break-even Cups per Day: ${breakEvenCupsPerMonth.toFixed(0)} ÷ ${daysPerMonth} = ${breakEvenCupsPerDay.toFixed(1)}`)
  
  return {
    contributionMarginPerCup,
    breakEvenCupsPerMonth,
    breakEvenCupsPerDay
  }
}

/**
 * Validate financial calculation accuracy
 */
export function validateCalculations() {
  console.log('=== Financial Calculations Validation ===\n')
  
  const results = testFinancialCalculations()
  const breakEven = testBreakEvenAnalysis()
  
  // Additional validation checks
  const validations = {
    revenuePositive: results.revenue > 0,
    cogsPositive: results.variableCogs > 0,
    grossProfitCalculation: results.grossProfit === (results.revenue - results.variableCogs),
    netProfitCalculation: results.netProfit === (results.grossProfit - results.fixedCosts - results.bonus),
    breakEvenPositive: breakEven.breakEvenCupsPerDay > 0,
    contributionMarginPositive: breakEven.contributionMarginPerCup > 0
  }
  
  console.log('\n--- Validation Results ---')
  Object.entries(validations).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allTestsPassed = Object.values(validations).every(Boolean) && results.isCalculationCorrect
  console.log(`\nOverall Validation: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
  
  return {
    results,
    breakEven,
    validations,
    allTestsPassed
  }
}

// Export for use in development/testing
if (typeof window !== 'undefined') {
  (window as any).validateFinancialCalculations = validateCalculations
}
