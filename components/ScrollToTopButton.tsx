'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { scrollToTopSmooth } from '@/utils/scrollToTop'

interface ScrollToTopButtonProps {
  threshold?: number // Show button when scrolled past this point
  className?: string
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ 
  threshold = 300, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const handleClick = () => {
    scrollToTopSmooth()
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50 
        w-12 h-12 bg-primary-red hover:bg-red-600 
        text-white rounded-full shadow-lg 
        flex items-center justify-center 
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        ${className}
      `}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}

export default ScrollToTopButton





