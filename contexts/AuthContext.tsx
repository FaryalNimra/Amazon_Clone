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
      console.log('🔄 AuthContext: Syncing user from localStorage...')
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        console.log('🔄 AuthContext: Stored userData:', storedUserData)
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData)
            console.log('🔄 AuthContext: Parsed userData:', userData)
            
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
            
            console.log('🔄 AuthContext: Created mockUser:', mockUser)
            setUser(mockUser)
            setUserRole(userData.role)
            setUserProfile(userData)
            console.log('🔄 AuthContext: User state updated successfully')
          } catch (error) {
            console.error('❌ AuthContext: Error parsing userData from localStorage:', error)
          }
        } else {
          console.log('🔄 AuthContext: No userData found in localStorage')
          // Clear user state if no data in localStorage
          setUser(null)
          setUserRole(null)
          setUserProfile(null)
        }
      }
    }

    // Initial sync
    syncUserFromLocalStorage()

    // Listen for changes in localStorage
    const handleStorageChange = () => {
      console.log('🔄 AuthContext: Storage change detected, syncing user...')
      syncUserFromLocalStorage()
    }

    // Listen for custom events
    window.addEventListener('userDataChanged', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)
    
    // Add a periodic check to ensure sync (every 2 seconds)
    const intervalId = setInterval(() => {
      const storedUserData = localStorage.getItem('userData')
      const currentUserExists = user !== null
      const storedUserExists = storedUserData && storedUserData !== 'null'
      
      // If there's a mismatch, sync
      if (currentUserExists !== storedUserExists) {
        console.log('🔄 AuthContext: Periodic sync detected mismatch, syncing...')
        syncUserFromLocalStorage()
      }
    }, 2000)

    return () => {
      window.removeEventListener('userDataChanged', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [user]) // Add user as dependency to prevent stale closures

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
      console.log('🔐 AuthContext: Starting sign in for:', email)
      
      // Check if Supabase is initialized
      if (!supabase) {
        console.error('❌ AuthContext: Supabase not initialized')
        return { error: 'Authentication service not available' }
      }

      // First check if user exists in buyers table
      console.log('🔍 AuthContext: Checking buyers table for user...')
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single()

      if (buyerError && buyerError.code !== 'PGRST116') {
        console.error('❌ AuthContext: Buyer table error:', buyerError)
        return { error: 'Database error. Please try again.' }
      }

      // If buyer found, sign them in and show account icon
      if (buyerData) {
        console.log('✅ AuthContext: Buyer found in database:', buyerData)
        
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
        
        console.log('💾 AuthContext: Storing BUYER data in localStorage:', userData)
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
          console.log('📡 AuthContext: Dispatching userDataChanged event for BUYER')
          window.dispatchEvent(new Event('userDataChanged'))
        }
        
        // Close all modals
        console.log('🚪 AuthContext: Closing modals...')
        closeSignInModal()
        closeSellerSignInModal()
        closeSellerSignUpModal()
        
        // Redirect buyer to home page (will show account icon in navbar)
        console.log('🏠 AuthContext: Redirecting BUYER to home page...')
        router.push('/')
        
        return { error: null }
      }

      // If not found in buyers, check sellers table
      console.log('🔍 AuthContext: User not in buyers table, checking sellers table...')
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single()

      if (sellerError && sellerError.code !== 'PGRST116') {
        console.error('❌ AuthContext: Seller table error:', sellerError)
        return { error: 'Database error. Please try again.' }
      }

      // If seller found, sign them in and redirect to dashboard
      if (sellerData) {
        console.log('✅ AuthContext: Seller found in database:', sellerData)
        
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
        
        console.log('💾 AuthContext: Storing SELLER data in localStorage:', userData)
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
          console.log('📡 AuthContext: Dispatching userDataChanged event for SELLER')
          window.dispatchEvent(new Event('userDataChanged'))
        }
        
        // Automatically redirect seller to dashboard
        console.log('🏪 AuthContext: Redirecting SELLER to dashboard...')
        router.push('/seller-dashboard')
        
        return { error: null }
      }

      // If user not found in either table
      console.log('❌ AuthContext: User not found in buyers or sellers table')
      return { error: 'Invalid email or password' }
    } catch (err) {
      console.error('❌ AuthContext: Unexpected sign in error:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  useEffect(() => {
    // Check if Supabase is initialized
    if (!supabase) {
      console.warn('Supabase not initialized, skipping auth setup')
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        // If user is logged in, check their role
        if (session?.user?.email) {
          const { role, profile } = await checkUserRole(session.user.email)
          setUserRole(role)
          setUserProfile(profile)
          
          // If seller, redirect to dashboard
          if (role === 'seller') {
            router.push('/seller-dashboard')
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        try {
          setUser(session?.user ?? null)
          
          // Handle auth state changes
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in:', session.user.email)
            
            // Check user role from database tables
            const { role, profile } = await checkUserRole(session.user.email)
            setUserRole(role)
            setUserProfile(profile)
            
            // Close all modals first
            closeSignInModal()
            closeSellerSignInModal()
            closeSellerSignUpModal()
            
            // Check if user is verified using last_sign_in_at
            if (!session.user.last_sign_in_at) {
              console.log('User email not verified, redirecting to email verification')
              try {
                router.push('/email-verification')
              } catch (navError) {
                console.error('Navigation error:', navError)
              }
            } else {
              console.log('User verified, checking role for redirect')
              
              if (role === 'seller') {
                console.log('User is a seller, redirecting to seller dashboard')
                try {
                  router.push('/seller-dashboard')
                } catch (navError) {
                  console.error('Navigation error:', navError)
                }
              } else if (role === 'buyer') {
                console.log('User is a buyer, redirecting to home page')
                try {
                  router.push('/')
                } catch (navError) {
                  console.error('Navigation error:', navError)
                }
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing role and profile')
            setUserRole(null)
            setUserProfile(null)
            localStorage.removeItem('userData')
            
            // Dispatch custom event to notify navbar
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('userDataChanged'))
            }
            
            try {
              router.push('/')
            } catch (navError) {
              console.error('Navigation error:', navError)
            }
          }
          
          setLoading(false)
        } catch (error) {
          console.error('Error handling auth state change:', error)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, closeSignInModal, closeSellerSignInModal, closeSellerSignUpModal])

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is initialized
      if (!supabase) {
        return { error: 'Authentication service not available' }
      }

      // First check if user exists and their verification status
      const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (userError) {
        return { error: userError.message }
      }

      if (user && !user.email_confirmed_at) {
        return { error: 'Email verification required. Please verify your email before signing in.' }
      }

      // If we reach here, the user is verified and can sign in
      return { error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 AuthContext: Starting sign out process...')
      
      // Since we're using custom table-based auth, we don't need to call supabase.auth.signOut()
      // Just clear all local state and localStorage
      
      // Clear localStorage first
      localStorage.removeItem('userData')
      
      // Clear state variables in the correct order
      setUserProfile(null)
      setUserRole(null)
      setUser(null)
      
      console.log('🧹 AuthContext: Local state and localStorage cleared')
      
      // Dispatch events in the correct order for immediate UI update
      if (typeof window !== 'undefined') {
        console.log('📡 AuthContext: Dispatching userSignedOut event first')
        // Dispatch sign out event first for immediate UI update
        window.dispatchEvent(new CustomEvent('userSignedOut', {
          detail: { timestamp: Date.now() }
        }))
        
        // Then dispatch general user data changed event
        console.log('📡 AuthContext: Dispatching userDataChanged event')
        window.dispatchEvent(new Event('userDataChanged'))
      }
      
      // Navigate to home page after sign out
      try {
        console.log('🏠 AuthContext: Redirecting to home page after sign out')
        router.push('/')
      } catch (navError) {
        console.error('❌ AuthContext: Navigation error after sign out:', navError)
      }
      
      console.log('✅ AuthContext: Sign out completed successfully')
      
    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error)
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
      try {
        console.log('🏠 AuthContext: Redirecting to home page after sign out error')
        router.push('/')
      } catch (navError) {
        console.error('❌ AuthContext: Navigation error after sign out error:', navError)
      }
    }
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

