'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface UseScrollToTopOptions {
  behavior?: ScrollBehavior
  delay?: number
  enabled?: boolean
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const pathname = usePathname()
  const { 
    behavior = 'smooth', 
    delay = 100, 
    enabled = true 
  } = options

  useEffect(() => {
    if (!enabled) return

    // Only scroll to top if we're in the browser
    if (typeof window !== 'undefined') {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior
        })
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [pathname, behavior, delay, enabled])
}
