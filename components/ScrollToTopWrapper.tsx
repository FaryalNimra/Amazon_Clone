'use client'

import { useScrollToTop } from '@/hooks/useScrollToTop'

interface ScrollToTopWrapperProps {
  children: React.ReactNode
}

const ScrollToTopWrapper: React.FC<ScrollToTopWrapperProps> = ({ children }) => {
  useScrollToTop()
  
  return <>{children}</>
}

export default ScrollToTopWrapper
