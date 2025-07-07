// Test script for menu management functionality
import { seedMenuData, testMenuManagement } from './src/lib/db/seedMenus.ts'
import { ensureDatabaseInitialized } from './src/lib/db/init.ts'

async function runMenuTest() {
  console.log('🚀 Starting menu management test...')
  
  try {
    // Initialize database
    await ensureDatabaseInitialized()
    console.log('✅ Database initialized')

    // Seed menu data
    await seedMenuData()
    console.log('✅ Menu data seeded')

    // Test functionality
    const testResult = await testMenuManagement()
    
    if (testResult) {
      console.log('🎉 Menu management test completed successfully!')
      console.log('\n📝 Test Summary:')
      console.log('   ✅ Database schema created')
      console.log('   ✅ Sample data seeded')
      console.log('   ✅ Menu CRUD operations working')
      console.log('   ✅ Branch management working')
      console.log('   ✅ Menu-product relationships working')
      console.log('   ✅ Branch assignments working')
      console.log('   ✅ Sales targets working')
      console.log('\n🌐 Open http://localhost:5173/menus to test the UI')
    } else {
      console.log('❌ Menu management test failed')
      process.exit(1)
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error)
    process.exit(1)
  }
}

// Run the test
runMenuTest()
