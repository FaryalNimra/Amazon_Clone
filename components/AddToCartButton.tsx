'use client'

import React, { useState } from 'react'
import { ShoppingCart, Check, LogIn } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { CartItem } from '@/contexts/CartContext'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AddToCartButton({ 
  product, 
  className = '', 
  size = 'md'
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const { user, userRole } = useAuth()
  const { openSignInModal } = useModal()
  const [isAdding, setIsAdding] = useState(false)

  // Memoize these values to prevent unnecessary re-renders
  const isProductInCart = React.useMemo(() => isInCart(product.id), [isInCart, product.id])
  const isAuthenticated = React.useMemo(() => user !== null, [user])
  const isBuyer = React.useMemo(() => userRole === 'buyer', [userRole])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleAddToCart = React.useCallback(async () => {
    if (isProductInCart) return
    
    // Check if user is authenticated and is a buyer
    if (!isAuthenticated) {
      openSignInModal()
      return
    }

    if (!isBuyer) {
      // Show message that only buyers can add to cart
      alert('Only buyers can add products to cart. Please sign in as a buyer.')
      return
    }
    
    setIsAdding(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))
      const result = await addToCart(product)
      
      if (!result.success) {
        alert(result.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('An error occurred while adding to cart')
    } finally {
      setIsAdding(false)
    }
  }, [isAuthenticated, isBuyer, isProductInCart, user, userRole, addToCart, product, openSignInModal])

  // If product is already in cart
  if (isProductInCart) {
    return (
      <button
        disabled
        className={`flex items-center justify-center space-x-2 bg-green-600 text-white rounded-lg transition-all ${sizeClasses[size]} ${className}`}
      >
        <Check className={iconSizes[size]} />
        <span>Added to Cart</span>
      </button>
    )
  }

  // If user is not authenticated, show sign-in button
  if (!isAuthenticated) {
    return (
      <button
        onClick={openSignInModal}
        className={`flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-105 ${sizeClasses[size]} ${className}`}
      >
        <LogIn className={iconSizes[size]} />
        <span>Sign In to Add to Cart</span>
      </button>
    )
  }

  // If user is not a buyer, show message
  if (!isBuyer) {
    return (
      <button
        disabled
        className={`flex items-center justify-center space-x-2 bg-gray-400 text-white rounded-lg cursor-not-allowed ${sizeClasses[size]} ${className}`}
        title="Only buyers can add products to cart"
      >
        <ShoppingCart className={iconSizes[size]} />
        <span>Buyers Only</span>
      </button>
    )
  }

  // Normal add to cart button for authenticated buyers
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${sizeClasses[size]} ${className}`}
    >
      {isAdding ? (
        <>
          <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizes[size]}`} />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <ShoppingCart className={iconSizes[size]} />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  )
}
