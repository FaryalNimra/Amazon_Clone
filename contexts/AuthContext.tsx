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
  sellerLogout: () => Promise<void>
  switchToBuyerMode: () => void
  getUserRole: () => string | null
  getUserInfo: () => any
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
  const router = useRouter()
  const { closeSignInModal, closeSellerSignInModal, closeSellerSignUpModal } = useModal()

  // Helper function to get user role from metadata
  const getUserRole = () => {
    if (!user) return null
    return user.user_metadata?.role || user.user_metadata?.user_type || null
  }

  // Helper function to get user info from metadata
  const getUserInfo = () => {
    if (!user) return null
    
    const role = getUserRole()
    if (role === 'seller') {
      return user.user_metadata?.seller_info || null
    } else if (role === 'buyer') {
      return user.user_metadata?.buyer_info || null
    }
    return null
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
          setLoading(false)

          // Handle auth state changes
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in:', session.user.email)
            console.log('Email confirmed at:', session.user.email_confirmed_at)
            console.log('Last sign in at:', session.user.last_sign_in_at)
            console.log('User metadata:', session.user.user_metadata)
            
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
              // Check user role from metadata and redirect accordingly
              const userRole = session.user.user_metadata?.role || session.user.user_metadata?.user_type
              
              if (userRole === 'seller') {
                console.log('User is a seller, redirecting to seller dashboard')
                try {
                  router.push('/seller-dashboard')
                } catch (navError) {
                  console.error('Navigation error:', navError)
                }
              } else {
                console.log('User is a buyer, redirecting to home page')
                // Buyer - go to home page
                try {
                  router.push('/')
                } catch (navError) {
                  console.error('Navigation error:', navError)
                }
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out, redirecting to home page')
            try {
              router.push('/')
            } catch (navError) {
              console.error('Navigation error:', navError)
            }
          }
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
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const sellerLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      // Redirect to buyer home page after seller logout
      router.push('/')
    } catch (error) {
      console.error('Seller logout error:', error)
    }
  }

  const switchToBuyerMode = () => {
    // Clear user session and redirect to buyer home page
    setUser(null)
    router.push('/')
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    sellerLogout,
    switchToBuyerMode,
    getUserRole,
    getUserInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

