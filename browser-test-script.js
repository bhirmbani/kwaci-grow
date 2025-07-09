// Browser console test script for Sales Target Consolidation
// Copy and paste this into the browser console at http://localhost:5174

(async () => {
  console.log('🧪 Testing Sales Target Consolidation & Daily Progress Fix...')

  try {
    // Import modules
    const { db } = await import('/src/lib/db/index.ts')
    const { seedMenuData } = await import('/src/lib/db/seedMenus.ts')
    const { DailyProductSalesTargetService } = await import('/src/lib/services/dailyProductSalesTargetService.ts')

    console.log('✅ Modules imported successfully')

    // Clear and seed data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      db.branches.clear(),
      db.menus.clear(),
      db.menuProducts.clear(),
      db.menuBranches.clear(),
      db.dailySalesTargets.clear(),
      db.dailyProductSalesTargets.clear(),
      db.salesRecords.clear()
    ])

    console.log('🌱 Seeding menu data (includes both legacy and new targets)...')
    await seedMenuData()

    // Test the new service methods
    console.log('🔧 Testing new service methods...')
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Test getAllTargetsForDate
    const todayProductTargets = await DailyProductSalesTargetService.getAllTargetsForDate(today)
    console.log(`📊 Product targets for today: ${todayProductTargets.length}`)

    // Test getMenuTargetSummariesForDate
    const todayMenuSummaries = await DailyProductSalesTargetService.getMenuTargetSummariesForDate(today)
    console.log(`📊 Menu summaries for today: ${todayMenuSummaries.length}`)

    if (todayMenuSummaries.length > 0) {
      console.log('📋 Today\'s menu target summary:')
      todayMenuSummaries.forEach(summary => {
        console.log(`   - ${summary.menu.name} (${summary.branch.name}): ${summary.targetAmount.toLocaleString()} IDR`)
      })
    }

    // Create test sales records for today and yesterday
    console.log('📝 Creating test sales records...')
    const now = new Date()
    const branches = await db.branches.toArray()
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()

    if (branches.length > 0 && menus.length > 0 && products.length > 0) {
      const testRecords = [
        // Today's sales records
        {
          id: 'test-today-1',
          menuId: menus[0].id,
          productId: products[0].id,
          branchId: branches[0].id,
          saleDate: today,
          saleTime: '08:30:00',
          quantity: 5,
          unitPrice: 25000,
          totalAmount: 125000,
          note: 'Morning sales',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 'test-today-2',
          menuId: menus[0].id,
          productId: products[0].id,
          branchId: branches[0].id,
          saleDate: today,
          saleTime: '14:15:00',
          quantity: 3,
          unitPrice: 30000,
          totalAmount: 90000,
          note: 'Afternoon sales',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        // Yesterday's sales records
        {
          id: 'test-yesterday-1',
          menuId: menus[0].id,
          productId: products[0].id,
          branchId: branches[0].id,
          saleDate: yesterdayStr,
          saleTime: '09:00:00',
          quantity: 8,
          unitPrice: 25000,
          totalAmount: 200000,
          note: 'Yesterday morning sales',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 'test-yesterday-2',
          menuId: menus[0].id,
          productId: products[0].id,
          branchId: branches[0].id,
          saleDate: yesterdayStr,
          saleTime: '15:30:00',
          quantity: 4,
          unitPrice: 30000,
          totalAmount: 120000,
          note: 'Yesterday afternoon sales',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ]

      await db.salesRecords.bulkAdd(testRecords)
      console.log('✅ Test sales records created for today and yesterday')
    }

    // Verify both target systems
    const legacyTargets = await db.dailySalesTargets.toArray()
    const productTargets = await db.dailyProductSalesTargets.toArray()

    console.log('🎉 Test completed successfully!')
    console.log('📊 Database summary:')
    console.log('- Branches:', await db.branches.count())
    console.log('- Menus:', await db.menus.count())
    console.log('- Products:', await db.products.count())
    console.log('- Sales Records:', await db.salesRecords.count())
    console.log('- Legacy Menu Targets:', legacyTargets.length)
    console.log('- Product-Level Targets:', productTargets.length)

    console.log('\n🚀 Testing Instructions:')
    console.log('1. Navigate to /menus - Sales Targets tab should be REMOVED')
    console.log('2. Navigate to /sales-targets - Should show product-level target management')
    console.log('3. Navigate to /operations → Analytics → Daily Progress:')
    console.log(`   - Today (${today}): Should show progress chart using product targets`)
    console.log(`   - Yesterday (${yesterdayStr}): Should show progress chart`)
    console.log('   - Other dates: Should show "No sales targets found"')
    console.log('4. Navigate to /operations → Target vs Actual: Should work with product targets')

    console.log('\n✅ Consolidation Summary:')
    console.log('- ❌ Removed: Sales Targets tab from /menus route')
    console.log('- ✅ Kept: Dedicated /sales-targets route for product-level targets')
    console.log('- ✅ Updated: Daily Progress to use product-level targets')
    console.log('- ✅ Updated: Target vs Actual to use product-level targets')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
})()
