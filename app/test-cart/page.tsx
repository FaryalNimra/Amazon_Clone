'use client'

import React from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/lib/supabase'

const TestCartPage = () => {
  const { cartItems, cartCount, cartTotal, clearCart } = useCart()

  const testProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product 1',
      description: 'This is a test product for cart functionality',
      price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.5,
      reviewCount: 100,
      brand: 'Test Brand',
      inStock: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Test Product 2',
      description: 'Another test product for cart functionality',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviewCount: 200,
      brand: 'Test Brand',
      inStock: true,
      created_at: new Date().toISOString()
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Functionality Test</h1>
        
        {/* Cart Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Status</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-red">{cartCount}</div>
              <div className="text-sm text-gray-600">Items in Cart</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-red">${cartTotal.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div>
              <button
                onClick={async () => {
                  try {
                    await clearCart()
                  } catch (error: any) {
                    if (error.message === 'Authentication required to clear cart') {
                      alert('Please sign in to manage your cart.')
                    } else {
                      console.error('Error clearing cart:', error)
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Test Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary-red">${product.price}</span>
                <span className="text-sm text-gray-500">{product.brand}</span>
              </div>
              <AddToCartButton
                product={product}
                className="w-full"
                size="lg"
              />
            </div>
          ))}
        </div>

        {/* Cart Items Display */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Cart Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ${item.product?.price}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestCartPage
