'use client'

import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Package } from 'lucide-react'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'

export default function CartPage() {
  const { state, removeFromCart, clearCart } = useCart()
  const { items, total, itemCount } = state

  const handleRemoveFromCart = async (itemId: string) => {
    const result = await removeFromCart(itemId)
    if (!result.success) {
      alert(result.error || 'Failed to remove item from cart')
    }
  }

  const handleClearCart = async () => {
    const confirmed = window.confirm('Are you sure you want to clear your cart? This action cannot be undone.')
    if (confirmed) {
      const result = await clearCart()
      if (!result.success) {
        alert(result.error || 'Failed to clear cart')
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-red hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-red rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-lg text-gray-500">({itemCount} items)</span>
          </div>
                     <Link
             href="/"
             className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
           >
             <ArrowLeft className="w-5 h-5 mr-2" />
             Continue Shopping
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image_url || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Category: {item.category}</span>
                              <span>Seller ID: {item.seller_id}</span>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <AddToCartButton
                              product={item}
                              size="sm"
                              showQuantity={true}
                            />
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
                             {/* Cart Actions */}
               <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <button
                       onClick={handleClearCart}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                     >
                       Clear Cart
                     </button>
                     
                     <Link
                       href="/"
                       className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
                     >
                       <ArrowLeft className="w-4 h-4 mr-2" />
                       Back to Shopping
                     </Link>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-sm text-gray-600">
                       Total Items: <span className="font-semibold">{itemCount}</span>
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items):</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${(total + (total * 0.08)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
                             {/* Checkout Button */}
               <button
                 className="w-full bg-primary-red hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center"
               >
                 <CreditCard className="w-5 h-5 mr-2" />
                 Proceed to Checkout
               </button>
               
               {/* Back to Shopping Button */}
               <Link
                 href="/"
                 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center border border-gray-300"
               >
                 <ArrowLeft className="w-5 h-5 mr-2" />
                 Back to Shopping
               </Link>
               
               {/* Additional Info */}
               <div className="text-xs text-gray-500 text-center space-y-2">
                 <div className="flex items-center justify-center space-x-2">
                   <Package className="w-4 h-4" />
                   <span>Free shipping on orders over $50</span>
                 </div>
                 <p>Secure checkout powered by Stripe</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
