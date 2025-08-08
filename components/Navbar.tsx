'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Globe, Moon, Sun, ChevronDown, Menu, X, User, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/contexts/ModalContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCartNavigation } from '@/hooks/useCartNavigation'

interface NavbarProps {
  onThemeToggle: () => void
  isDarkMode: boolean
}

const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, isDarkMode }) => {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false)
  const { openSignUpModal, openSignInModal, openSellerSignInModal } = useModal()
  const { cartCount } = useCart()
  const { user, getUserRole, getUserInfo } = useAuth()
  const { getCartUrl } = useCartNavigation()

  const categories = [
    'All',
    'Electronics',
    'Books',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Toys',
    'Automotive',
    'Health',
    'Beauty'
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get user display name from auth metadata
  const getUserDisplayName = () => {
    if (!user) return ''
    
    const userInfo = getUserInfo()
    if (userInfo?.name) {
      return userInfo.name
    }
    
    // Fallback to user metadata or email
    return user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  }

  const getCurrentUserRole = () => {
    if (!user) return null
    return getUserRole() || 'buyer'
  }

  // Check if user is currently in seller mode (on seller dashboard)
  const isInSellerMode = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/seller-dashboard')
    }
    return false
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search functionality
    console.log('Searching for:', searchQuery)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Handle category filtering
    console.log('Selected category:', category)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleModeSwitch = (mode: 'buyer' | 'seller') => {
    setIsModeDropdownOpen(false)
    
    // If user is not logged in, show appropriate sign-in modal
    if (!user) {
      if (mode === 'seller') {
        openSellerSignInModal()
      } else {
        openSignInModal()
      }
      return
    }
    
    // If user is logged in, navigate to appropriate mode
    if (mode === 'buyer') {
      router.push('/')
    } else if (mode === 'seller') {
      router.push('/seller-dashboard')
    }
  }

  const displayName = getUserDisplayName()
  const userRole = getCurrentUserRole()
  const isCurrentlyInSellerMode = isInSellerMode()

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md dark:bg-gray-900' : 'bg-white/95 backdrop-blur-sm dark:bg-gray-900/95'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-primary-text dark:text-white">Amazon</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </form>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <Link href={getCartUrl()} className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Show complete buyer navbar when not in seller mode */}
              {!isCurrentlyInSellerMode && (
                <>
                  {/* Show name and logout when logged in */}
                  {user && (
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="text-sm text-primary-text dark:text-white">
                        Hi, {displayName}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="text-sm text-text-muted hover:text-primary-red transition-colors dark:text-gray-400 dark:hover:text-red-500"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                  
                  {/* Show sign-in/sign-up when not logged in */}
                  {!user && (
                    <div className="hidden sm:flex items-center space-x-4">
                      <button
                        onClick={openSignInModal}
                        className="text-sm text-primary-text hover:text-primary-red transition-colors dark:text-white dark:hover:text-red-500"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={openSignUpModal}
                        className="bg-primary-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Mode Switch Dropdown - Always visible */}
              <div className="relative">
                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isCurrentlyInSellerMode ? (
                    <>
                      <Store className="h-4 w-4" />
                      <span>As Seller</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>As Buyer</span>
                    </>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isModeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => handleModeSwitch('buyer')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>As Buyer</span>
                    </button>
                    <button
                      onClick={() => handleModeSwitch('seller')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Store className="h-4 w-4" />
                      <span>As Seller</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Mobile menu content based on mode */}
            {!isCurrentlyInSellerMode ? (
              <>
                {/* Show name when logged in */}
                {user && (
                  <div className="px-3 py-2 text-sm text-text-muted border-b border-border-light mb-2 dark:text-gray-400 dark:border-gray-700">
                    Hi, {displayName}
                  </div>
                )}
                
                {/* Mobile Mode Switch */}
                <div className="px-3 py-2 border-b border-border-light mb-2 dark:border-gray-700">
                  <div className="text-sm text-text-muted mb-2 dark:text-gray-400">Switch Mode:</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        handleModeSwitch('buyer')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full text-left text-primary-text hover:text-primary-red transition-colors px-2 py-1 rounded dark:text-white dark:hover:text-red-500"
                    >
                      <User className="h-4 w-4" />
                      <span>As Buyer</span>
                    </button>
                    <button
                      onClick={() => {
                        handleModeSwitch('seller')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full text-left text-primary-text hover:text-primary-red transition-colors px-2 py-1 rounded dark:text-white dark:hover:text-red-500"
                    >
                      <Store className="h-4 w-4" />
                      <span>As Seller</span>
                    </button>
                  </div>
                </div>
                
                {/* Show logout when logged in */}
                {user && (
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left text-primary-text hover:text-primary-red transition-colors px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-red-500"
                  >
                    Logout
                  </button>
                )}
                
                {/* Show sign-in/sign-up when not logged in */}
                {!user && (
                  <>
                    <button
                      onClick={() => {
                        openSignInModal()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-primary-text hover:text-primary-red transition-colors px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-red-500"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openSignUpModal()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left bg-primary-red text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Mobile Mode Switch for seller mode */}
                <div className="px-3 py-2 border-b border-border-light mb-2 dark:border-gray-700">
                  <div className="text-sm text-text-muted mb-2 dark:text-gray-400">Choose Mode:</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        handleModeSwitch('buyer')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full text-left text-primary-text hover:text-primary-red transition-colors px-2 py-1 rounded dark:text-white dark:hover:text-red-500"
                    >
                      <User className="h-4 w-4" />
                      <span>As Buyer</span>
                    </button>
                    <button
                      onClick={() => {
                        handleModeSwitch('seller')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full text-left text-primary-text hover:text-primary-red transition-colors px-2 py-1 rounded dark:text-white dark:hover:text-red-500"
                    >
                      <Store className="h-4 w-4" />
                      <span>As Seller</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
