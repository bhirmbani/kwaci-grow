import { v4 as uuidv4 } from 'uuid'
import { db } from './index'
import type { Menu, MenuProduct, Branch, MenuBranch, DailySalesTarget } from './schema'

export async function seedMenuData() {
  console.log('🌱 Seeding menu management data...')

  const now = new Date().toISOString()

  // Create sample branches
  const branches: Branch[] = [
    {
      id: 'branch-main',
      name: 'Main Location',
      location: 'Downtown Coffee Cart - Main Street',
      note: 'Primary location with highest foot traffic',
      isActive: true,
      businessHoursStart: '06:00',
      businessHoursEnd: '22:00',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'branch-university',
      name: 'University Campus',
      location: 'University Campus - Student Center',
      note: 'Located near student center, busy during semester',
      isActive: true,
      businessHoursStart: '07:00',
      businessHoursEnd: '20:00',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'branch-business',
      name: 'Business District',
      location: 'Business District - Office Complex',
      note: 'Serves office workers, busy during weekdays',
      isActive: true,
      businessHoursStart: '06:30',
      businessHoursEnd: '18:00',
      createdAt: now,
      updatedAt: now,
    },
  ]

  // Create sample menus
  const menus: Menu[] = [
    {
      id: 'menu-morning',
      name: 'Morning Coffee Menu',
      description: 'Perfect start to your day with our signature coffee blends and fresh pastries',
      status: 'active',
      note: 'Available from 6 AM to 11 AM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'menu-afternoon',
      name: 'Afternoon Specials',
      description: 'Refreshing drinks and light snacks for your afternoon break',
      status: 'active',
      note: 'Available from 12 PM to 5 PM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'menu-student',
      name: 'Student Budget Menu',
      description: 'Affordable options designed for students with great taste and value',
      status: 'active',
      note: 'Special pricing for university location',
      createdAt: now,
      updatedAt: now,
    },
  ]

  // Get existing products to create menu-product relationships
  const existingProducts = await db.products.toArray()
  
  // Create sample menu products (if products exist)
  const menuProducts: MenuProduct[] = []
  if (existingProducts.length > 0) {
    // Morning menu products
    existingProducts.slice(0, 3).forEach((product, index) => {
      menuProducts.push({
        id: uuidv4(),
        menuId: 'menu-morning',
        productId: product.id,
        price: 25000 + (index * 5000), // 25k, 30k, 35k
        category: 'Coffee',
        displayOrder: index + 1,
        note: 'Morning special pricing',
        createdAt: now,
        updatedAt: now,
      })
    })

    // Afternoon menu products
    existingProducts.slice(0, 2).forEach((product, index) => {
      menuProducts.push({
        id: uuidv4(),
        menuId: 'menu-afternoon',
        productId: product.id,
        price: 30000 + (index * 5000), // 30k, 35k
        category: 'Coffee',
        displayOrder: index + 1,
        note: 'Afternoon pricing',
        createdAt: now,
        updatedAt: now,
      })
    })

    // Student menu products (discounted)
    existingProducts.slice(0, 2).forEach((product, index) => {
      menuProducts.push({
        id: uuidv4(),
        menuId: 'menu-student',
        productId: product.id,
        price: 20000 + (index * 3000), // 20k, 23k (student discount)
        category: 'Coffee',
        displayOrder: index + 1,
        note: 'Student discount applied',
        createdAt: now,
        updatedAt: now,
      })
    })
  }

  // Create menu-branch assignments
  const menuBranches: MenuBranch[] = [
    // Morning menu at all locations
    {
      id: uuidv4(),
      menuId: 'menu-morning',
      branchId: 'branch-main',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      menuId: 'menu-morning',
      branchId: 'branch-university',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      menuId: 'menu-morning',
      branchId: 'branch-business',
      createdAt: now,
      updatedAt: now,
    },
    // Afternoon menu at main and business locations
    {
      id: uuidv4(),
      menuId: 'menu-afternoon',
      branchId: 'branch-main',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      menuId: 'menu-afternoon',
      branchId: 'branch-business',
      createdAt: now,
      updatedAt: now,
    },
    // Student menu only at university
    {
      id: uuidv4(),
      menuId: 'menu-student',
      branchId: 'branch-university',
      createdAt: now,
      updatedAt: now,
    },
  ]

  // Create sample sales targets
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const salesTargets: DailySalesTarget[] = [
    // Main location targets
    {
      id: uuidv4(),
      menuId: 'menu-morning',
      branchId: 'branch-main',
      targetDate: today.toISOString().split('T')[0],
      targetAmount: 500000, // 500k IDR
      note: 'Peak morning hours target',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      menuId: 'menu-afternoon',
      branchId: 'branch-main',
      targetDate: today.toISOString().split('T')[0],
      targetAmount: 300000, // 300k IDR
      note: 'Afternoon sales target',
      createdAt: now,
      updatedAt: now,
    },
    // University location targets
    {
      id: uuidv4(),
      menuId: 'menu-morning',
      branchId: 'branch-university',
      targetDate: today.toISOString().split('T')[0],
      targetAmount: 250000, // 250k IDR
      note: 'University morning target',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      menuId: 'menu-student',
      branchId: 'branch-university',
      targetDate: today.toISOString().split('T')[0],
      targetAmount: 200000, // 200k IDR
      note: 'Student menu daily target',
      createdAt: now,
      updatedAt: now,
    },
  ]

  try {
    // Clear existing menu data
    await db.transaction('rw', [db.branches, db.menus, db.menuProducts, db.menuBranches, db.dailySalesTargets], async () => {
      await db.branches.clear()
      await db.menus.clear()
      await db.menuProducts.clear()
      await db.menuBranches.clear()
      await db.dailySalesTargets.clear()

      // Add new data
      await db.branches.bulkAdd(branches)
      await db.menus.bulkAdd(menus)
      
      if (menuProducts.length > 0) {
        await db.menuProducts.bulkAdd(menuProducts)
      }
      
      await db.menuBranches.bulkAdd(menuBranches)
      await db.dailySalesTargets.bulkAdd(salesTargets)
    })

    console.log(`✅ Menu data seeded successfully:`)
    console.log(`   - ${branches.length} branches`)
    console.log(`   - ${menus.length} menus`)
    console.log(`   - ${menuProducts.length} menu products`)
    console.log(`   - ${menuBranches.length} menu-branch assignments`)
    console.log(`   - ${salesTargets.length} sales targets`)

  } catch (error) {
    console.error('❌ Failed to seed menu data:', error)
    throw error
  }
}

// Function to test menu management functionality
export async function testMenuManagement() {
  console.log('🧪 Testing menu management functionality...')

  try {
    // Test menu operations
    const menus = await db.menus.toArray()
    console.log(`📋 Found ${menus.length} menus`)

    // Test branch operations
    const branches = await db.branches.toArray()
    console.log(`🏢 Found ${branches.length} branches`)

    // Test menu-product relationships
    const menuProducts = await db.menuProducts.toArray()
    console.log(`🔗 Found ${menuProducts.length} menu-product relationships`)

    // Test menu-branch assignments
    const menuBranches = await db.menuBranches.toArray()
    console.log(`📍 Found ${menuBranches.length} menu-branch assignments`)

    // Test sales targets
    const salesTargets = await db.dailySalesTargets.toArray()
    console.log(`🎯 Found ${salesTargets.length} sales targets`)

    console.log('✅ Menu management test completed successfully!')
    return true

  } catch (error) {
    console.error('❌ Menu management test failed:', error)
    return false
  }
}
