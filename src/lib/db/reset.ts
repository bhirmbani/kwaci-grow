import { db } from './index'

/**
 * EMERGENCY DATABASE RESET - Run this in browser console:
 *
 * // Copy and paste this into browser console:
 * (async () => {
 *   const { resetDatabase } = await import('/src/lib/db/reset.ts');
 *   await resetDatabase();
 *   console.log('Database reset complete! Refresh the page.');
 * })();
 */

/**
 * Completely reset the database by deleting it and recreating it
 */
export async function resetDatabase(): Promise<void> {
  try {
    console.log('🔄 Starting complete database reset...')
    
    // Close the current database connection
    db.close()
    
    // Delete the entire database
    await db.delete()
    console.log('✅ Database deleted successfully')
    
    // Wait a moment for the deletion to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Reopen the database (this will trigger all migrations from scratch)
    await db.open()
    console.log('✅ Database recreated and opened successfully')
    
    console.log('🎉 Database reset complete!')
    
  } catch (error) {
    console.error('❌ Error during database reset:', error)
    throw error
  }
}

/**
 * Check if database needs reset due to corruption
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Try to perform a simple operation
    await db.products.count()
    await db.ingredients.count()
    return true
  } catch (error) {
    console.warn('Database health check failed:', error)
    return false
  }
}

/**
 * Reset database if it's corrupted
 */
export async function resetIfCorrupted(): Promise<boolean> {
  const isHealthy = await checkDatabaseHealth()
  if (!isHealthy) {
    console.log('Database corruption detected, performing reset...')
    await resetDatabase()
    return true
  }
  return false
}

/**
 * Get database information for debugging
 */
export async function getDatabaseInfo(): Promise<any> {
  try {
    const info = {
      isOpen: db.isOpen(),
      name: db.name,
      version: db.verno,
      tables: db.tables.map(table => ({
        name: table.name,
        schema: table.schema
      }))
    }

    // Try to get table counts
    if (db.isOpen()) {
      const counts = {}
      for (const table of db.tables) {
        try {
          counts[table.name] = await table.count()
        } catch (error) {
          counts[table.name] = `Error: ${error.message}`
        }
      }
      info['tableCounts'] = counts
    }

    return info
  } catch (error) {
    return { error: error.message }
  }
}
