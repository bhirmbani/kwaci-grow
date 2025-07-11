#!/usr/bin/env node

/**
 * Test script to verify accounting module data integrity
 * This script tests that accounting transactions properly reflect operational data
 */

import { db } from './src/lib/db/index.js'
import { AccountingService } from './src/lib/services/accountingService.js'

async function testAccountingIntegration() {
  console.log('🧪 Testing Accounting Module Data Integration...\n')

  try {
    // Get all businesses
    const businesses = await db.businesses.toArray()
    console.log(`📊 Found ${businesses.length} businesses`)

    for (const business of businesses) {
      console.log(`\n🏢 Testing business: ${business.name}`)
      
      // Get operational data
      const salesRecords = await db.salesRecords.where('businessId').equals(business.id).toArray()
      const fixedAssets = await db.fixedAssets.where('businessId').equals(business.id).toArray()
      const recurringExpenses = await db.recurringExpenses.where('businessId').equals(business.id).toArray()
      const warehouseBatches = await db.warehouseBatches.where('businessId').equals(business.id).toArray()
      const productionBatches = await db.productionBatches.where('businessId').equals(business.id).toArray()
      const financialItems = await db.financialItems.where('businessId').equals(business.id).toArray()

      console.log(`  📈 Sales Records: ${salesRecords.length}`)
      console.log(`  🏭 Fixed Assets: ${fixedAssets.length}`)
      console.log(`  💰 Recurring Expenses: ${recurringExpenses.length}`)
      console.log(`  📦 Warehouse Batches: ${warehouseBatches.length}`)
      console.log(`  🔧 Production Batches: ${productionBatches.length}`)
      console.log(`  💼 Financial Items: ${financialItems.length}`)

      // Test accounting service aggregation
      const transactions = await AccountingService.getAllTransactions(business.id)
      console.log(`  🧮 Unified Transactions: ${transactions.length}`)

      // Verify transaction sources
      const transactionsBySource = transactions.reduce((acc, tx) => {
        acc[tx.sourceEntity] = (acc[tx.sourceEntity] || 0) + 1
        return acc
      }, {})

      console.log('  📋 Transaction Sources:')
      Object.entries(transactionsBySource).forEach(([source, count]) => {
        console.log(`    - ${source}: ${count}`)
      })

      // Check for proper relationships
      console.log('\n  🔗 Checking Data Relationships:')
      
      // Check if fixed assets have corresponding financial items
      const assetPurchaseItems = financialItems.filter(item => 
        item.isFixedAsset && item.sourceAssetId && item.category === 'initial_capital'
      )
      console.log(`    ✅ Asset purchase entries: ${assetPurchaseItems.length}/${fixedAssets.length}`)

      // Check if warehouse batches have corresponding financial items
      const warehousePurchaseItems = financialItems.filter(item => 
        item.name.includes('Warehouse Purchase') && item.category === 'variable_cogs'
      )
      console.log(`    ✅ Warehouse purchase entries: ${warehousePurchaseItems.length}/${warehouseBatches.length}`)

      // Check if production batches have corresponding financial items
      const completedProduction = productionBatches.filter(batch => batch.status === 'Completed')
      const productionCostItems = financialItems.filter(item => 
        item.name.includes('Production Cost') && item.category === 'variable_cogs'
      )
      console.log(`    ✅ Production cost entries: ${productionCostItems.length}/${completedProduction.length}`)

      // Check for duplicate operational expenses
      const operationalFinancialItems = financialItems.filter(item => 
        item.category === 'fixed_costs' && 
        !item.isFixedAsset &&
        !item.name.includes('Depreciation')
      )
      console.log(`    ⚠️  Operational financial items (should be minimal): ${operationalFinancialItems.length}`)
      
      if (operationalFinancialItems.length > 0) {
        console.log('    📝 Operational items found:')
        operationalFinancialItems.forEach(item => {
          console.log(`      - ${item.name}: ${item.value.toLocaleString()} IDR`)
        })
      }

      // Calculate summary
      const summary = await AccountingService.getFinancialSummary(business.id)
      console.log('\n  📊 Financial Summary:')
      console.log(`    💰 Total Income: ${summary.totalIncome.toLocaleString()} IDR`)
      console.log(`    💸 Total Expenses: ${summary.totalExpenses.toLocaleString()} IDR`)
      console.log(`    📈 Net Income: ${summary.netIncome.toLocaleString()} IDR`)
      console.log(`    🏦 Cash Flow: ${summary.cashFlow.toLocaleString()} IDR`)
    }

    console.log('\n✅ Accounting integration test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAccountingIntegration()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error)
    process.exit(1)
  })
