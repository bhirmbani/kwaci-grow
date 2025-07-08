<script lang="ts">
  import { onMount } from 'svelte'
  import { db } from '@/lib/db'
  import { Button } from '@/lib/components/ui/button'
  import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'

  let debugInfo = $state('')
  let templates = $state([])
  let queryResult = $state('')
  let isLoading = $state(false)

  async function debugTemplates() {
    isLoading = true
    debugInfo = ''
    queryResult = ''
    
    try {
      debugInfo += '🔍 Opening database...\n'
      
      debugInfo += '📊 Getting all templates...\n'
      const allTemplates = await db.planTemplates.toArray()
      templates = allTemplates
      
      debugInfo += `Found ${allTemplates.length} templates:\n\n`
      
      allTemplates.forEach((template, index) => {
        debugInfo += `--- Template ${index + 1} ---\n`
        debugInfo += `ID: ${template.id}\n`
        debugInfo += `Name: ${template.name}\n`
        debugInfo += `isDefault: ${template.isDefault} (type: ${typeof template.isDefault})\n`
        debugInfo += `Type: ${template.type}\n`
        debugInfo += `Category: ${template.category}\n`
        
        // Check for any null/undefined fields
        Object.keys(template).forEach(key => {
          if (template[key] === null || template[key] === undefined) {
            debugInfo += `⚠️ NULL/UNDEFINED field: ${key}\n`
          }
        })
        debugInfo += '\n'
      })
      
      // Try the problematic query
      debugInfo += '🔄 Testing problematic query...\n'
      try {
        const defaultTemplates = await db.planTemplates
          .where('isDefault')
          .equals(true)
          .toArray()
        queryResult = `✅ Query succeeded! Found: ${defaultTemplates.length} templates`
        debugInfo += queryResult + '\n'
      } catch (error) {
        queryResult = `❌ Query failed: ${error.message}`
        debugInfo += queryResult + '\n'
        debugInfo += `Error details: ${JSON.stringify(error, null, 2)}\n`
      }
      
    } catch (error) {
      debugInfo += `❌ Debug failed: ${error.message}\n`
      debugInfo += `Error details: ${JSON.stringify(error, null, 2)}\n`
    } finally {
      isLoading = false
    }
  }

  async function fixTemplateData() {
    isLoading = true
    debugInfo += '\n🔧 Fixing template data...\n'
    
    try {
      const allTemplates = await db.planTemplates.toArray()
      let fixedCount = 0
      
      for (const template of allTemplates) {
        let needsUpdate = false
        const updates: any = {}
        
        // Fix isDefault field - ensure it's a proper boolean
        if (typeof template.isDefault !== 'boolean') {
          if (template.isDefault === 'true' || template.isDefault === 1) {
            updates.isDefault = true
            needsUpdate = true
          } else if (template.isDefault === 'false' || template.isDefault === 0 || template.isDefault === null || template.isDefault === undefined) {
            updates.isDefault = false
            needsUpdate = true
          }
        }
        
        // Fix any null/undefined required fields
        if (!template.name) {
          updates.name = 'Unnamed Template'
          needsUpdate = true
        }
        
        if (!template.type) {
          updates.type = 'daily'
          needsUpdate = true
        }
        
        if (!template.category) {
          updates.category = 'operations'
          needsUpdate = true
        }
        
        if (needsUpdate) {
          await db.planTemplates.update(template.id, updates)
          fixedCount++
          debugInfo += `Fixed template: ${template.name || template.id}\n`
        }
      }
      
      debugInfo += `✅ Fixed ${fixedCount} templates\n`
      
      // Test the query again
      debugInfo += '\n🔄 Testing query after fix...\n'
      try {
        const defaultTemplates = await db.planTemplates
          .where('isDefault')
          .equals(true)
          .toArray()
        debugInfo += `✅ Query succeeded! Found: ${defaultTemplates.length} templates\n`
      } catch (error) {
        debugInfo += `❌ Query still failing: ${error.message}\n`
      }
      
    } catch (error) {
      debugInfo += `❌ Fix failed: ${error.message}\n`
    } finally {
      isLoading = false
    }
  }

  onMount(() => {
    debugTemplates()
  })
</script>

<div class="container mx-auto p-6">
  <Card>
    <CardHeader>
      <CardTitle>Plan Templates Debug</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex gap-2">
        <Button onclick={debugTemplates} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Debug Templates'}
        </Button>
        <Button onclick={fixTemplateData} disabled={isLoading} variant="secondary">
          Fix Template Data
        </Button>
      </div>
      
      {#if queryResult}
        <div class="p-4 rounded-lg {queryResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          {queryResult}
        </div>
      {/if}
      
      <div class="bg-gray-100 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Debug Output:</h3>
        <pre class="whitespace-pre-wrap text-sm">{debugInfo}</pre>
      </div>
      
      {#if templates.length > 0}
        <div>
          <h3 class="font-semibold mb-2">Template Data:</h3>
          <div class="space-y-2">
            {#each templates as template}
              <div class="border p-2 rounded">
                <div><strong>Name:</strong> {template.name}</div>
                <div><strong>isDefault:</strong> {template.isDefault} ({typeof template.isDefault})</div>
                <div><strong>Type:</strong> {template.type}</div>
                <div><strong>Category:</strong> {template.category}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
