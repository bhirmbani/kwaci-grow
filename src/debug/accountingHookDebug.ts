/**
 * Debug script to test the exact same flow as useAccounting hook
 */

import { AccountingService } from '@/lib/services/accountingService'
import { useBusinessStore } from '@/lib/stores/businessStore'

export async function debugAccountingHook() {
  console.log('=== ACCOUNTING HOOK DEBUG ===')
  
  try {
    // Get the business store state (same as useCurrentBusinessId hook)
    const businessStore = useBusinessStore.getState()
    const currentBusinessId = businessStore.getCurrentBusinessId()
    
    console.log(`\n1. HOOK SIMULATION:`)
    console.log(`   currentBusinessId from store: ${currentBusinessId}`)
    console.log(`   currentBusiness exists: ${businessStore.currentBusiness ? 'Yes' : 'No'}`)
    
    if (!currentBusinessId) {
      console.log('   ❌ No business ID - this would cause useAccounting to show empty state')
      return
    }
    
    // Test the exact same call that useAccounting makes
    console.log(`\n2. TESTING ACCOUNTING SERVICE CALLS:`)
    
    // Test fetchTransactions (line 107 in useAccounting)
    console.log('   Testing fetchTransactions...')
    try {
      const transactions = await AccountingService.getAllTransactions(currentBusinessId, undefined)
      console.log(`   ✅ fetchTransactions: ${transactions.length} transactions`)
      
      if (transactions.length > 0) {
        console.log(`   Sample transaction: ${transactions[0].description} - ${transactions[0].amount} IDR`)
      }
    } catch (error) {
      console.log(`   ❌ fetchTransactions failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Test fetchFinancialSummary (line 396 in useAccounting)
    console.log('   Testing fetchFinancialSummary...')
    try {
      const summary = await AccountingService.getFinancialSummary(currentBusinessId, undefined)
      console.log(`   ✅ fetchFinancialSummary: ${summary.totalIncome} IDR income, ${summary.totalExpenses} IDR expenses`)
    } catch (error) {
      console.log(`   ❌ fetchFinancialSummary failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Test without businessId (what happens if context fails)
    console.log(`\n3. TESTING WITHOUT BUSINESS ID:`)
    try {
      const contextTransactions = await AccountingService.getAllTransactions()
      console.log(`   ✅ Context call: ${contextTransactions.length} transactions`)
    } catch (error) {
      console.log(`   ❌ Context call failed: ${error instanceof Error ? error.message : String(error)}`)
      console.log('   This suggests business context is not working properly')
    }
    
    // Test business context directly
    console.log(`\n4. BUSINESS CONTEXT TEST:`)
    const { getCurrentBusinessId, requireBusinessId } = await import('@/lib/services/businessContext')
    
    const contextId = getCurrentBusinessId()
    console.log(`   getCurrentBusinessId(): ${contextId}`)
    
    try {
      const requiredId = requireBusinessId()
      console.log(`   requireBusinessId(): ${requiredId}`)
    } catch (error) {
      console.log(`   ❌ requireBusinessId() failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Check if there's a mismatch
    if (currentBusinessId !== contextId) {
      console.log(`   ❌ MISMATCH: Store has ${currentBusinessId}, context has ${contextId}`)
      console.log('   This explains why AccountingService calls fail!')
    } else {
      console.log(`   ✅ Store and context match: ${currentBusinessId}`)
    }
    
  } catch (error) {
    console.error('❌ Hook debug failed:', error)
  }
  
  console.log('\n=== END HOOK DEBUG ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  ;(window as typeof window & { debugAccountingHook: typeof debugAccountingHook }).debugAccountingHook = debugAccountingHook
}
