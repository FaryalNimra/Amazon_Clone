'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import Navbar from './Navbar'
import TestimonialsCarousel from './TestimonialsCarousel'
import Footer from './Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const pathname = usePathname()
  
  // Check if current route is seller dashboard
  const isSellerDashboard = pathname?.startsWith('/seller-dashboard')
  
  // If it's seller dashboard, return only the children without navbar, testimonials, or footer
  if (isSellerDashboard) {
    return <div className="min-h-screen">{children}</div>
  }
  
  // For all other routes, include navbar, testimonials, and footer
  return (
    <>
      <Navbar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      <div className="pt-16 min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <TestimonialsCarousel />
        <Footer />
      </div>
      

    </>
  )
}

export default LayoutWrapper

