'use client'

import React, { useEffect } from 'react'
import { ShoppingBag, Home, Plus, Minus, Trash2, Lock } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { useRouter } from 'next/navigation'

const CartPage = () => {
  const { cartItems, cartTotal, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const { openSignInModal } = useModal()
  const router = useRouter()

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your cart</p>
          <div className="space-y-3">
            <button
              onClick={openSignInModal}
              className="bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error: any) {
      if (error.message === 'Authentication required to update cart') {
        alert('Please sign in to manage your cart.')
      } else {
        console.error('Error updating quantity:', error)
      }
    }
  }

  const handleRemoveItem = async (productId: number) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(productId)
      } catch (error: any) {
        if (error.message === 'Authentication required to remove items from cart') {
          alert('Please sign in to manage your cart.')
        } else {
          console.error('Error removing item:', error)
        }
      }
    }
  }

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart()
      } catch (error: any) {
        if (error.message === 'Authentication required to clear cart') {
          alert('Please sign in to manage your cart.')
        } else {
          console.error('Error clearing cart:', error)
        }
      }
    }
  }

  return <CartContent />
}

// CartContent component
const CartContent = () => {
  const { cartItems, cartTotal, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const router = useRouter()

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error: any) {
      if (error.message === 'Authentication required to update cart') {
        alert('Please sign in to manage your cart.')
      } else {
        console.error('Error updating quantity:', error)
      }
    }
  }

  const handleRemoveItem = async (productId: number) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(productId)
      } catch (error: any) {
        if (error.message === 'Authentication required to remove items from cart') {
          alert('Please sign in to manage your cart.')
        } else {
          console.error('Error removing item:', error)
        }
      }
    }
  }

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart()
      } catch (error: any) {
        if (error.message === 'Authentication required to clear cart') {
          alert('Please sign in to manage your cart.')
        } else {
          console.error('Error clearing cart:', error)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={handleClearCart}
              disabled={loading}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product?.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-red">
                          ${item.product?.price}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-600 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={loading}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Item Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-red">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={loading || cartItems.length === 0}
                className="w-full bg-primary-red hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => router.push('/')}
                className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
