/**
 * Debug script to investigate accounting data state
 */

import { db } from '@/lib/db'
import { AccountingService } from '@/lib/services/accountingService'
import { FinancialItemsService } from '@/lib/services/financialItemsService'
import { SalesRecordService } from '@/lib/services/salesRecordService'
import { RecurringExpensesService } from '@/lib/services/recurringExpensesService'
import { FixedAssetService } from '@/lib/services/fixedAssetService'
import { useBusinessStore } from '@/lib/stores/businessStore'

export async function debugAccountingData() {
  console.log('=== ACCOUNTING DEBUG REPORT ===')

  try {
    // Check if we have any businesses
    const businesses = await db.businesses.toArray()
    console.log(`\n1. BUSINESSES (${businesses.length} found):`)
    businesses.forEach(business => {
      console.log(`   - ${business.name} (ID: ${business.id})`)
    })

    if (businesses.length === 0) {
      console.log('   ❌ No businesses found! This explains the empty accounting state.')
      return
    }

    // Check business store state
    const businessStore = useBusinessStore.getState()
    console.log(`\n2. BUSINESS STORE STATE:`)
    console.log(`   Current Business: ${businessStore.currentBusiness?.name || 'None'}`)
    console.log(`   Is Initialized: ${businessStore.isInitialized}`)
    console.log(`   Available Businesses: ${businessStore.businesses.length}`)

    // Auto-initialize business store if needed
    if (!businessStore.isInitialized) {
      console.log(`   🔄 Initializing business store...`)
      await businessStore.initializeStore()
      const updatedStore = useBusinessStore.getState()
      console.log(`   ✅ Store initialized. Current business: ${updatedStore.currentBusiness?.name || 'None'}`)
    }
    
    // Use the current business or first business for testing
    const testBusinessId = businessStore.currentBusiness?.id || businesses[0].id
    const testBusiness = businessStore.currentBusiness || businesses[0]
    console.log(`\n3. TESTING WITH BUSINESS: ${testBusiness.name} (${testBusinessId})`)

    // Check each data source individually
    console.log('\n4. DATA SOURCE ANALYSIS:')

    // Financial Items
    const financialItems = await FinancialItemsService.getAll(testBusinessId)
    console.log(`   Financial Items: ${financialItems.length} found`)
    financialItems.forEach(item => {
      console.log(`     - ${item.name}: ${item.value} IDR (${item.category})`)
    })

    // Sales Records
    const salesRecords = await SalesRecordService.getRecordsByBusiness(testBusinessId)
    console.log(`   Sales Records: ${salesRecords.length} found`)
    salesRecords.slice(0, 3).forEach(record => {
      console.log(`     - ${record.saleDate} ${record.saleTime}: ${record.totalAmount} IDR`)
    })

    // Recurring Expenses
    const recurringExpenses = await RecurringExpensesService.getAll(testBusinessId)
    console.log(`   Recurring Expenses: ${recurringExpenses.length} found`)
    recurringExpenses.slice(0, 3).forEach(expense => {
      console.log(`     - ${expense.name}: ${expense.amount} IDR (${expense.frequency})`)
    })

    // Fixed Assets
    const fixedAssets = await FixedAssetService.getAll(testBusinessId)
    console.log(`   Fixed Assets: ${fixedAssets.length} found`)
    fixedAssets.slice(0, 3).forEach(asset => {
      console.log(`     - ${asset.name}: ${asset.purchaseCost} IDR`)
    })

    // Test unified transactions
    console.log('\n5. UNIFIED TRANSACTIONS TEST:')
    const unifiedTransactions = await AccountingService.getAllTransactions(testBusinessId)
    console.log(`   Total Unified Transactions: ${unifiedTransactions.length}`)
    
    if (unifiedTransactions.length === 0) {
      console.log('   ❌ No unified transactions found!')
      console.log('   This suggests an issue with the conversion logic in AccountingService')
    } else {
      console.log('   ✅ Unified transactions found:')
      unifiedTransactions.slice(0, 5).forEach(transaction => {
        console.log(`     - ${transaction.date}: ${transaction.description} (${transaction.type}) - ${transaction.amount} IDR`)
      })
    }
    
    // Test financial summary
    console.log('\n6. FINANCIAL SUMMARY TEST:')
    const summary = await AccountingService.getFinancialSummary(testBusinessId)
    console.log(`   Total Income: ${summary.totalIncome} IDR`)
    console.log(`   Total Expenses: ${summary.totalExpenses} IDR`)
    console.log(`   Net Income: ${summary.netIncome} IDR`)
    console.log(`   Transaction Counts:`, summary.transactionCounts)

    // Check for business context issues
    console.log('\n7. BUSINESS CONTEXT CHECK:')
    const localStorageBusinessId = localStorage.getItem('currentBusinessId')
    console.log(`   localStorage currentBusinessId: ${localStorageBusinessId}`)
    console.log(`   Zustand store currentBusinessId: ${businessStore.currentBusiness?.id || 'null'}`)

    // Import and test the business context provider
    const { getCurrentBusinessId } = await import('@/lib/services/businessContext')
    const contextBusinessId = getCurrentBusinessId()
    console.log(`   businessContext.getCurrentBusinessId(): ${contextBusinessId}`)

    // Test if AccountingService can get business ID
    try {
      const { requireBusinessId } = await import('@/lib/services/businessContext')
      const requiredBusinessId = requireBusinessId()
      console.log(`   businessContext.requireBusinessId(): ${requiredBusinessId}`)
    } catch (error) {
      console.log(`   ❌ businessContext.requireBusinessId() failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (!businessStore.currentBusiness) {
      console.log('   ❌ No business selected in Zustand store!')
      console.log('   This could cause the accounting page to show empty state')
      console.log('   💡 Try selecting a business from the sidebar dropdown')
    } else if (businessStore.currentBusiness.id !== testBusinessId) {
      console.log(`   ⚠️  Selected business (${businessStore.currentBusiness.id}) differs from test business (${testBusinessId})`)
    } else if (!contextBusinessId) {
      console.log('   ❌ Business context provider not working!')
      console.log('   Zustand has business but businessContext.getCurrentBusinessId() returns null')
      console.log('   This explains why AccountingService shows empty data')
    } else {
      console.log('   ✅ Business context looks correct')
    }

    // Test the actual hooks used by AccountingDashboard
    console.log('\n8. ACCOUNTING DASHBOARD HOOKS TEST:')

    // Simulate what AccountingDashboard does
    console.log('   Testing hooks that AccountingDashboard uses...')
    console.log(`   useCurrentBusiness(): ${businessStore.currentBusiness ? 'Business object exists' : 'null'}`)
    console.log(`   useCurrentBusinessId(): ${businessStore.getCurrentBusinessId() || 'null'}`)

    // Test AccountingService directly with the business ID
    console.log('\n9. DIRECT ACCOUNTING SERVICE TEST:')
    try {
      const directTransactions = await AccountingService.getAllTransactions(testBusinessId)
      console.log(`   Direct call with businessId: ${directTransactions.length} transactions`)

      const contextTransactions = await AccountingService.getAllTransactions()
      console.log(`   Call without businessId (uses context): ${contextTransactions.length} transactions`)

      if (directTransactions.length !== contextTransactions.length) {
        console.log('   ❌ Mismatch between direct call and context call!')
        console.log('   This suggests the business context is not working in AccountingService')
      }
    } catch (error) {
      console.log(`   ❌ AccountingService call failed: ${error instanceof Error ? error.message : String(error)}`)
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }

  console.log('\n=== END DEBUG REPORT ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  ;(window as typeof window & { debugAccountingData: typeof debugAccountingData }).debugAccountingData = debugAccountingData
}
