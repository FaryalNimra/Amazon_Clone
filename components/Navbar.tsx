'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Globe, Moon, Sun, ChevronDown, Menu, X, User, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/contexts/ModalContext'

import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps {
  onThemeToggle: () => void
  isDarkMode: boolean
}

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  category: string
}

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  created_at?: string
  updated_at?: string
}

const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, isDarkMode }) => {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const { openSignUpModal, openSignInModal } = useModal()

  const { userRole, userProfile, signOut } = useAuth()

  // Synchronize Navbar user state with AuthContext
  useEffect(() => {
    if (userRole && userProfile) {
      console.log('🔄 Navbar: Syncing with AuthContext user data:', userProfile)
      setUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        role: userProfile.role || userRole,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at
      })
    } else if (!userRole && !userProfile) {
      console.log('🔄 Navbar: AuthContext shows no user, clearing Navbar state')
      setUser(null)
      setIsUserDropdownOpen(false)
      setIsMobileMenuOpen(false) // Also close mobile menu when user signs out
      
      // Also ensure localStorage is cleared to prevent any race conditions
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData')
      }
    }
  }, [userRole, userProfile])

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData')
        console.log('🔄 Navbar: Loading user data from localStorage:', userData)
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            console.log('📝 Navbar: Parsed user data:', parsedUser)
            
            // If we have email, fetch fresh data from database
            if (parsedUser.email) {
              try {
                console.log('🔍 Navbar: Fetching fresh user data from database...')
                let freshUserData = null
                
                if (parsedUser.role === 'buyer') {
                  const { data: buyerData, error } = await supabase
                    .from('buyers')
                    .select('id, name, email, phone, role, created_at, updated_at')
                    .eq('email', parsedUser.email)
                    .single()

                  if (error) {
                    console.error('❌ Navbar: Error fetching buyer data:', error)
                    // Fallback to localStorage data
                    console.log('📋 Navbar: Using localStorage data as fallback')
                    setUser(parsedUser)
                  } else if (buyerData) {
                    freshUserData = {
                      id: buyerData.id,
                      name: buyerData.name,
                      email: buyerData.email,
                      phone: buyerData.phone,
                      role: buyerData.role || 'buyer',
                      created_at: buyerData.created_at,
                      updated_at: buyerData.updated_at
                    }
                  }
                } else if (parsedUser.role === 'seller') {
                  const { data: sellerData, error } = await supabase
                    .from('sellers')
                    .select('id, name, email, phone, role, created_at, updated_at')
                    .eq('email', parsedUser.email)
                    .single()

                  if (error) {
                    console.error('❌ Navbar: Error fetching seller data:', error)
                    // Fallback to localStorage data
                    console.log('📋 Navbar: Using localStorage data as fallback')
                    setUser(parsedUser)
                  } else if (sellerData) {
                    freshUserData = {
                      id: sellerData.id,
                      name: sellerData.name,
                      email: sellerData.email,
                      phone: sellerData.phone,
                      role: sellerData.role || 'seller',
                      created_at: sellerData.created_at,
                      updated_at: sellerData.updated_at
                    }
                  }
                }
                
                if (freshUserData) {
                  console.log('✅ Navbar: Fresh user data loaded:', freshUserData)
                  setUser(freshUserData)
                  // Update localStorage with fresh data
                  localStorage.setItem('userData', JSON.stringify(freshUserData))
                } else {
                  // No user found, clear user data
                  console.log('❌ Navbar: No user found in database, clearing user data')
                  setUser(null)
                  localStorage.removeItem('userData')
                }
              } catch (dbError) {
                console.error('❌ Navbar: Database error:', dbError)
                // Fallback to localStorage data
                console.log('📋 Navbar: Using localStorage data as fallback due to DB error')
                setUser(parsedUser)
              }
            } else {
              // No email, clear user data
              console.log('❌ Navbar: No email in user data, clearing')
              setUser(null)
              localStorage.removeItem('userData')
            }
          } catch (error) {
            console.error('❌ Navbar: Error parsing user data:', error)
            localStorage.removeItem('userData')
            setUser(null)
          }
        } else {
          console.log('📭 Navbar: No user data found in localStorage')
          setUser(null)
        }
      }
    }

    loadUserData()

    // Listen for storage changes (when user signs in/out from other components)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 Navbar: Storage event detected:', e.key, e.newValue)
      if (e.key === 'userData') {
        loadUserData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom events for immediate updates
    const handleUserDataChange = () => {
      console.log('🎯 Navbar: Custom userDataChanged event received')
      console.log('🔄 Navbar: Reloading user data...')
      
      // Check if userData actually exists in localStorage before reloading
      const userData = localStorage.getItem('userData')
      if (userData) {
        // User data exists, reload it
        loadUserData()
      } else {
        // No user data, clear state immediately
        console.log('🧹 Navbar: No user data found, clearing state immediately')
        setUser(null)
        setIsUserDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    
    // Listen for specific sign out event
    const handleUserSignedOut = () => {
      console.log('🚪 Navbar: User signed out event received')
      console.log('🧹 Navbar: Immediately clearing user state...')
      
      // Immediately clear user state and close dropdowns
      setUser(null)
      setIsUserDropdownOpen(false)
      setIsMobileMenuOpen(false)
      
      // Force immediate UI update
      setUser(null)
      
      // Clear any remaining localStorage data to prevent race conditions
      localStorage.removeItem('userData')
    }
    
    window.addEventListener('userDataChanged', handleUserDataChange)
    window.addEventListener('userSignedOut', handleUserSignedOut)
    
    // Also check for user data changes periodically (as a fallback)
    const intervalId = setInterval(() => {
      const currentUserData = localStorage.getItem('userData')
      if (currentUserData && !user) {
        console.log('⏰ Navbar: Periodic check - user data found but user state is null, reloading...')
        loadUserData()
      } else if (!currentUserData && user) {
        // If no user data in localStorage but user state exists, clear it
        console.log('⏰ Navbar: Periodic check - no user data but user state exists, clearing...')
        setUser(null)
        setIsUserDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }, 2000) // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataChanged', handleUserDataChange)
      window.removeEventListener('userSignedOut', handleUserSignedOut)
      clearInterval(intervalId)
    }
  }, [user]) // Add user as dependency to avoid infinite loops

  const categories = [
    'All',
    'Smartphones',
    'Laptops',
    'Tablets',
    'Headphones',
    'Cameras',
    'Gaming',
    'Smart Home',
    'Wearables',
    'Accessories'
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Search products function
  const searchProducts = async (query: string, category: string = 'All') => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      let queryBuilder = supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${query}%`)
        .limit(8)

      if (category !== 'All') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery, selectedCategory)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, selectedCategory])

  // Get user display name from auth metadata
  const getUserDisplayName = () => {
    if (!user) return ''
    
    return user.name || user.email?.split('@')[0] || 'User'
  }



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to Electronics category page with search query
      router.push(`/category/electronics?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchResults([])
      
      // Reload page after search to show browser loading spinner
      window.location.reload()
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setIsCategoryDropdownOpen(false)
    
    // Route to Electronics category page when category is selected
    if (category !== 'All') {
      router.push(`/category/electronics?category=${encodeURIComponent(category)}`)
    } else {
      router.push('/category/electronics')
    }
    
    // Also update search if there's a query
    if (searchQuery.trim()) {
      searchProducts(searchQuery, category)
    }
    
    // Reload page after category selection to show browser loading spinner
    window.location.reload()
  }

  const handleProductClick = (productId: number) => {
    router.push(`/category/electronics?product=${productId}`)
    setSearchQuery('')
    setSearchResults([])
    
    // Reload page after product click to show browser loading spinner
    window.location.reload()
  }

  const handleSignOut = async () => {
    try {
      console.log('🔄 Navbar: Starting sign out process...')
      
      // Close dropdown immediately for better UX
      setIsUserDropdownOpen(false)
      
      // Clear local state immediately for better UX
      setUser(null)
      setIsMobileMenuOpen(false)
      
      // Call the signOut function from AuthContext (this will handle everything)
      await signOut()
      
      console.log('✅ Navbar: Sign out completed successfully')
      
      // Reload page after successful sign out to show browser loading spinner
      window.location.reload()
      
    } catch (error) {
      console.error('❌ Navbar: Error during sign out:', error)
      // Even if there's an error, clear local state
      setUser(null)
      setIsUserDropdownOpen(false)
      setIsMobileMenuOpen(false)
      localStorage.removeItem('userData')
      
      // Dispatch events manually if AuthContext failed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userDataChanged'))
        window.dispatchEvent(new CustomEvent('userSignedOut', {
          detail: { timestamp: Date.now() }
        }))
      }
      
      // Reload page even on error to ensure clean state
      window.location.reload()
    }
  }

  const displayName = getUserDisplayName()

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
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search iPhones, laptops, headphones..."
                    className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Categories Dropdown */}
                <div className="relative ml-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 min-w-[120px] flex items-center justify-between"
                  >
                    <span className="truncate">{selectedCategory}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                  </button>
                  
                  {/* Categories Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red mx-auto"></div>
                      <p className="mt-2">Searching...</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-primary-red font-semibold text-sm">
                                ${product.price}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 0 && (
                        <div className="p-3 border-t border-gray-100 dark:border-gray-600">
                          <button
                            onClick={handleSearch}
                            className="w-full text-center text-primary-red hover:text-red-600 font-medium text-sm"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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



            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Show user profile for buyers */}
              {user && user.role === 'buyer' && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-red rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-gray-700 dark:text-gray-300">
                      Hi, {user.name || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.name || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {user.phone}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {user.role || 'buyer'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Account Actions */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            // Add profile/edit functionality here
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
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
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="hidden lg:block text-xs text-gray-400">
                User: {user ? `${user.role} (${user.name})` : 'None'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile Categories */}
              <div className="mt-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-red dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile menu content */}
            <>
              {/* Show name when logged in as BUYER only */}
              {user && user.role === 'buyer' && (
                <div className="px-3 py-2 text-sm text-text-muted border-b border-border-light mb-2 dark:text-gray-400 dark:border-gray-700">
                  Hi, {displayName}
                </div>
              )}
              
              {/* Show logout when logged in as BUYER only */}
              {user && user.role === 'buyer' && (
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
                    className="block w-full text-left bg-primary-red text-white px-4 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
