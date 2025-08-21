'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import Navbar from './Navbar'
import TestimonialsCarousel from './TestimonialsCarousel'
import Footer from './Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { state: cartState } = useCart()
  const pathname = usePathname()
  
  // Check if current route is seller dashboard
  const isSellerDashboard = pathname?.startsWith('/seller-dashboard')
  
  // Check if current route is cart page
  const isCartPage = pathname === '/cart'
  
  // Check if cart has items
  const hasCartItems = cartState.items.length > 0
  
  // Show testimonials logic:
  // - Always show on all pages when cart has items
  // - Hide only on cart page when cart is empty
  // - Show on all other pages even when cart is empty
  const shouldShowTestimonials = hasCartItems || !isCartPage
  
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
        {/* Show testimonials based on cart state and current page */}
        {shouldShowTestimonials && <TestimonialsCarousel />}
        <Footer />
      </div>
      

    </>
  )
}

export default LayoutWrapper

