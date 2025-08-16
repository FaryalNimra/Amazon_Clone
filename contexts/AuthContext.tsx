'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useModal } from './ModalContext'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  getUserRole: () => string | null
  getUserInfo: () => any
  buyerSignIn: (email: string, password: string) => Promise<{ error: string | null }>
  userRole: string | null
  userProfile: any
  forceSync: () => void
}

// Interface for localStorage user data
interface LocalUserData {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  created_at?: string
  updated_at?: string
  storeName?: string
  gstNumber?: string
  businessType?: string
  businessAddress?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const { closeSignInModal, closeSellerSignInModal, closeSellerSignUpModal } = useModal()

  // Sync user state with localStorage userData
  useEffect(() => {
    const syncUserFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        
        if (storedUserData && storedUserData !== 'null' && storedUserData !== 'undefined') {
          try {
            const userData = JSON.parse(storedUserData)
            
            // Validate that userData has required fields
            if (userData.id && userData.email && userData.role) {
              // Create a mock User object that matches Supabase User interface
              const mockUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                user_metadata: {
                  name: userData.name,
                  role: userData.role
                },
                app_metadata: {
                  role: userData.role
                }
              } as any
              
              // Set user state
              setUser(mockUser)
              setUserRole(userData.role)
              setUserProfile(userData)
            } else {
              // Clear invalid user data
              localStorage.removeItem('userData')
              setUser(null)
              setUserRole(null)
              setUserProfile(null)
            }
          } catch (error) {
            console.error('Error parsing userData from localStorage:', error)
            // Clear corrupted user data
            localStorage.removeItem('userData')
            setUser(null)
            setUserRole(null)
            setUserProfile(null)
          }
        } else {
          // Clear user state if no data in localStorage
          setUser(null)
          setUserRole(null)
          setUserProfile(null)
        }
      }
      setLoading(false)
    }

    // Initial sync
    syncUserFromLocalStorage()

    // Listen for changes in localStorage
    const handleStorageChange = () => {
      syncUserFromLocalStorage()
    }

    // Listen for custom events
    const handleUserDataChanged = (event: Event) => {
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        syncUserFromLocalStorage()
      }, 100)
    }

    window.addEventListener('userDataChanged', handleUserDataChanged)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('userDataChanged', handleUserDataChanged)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Helper function to get user role from metadata
  const getUserRole = () => {
    return userRole
  }

  // Helper function to get user info from metadata
  const getUserInfo = () => {
    return userProfile
  }

  // Function to check user role in Supabase tables
  const checkUserRole = async (email: string) => {
    try {
      // First check buyers table
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (buyerData) {
        return { role: 'buyer', profile: buyerData }
      }

      // Then check sellers table
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (sellerData) {
        return { role: 'seller', profile: sellerData }
      }

      return { role: null, profile: null }
    } catch (error) {
      console.error('Error checking user role:', error)
      return { role: null, profile: null }
    }
  }

  // New function for buyer sign in that works with the buyers table
  const buyerSignIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is initialized
      if (!supabase) {
        return { error: 'Authentication service not available' }
      }

      // First check if user exists in buyers table
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single()

      if (buyerError && buyerError.code !== 'PGRST116') {
        return { error: 'Database error. Please try again.' }
      }

      // If buyer found, sign them in and show account icon
      if (buyerData) {
        // Set user role and profile
        setUserRole('buyer')
        setUserProfile(buyerData)
        
        // Store buyer data in localStorage
        const userData = {
          id: buyerData.id,
          name: buyerData.name,
          email: buyerData.email,
          phone: buyerData.phone,
          role: 'buyer',
          created_at: buyerData.created_at,
          updated_at: buyerData.updated_at
        }
        
        localStorage.setItem('userData', JSON.stringify(userData))
        
        // Create mock user object for Supabase compatibility
        const mockUser = {
          id: buyerData.id,
          email: buyerData.email,
          role: 'buyer',
          user_metadata: {
            name: buyerData.name,
            role: 'buyer'
          },
          app_metadata: {
            role: 'buyer'
          }
        } as any
        
        // Set user state
        setUser(mockUser)
        
        // Dispatch custom event to notify navbar of user data change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('userDataChanged'))
        }
        
        // Close all modals
        closeSignInModal()
        closeSellerSignInModal()
        closeSellerSignUpModal()
        
        // Redirect buyer to home page (will show account icon in navbar)
        router.push('/')
        
        return { error: null }
      }

      // If not found in buyers, check sellers table
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single()

      if (sellerError && sellerError.code !== 'PGRST116') {
        return { error: 'Database error. Please try again.' }
      }

      // If seller found, sign them in and redirect to dashboard
      if (sellerData) {
        // Set user role and profile
        setUserRole('seller')
        setUserProfile(sellerData)
        
        // Store seller data in localStorage
        const userData = {
          id: sellerData.id,
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone,
          role: 'seller',
          storeName: sellerData.store_name,
          gstNumber: sellerData.gst_number,
          businessType: sellerData.business_type,
          businessAddress: sellerData.business_address,
          created_at: sellerData.created_at,
          updated_at: sellerData.updated_at
        }
        
        localStorage.setItem('userData', JSON.stringify(userData))
        
        // Create mock user object for Supabase compatibility
        const mockUser = {
          id: sellerData.id,
          email: sellerData.email,
          role: 'seller',
          user_metadata: {
            name: sellerData.name,
            role: 'seller'
          },
          app_metadata: {
            role: 'seller'
          }
        } as any
        
        // Set user state
        setUser(mockUser)
        
        // Dispatch custom event to notify navbar of user data change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('userDataChanged'))
        }
        
        // Automatically redirect seller to dashboard
        router.push('/seller-dashboard')
        
        return { error: null }
      }

      // If user not found in either table
      return { error: 'Invalid email or password' }
    } catch (err) {
      console.error('Unexpected sign in error:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signIn = async (email: string, password: string) => {
    // Use the same logic as buyerSignIn for consistency
    return await buyerSignIn(email, password)
  }

  const signOut = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('userData')
      
      // Clear state variables in the correct order
      setUserProfile(null)
      setUserRole(null)
      setUser(null)
      
      // Dispatch events for immediate UI update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userSignedOut', {
          detail: { timestamp: Date.now() }
        }))
        window.dispatchEvent(new Event('userDataChanged'))
      }
      
      // Navigate to home page after sign out
      router.push('/')
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, clear state
      localStorage.removeItem('userData')
      setUserProfile(null)
      setUserRole(null)
      setUser(null)
      
      // Still dispatch events even on error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userSignedOut', {
          detail: { timestamp: Date.now() }
        }))
        window.dispatchEvent(new Event('userDataChanged'))
      }
      
      // Navigate to home page even on error
      router.push('/')
    }
  }

  const forceSync = () => {
    const syncUserFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        
        if (storedUserData && storedUserData !== 'null' && storedUserData !== 'undefined') {
          try {
            const userData = JSON.parse(storedUserData)
            
            // Validate that userData has required fields
            if (userData.id && userData.email && userData.role) {
              // Create a mock User object that matches Supabase User interface
              const mockUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                user_metadata: {
                  name: userData.name,
                  role: userData.role
                },
                app_metadata: {
                  role: userData.role
                }
              } as any
              
              // Set user state
              setUser(mockUser)
              setUserRole(userData.role)
              setUserProfile(userData)
            } else {
              // Clear invalid user data
              localStorage.removeItem('userData')
              setUser(null)
              setUserRole(null)
              setUserProfile(null)
            }
          } catch (error) {
            console.error('Error parsing userData from localStorage:', error)
            // Clear corrupted user data
            localStorage.removeItem('userData')
            setUser(null)
            setUserRole(null)
            setUserProfile(null)
          }
        } else {
          // Clear user state if no data in localStorage
          setUser(null)
          setUserRole(null)
          setUserProfile(null)
        }
      }
    }
    syncUserFromLocalStorage()
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    getUserRole,
    getUserInfo,
    buyerSignIn,
    userRole,
    userProfile,
    forceSync,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

