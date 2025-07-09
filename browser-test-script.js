// Browser console test script for sales target enhancements
// Copy and paste this into the browser console at http://localhost:5174

(async () => {
  console.log('🧪 Testing Sales Target Enhancements in Browser...')
  
  try {
    // Import modules
    const { db } = await import('/src/lib/db/index.ts')
    const { seedMenuData } = await import('/src/lib/db/seedMenus.ts')
    const { getCurrentTimeInfo, getSalesTargetStatus } = await import('/src/lib/utils/operationsUtils.ts')
    
    console.log('✅ Modules imported successfully')
    
    // Clear and seed data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      db.branches.clear(),
      db.menus.clear(),
      db.menuProducts.clear(),
      db.menuBranches.clear(),
      db.dailySalesTargets.clear(),
      db.salesRecords.clear()
    ])
    
    console.log('🌱 Seeding menu data...')
    await seedMenuData()
    
    // Test time functions
    console.log('⏰ Testing time functions...')
    const today = new Date().toISOString().split('T')[0]
    
    const timeInfo = getCurrentTimeInfo(today, '06:00', '22:00')
    console.log('Time info:', timeInfo)
    
    // Test status function
    const status = getSalesTargetStatus(50, 40, false)
    console.log('Status test:', status)
    
    // Create test sales record
    console.log('📝 Creating test sales record...')
    const now = new Date()
    const branches = await db.branches.toArray()
    const menus = await db.menus.toArray()
    const products = await db.products.toArray()
    
    if (branches.length > 0 && menus.length > 0 && products.length > 0) {
      const testSalesRecord = {
        id: 'test-sales-' + Date.now(),
        menuId: menus[0].id,
        productId: products[0].id,
        branchId: branches[0].id,
        saleDate: today,
        saleTime: now.toTimeString().substring(0, 8),
        quantity: 3,
        unitPrice: 25000,
        totalAmount: 75000,
        note: 'Test sales record',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
      
      await db.salesRecords.add(testSalesRecord)
      console.log('✅ Test sales record created')
    }
    
    console.log('🎉 Test completed! Navigate to /operations to see the enhanced interface')
    console.log('📊 Database summary:')
    console.log('- Branches:', await db.branches.count())
    console.log('- Menus:', await db.menus.count())
    console.log('- Sales Targets:', await db.dailySalesTargets.count())
    console.log('- Sales Records:', await db.salesRecords.count())
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
})()
