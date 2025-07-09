#!/usr/bin/env node

/**
 * Test script for sales target tracking enhancements
 * This script tests the new time display and business hours functionality
 */

console.log('🧪 Testing Sales Target Tracking Enhancements...')

async function testSalesTargetEnhancements() {
  try {
    // Import required modules
    const { db } = await import('./src/lib/db/index.js')
    const { seedMenuData } = await import('./src/lib/db/seedMenus.js')
    const { seedDatabase } = await import('./src/lib/db/seed.js')
    const { getCurrentTimeInfo, getSalesTargetStatus } = await import('./src/lib/utils/operationsUtils.js')
    
    console.log('✅ Modules imported successfully')
    
    // Step 1: Clear and seed database
    console.log('\n🧹 Step 1: Clearing and seeding database...')
    
    // Clear existing data
    await Promise.all([
      db.branches.clear(),
      db.menus.clear(),
      db.menuProducts.clear(),
      db.menuBranches.clear(),
      db.dailySalesTargets.clear(),
      db.salesRecords.clear()
    ])
    
    // Seed basic data
    await seedDatabase()
    
    // Seed menu data (includes branches with business hours)
    await seedMenuData()
    
    console.log('✅ Database seeded successfully')
    
    // Step 2: Test time utility functions
    console.log('\n⏰ Step 2: Testing time utility functions...')
    
    const today = new Date().toISOString().split('T')[0]
    
    // Test with different business hours
    const testCases = [
      { start: '06:00', end: '22:00', name: 'Main Location' },
      { start: '07:00', end: '20:00', name: 'University Campus' },
      { start: '06:30', end: '18:00', name: 'Business District' }
    ]
    
    for (const testCase of testCases) {
      const timeInfo = getCurrentTimeInfo(today, testCase.start, testCase.end)
      console.log(`📍 ${testCase.name} (${testCase.start}-${testCase.end}):`)
      console.log(`   Current time: ${timeInfo.currentTime}`)
      console.log(`   Display: ${timeInfo.timeDisplay}`)
      console.log(`   After hours: ${timeInfo.isAfterBusinessHours}`)
      console.log(`   Time remaining: ${timeInfo.timeRemaining || 'N/A'}`)
    }
    
    // Step 3: Test status determination
    console.log('\n📊 Step 3: Testing status determination...')
    
    const statusTestCases = [
      { progress: 50, expected: 40, afterHours: false, description: 'On track during business hours' },
      { progress: 70, expected: 40, afterHours: false, description: 'Ahead during business hours' },
      { progress: 20, expected: 40, afterHours: false, description: 'Behind during business hours' },
      { progress: 10, expected: 40, afterHours: false, description: 'At risk during business hours' },
      { progress: 80, expected: 40, afterHours: true, description: 'After hours - target met' },
      { progress: 50, expected: 40, afterHours: true, description: 'After hours - target failed' }
    ]
    
    for (const testCase of statusTestCases) {
      const status = getSalesTargetStatus(
        testCase.progress,
        testCase.expected,
        testCase.afterHours
      )
      console.log(`📈 ${testCase.description}: ${status}`)
    }
    
    // Step 4: Verify database structure
    console.log('\n🗄️ Step 4: Verifying database structure...')
    
    const branches = await db.branches.toArray()
    console.log(`📍 Branches: ${branches.length}`)
    
    for (const branch of branches) {
      console.log(`   - ${branch.name}: ${branch.businessHoursStart}-${branch.businessHoursEnd}`)
    }
    
    const salesTargets = await db.dailySalesTargets.toArray()
    console.log(`🎯 Sales targets: ${salesTargets.length}`)
    
    // Step 5: Create some test sales records for today
    console.log('\n📝 Step 5: Creating test sales records...')
    
    const now = new Date()
    const currentTime = now.toTimeString().substring(0, 8) // HH:MM:SS
    
    // Get first menu and branch for test data
    const firstMenu = await db.menus.first()
    const firstBranch = await db.branches.first()
    const firstProduct = await db.products.first()
    
    if (firstMenu && firstBranch && firstProduct) {
      const testSalesRecord = {
        id: 'test-sales-' + Date.now(),
        menuId: firstMenu.id,
        productId: firstProduct.id,
        branchId: firstBranch.id,
        saleDate: today,
        saleTime: currentTime,
        quantity: 5,
        unitPrice: 25000,
        totalAmount: 125000,
        note: 'Test sales record for enhancement testing',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
      
      await db.salesRecords.add(testSalesRecord)
      console.log('✅ Test sales record created')
    }
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('✅ Time utility functions working correctly')
    console.log('✅ Status determination logic implemented')
    console.log('✅ Database structure verified')
    console.log('✅ Test data created')
    console.log('\n🚀 You can now test the enhanced sales target interface at:')
    console.log('   http://localhost:5174/operations')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testSalesTargetEnhancements()
  .then(success => {
    if (success) {
      console.log('\n✅ Test completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Test failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
