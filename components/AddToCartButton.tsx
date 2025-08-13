'use client'

import React, { useState } from 'react'
import { ShoppingCart, Loader2, AlertCircle, X } from 'lucide-react'
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

  const isLoading = buttonLoadingStates[product.id.toString()] || false
  const isDisabled = disabled || isLoading

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // User is authenticated, proceed with adding to cart
    try {
      await addToCart(product, product.id?.toString() || 'unknown')
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
