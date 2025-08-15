'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingCart, Loader2, AlertCircle, X, CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { Product } from '@/lib/supabase'

interface AddToCartButtonProps {
  product: Product
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  children?: React.ReactNode
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  children
}) => {
  const { user, getUserRole } = useAuth()
  const { addToCart, buttonLoadingStates } = useCart()
  const { openSignInModal } = useModal()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const isLoading = buttonLoadingStates[product.id.toString()] || false
  const isDisabled = disabled || isLoading

  // Enhanced debugging
  console.log('🛒 AddToCartButton Debug:', {
    productId: product.id,
    productName: product.name,
    user: user,
    userRole: getUserRole(),
    isDisabled: isDisabled,
    showAuthModal: showAuthModal,
    localStorageUserData: typeof window !== 'undefined' ? localStorage.getItem('userData') : 'N/A',
    userState: user ? 'User exists' : 'No user',
    userRoleState: getUserRole()
  })

  // Check localStorage directly for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('userData')
      console.log('🛒 AddToCartButton: localStorage userData:', storedUser)
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          console.log('🛒 AddToCartButton: Parsed userData:', parsed)
        } catch (e) {
          console.error('🛒 AddToCartButton: Error parsing userData:', e)
        }
      }
    }
  }, [user])

  const handleAddToCart = async () => {
    console.log('🛒 AddToCartButton: handleAddToCart called')
    console.log('🛒 AddToCartButton: Current user state:', user)
    
    // Check if user is authenticated
    if (!user) {
      console.log('🛒 AddToCartButton: User not authenticated, showing auth modal')
      setShowAuthModal(true)
      return
    }

    console.log('🛒 AddToCartButton: User authenticated, proceeding with add to cart')
    // User is authenticated, proceed with adding to cart
    try {
      await addToCart(product, product.id?.toString() || 'unknown')
      // Show success toast
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000) // Hide after 3 seconds
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleSignInClick = () => {
    setShowAuthModal(false)
    openSignInModal()
  }

  const closeModal = () => {
    setShowAuthModal(false)
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-red hover:bg-red-600 text-white shadow-lg hover:scale-105',
    secondary: 'bg-primary-red hover:bg-red-600 text-white',
    outline: 'bg-primary-red hover:bg-red-600 text-white border-2 border-primary-red'
  }

  // Default button content
  const defaultContent = (
    <>
      Add to Cart
    </>
  )

  // If user is not authenticated, show sign-in message instead of button
  if (!user) {
    // Double-check localStorage to see if user data exists
    const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null
    const hasStoredUser = storedUserData && storedUserData !== 'null'
    
    console.log('🛒 AddToCartButton: No user in context, checking localStorage:', {
      storedUserData,
      hasStoredUser,
      user
    })
    
    // If there's stored user data but no user in context, there might be a sync issue
    if (hasStoredUser) {
      console.log('🛒 AddToCartButton: Found stored user data but no user in context - sync issue detected')
      
      // Add a manual refresh button for debugging
      return (
        <div className={`${className} text-center`}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-3">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Authentication sync issue detected</span>
            </div>
            <div className="text-xs text-yellow-600 mb-3">
              User data found in localStorage but not in context. This might be a sync issue.
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered')
                  window.location.reload()
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={openSignInModal}
                className="w-full bg-primary-red hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign In Again
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className={`${className} text-center`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Sign in to add items to your cart</span>
          </div>
          <button
            onClick={openSignInModal}
            className="mt-3 w-full bg-primary-red hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
          font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${!isDisabled && variant === 'primary' ? 'hover:shadow-xl' : ''}
        `}
        title="Add to cart"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Adding...
          </div>
        ) : (
          children || defaultContent
        )}
      </button>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {product.name} added to cart!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={() => setShowSuccessToast(false)}
                  className="inline-flex text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Authentication Required Modal - Center of screen */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            />
            
            {/* Simple Modal */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sign In Required
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body - Simple Message Only */}
              <div className="bg-white px-6 py-6">
                <p className="text-gray-600 text-center text-lg">
                  Please sign in to add items to your cart.
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSignInClick}
                  className="flex-1 bg-primary-red hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddToCartButton
