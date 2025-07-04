import { useState, useEffect } from 'react'

const SIDEBAR_STATE_KEY = 'sidebar_state'

export function useSidebarState() {
  const [defaultOpen, setDefaultOpen] = useState<boolean>(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
      return stored ? JSON.parse(stored) : true // Default to open
    }
    return true
  })

  const handleOpenChange = (open: boolean) => {
    setDefaultOpen(open)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(open))
    }
  }

  return {
    defaultOpen,
    onOpenChange: handleOpenChange,
  }
}
