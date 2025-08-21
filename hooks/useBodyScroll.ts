'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook to prevent body scrolling when modals are open
 * Automatically restores scroll position when modal closes
 * 
 * @param shouldPreventScroll - Boolean indicating if scrolling should be prevented
 */
export const useBodyScroll = (shouldPreventScroll: boolean) => {
  const scrollPosition = useRef(0)

  useEffect(() => {
    if (shouldPreventScroll) {
      // Store current scroll position
      scrollPosition.current = window.scrollY
      
      // Add modal-open class to body
      document.body.classList.add('modal-open')
      
      // Prevent scrolling by setting body styles
      const originalStyle = window.getComputedStyle(document.body)
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPosition.current}px`
      document.body.style.width = '100%'
      document.body.style.paddingRight = `${scrollBarWidth}px`
      
      // Prevent touch scrolling on mobile
      document.body.style.touchAction = 'none'
      
      // Prevent iOS Safari bounce scrolling
      document.documentElement.style.position = 'fixed'
      document.documentElement.style.top = `-${scrollPosition.current}px`
      document.documentElement.style.width = '100%'
      document.documentElement.style.height = '100%'
      
    } else {
      // Restore scrolling
      document.body.classList.remove('modal-open')
      
      // Restore original body styles
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.paddingRight = ''
      document.body.style.touchAction = ''
      
      // Restore document element styles
      document.documentElement.style.position = ''
      document.documentElement.style.top = ''
      document.documentElement.style.width = ''
      document.documentElement.style.height = ''
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition.current)
    }
    
    // Cleanup function
    return () => {
      if (shouldPreventScroll) {
        // Only cleanup if we're still preventing scroll
        document.body.classList.remove('modal-open')
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.paddingRight = ''
        document.body.style.touchAction = ''
        
        document.documentElement.style.position = ''
        document.documentElement.style.top = ''
        document.documentElement.style.width = ''
        document.documentElement.style.height = ''
        
        window.scrollTo(0, scrollPosition.current)
      }
    }
  }, [shouldPreventScroll])
}
