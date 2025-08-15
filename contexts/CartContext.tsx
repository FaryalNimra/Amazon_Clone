'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, CartItem, Product } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (product: Product, productId?: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
  buttonLoadingStates: { [key: string]: boolean }
  setButtonLoading: (productId: string, loading: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [buttonLoadingStates, setButtonLoadingStates] = useState<{ [key: string]: boolean }>({})

  const { user } = useAuth()

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0
    return total + (price * item.quantity)
  }, 0)

  // Load cart from local storage on mount (only for authenticated users)
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
        } catch (error) {
          console.error('Error parsing saved cart:', error)
        }
      }
    }
  }, [user])

  // Save cart to local storage whenever it changes (only for authenticated users)
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      if (cartItems.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cartItems))
      } else {
        localStorage.removeItem('cart')
      }
    }
  }, [cartItems, user])

  // Remove database cart loading for now - using localStorage only
  // TODO: Re-enable when cart table is set up

  const setButtonLoading = (productId: string, loading: boolean) => {
    setButtonLoadingStates(prev => ({
      ...prev,
      [productId]: loading
    }))
  }



  const addToCart = async (product: Product, productId?: string) => {
    // Check if user is authenticated
    if (!user) {
      throw new Error('Authentication required to add items to cart')
    }

    const loadingId = productId || product.id.toString()
    setButtonLoading(loadingId, true)

    try {
      // Check if product already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.id.toString())

      if (existingItem) {
        // Update quantity locally
        const newQuantity = existingItem.quantity + 1
        const updatedCart = cartItems.map(item => 
          item.product_id === product.id.toString()
            ? { ...item, quantity: newQuantity }
            : item
        )
        setCartItems(updatedCart)
        console.log('✅ Cart updated successfully (localStorage only)')
      } else {
        // Create new cart item
        const newCartItem: CartItem = {
          user_id: user.id,
          product_id: product.id.toString(),
          quantity: 1,
          product: {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            description: product.description
          }
        }

        // Add to local state immediately
        setCartItems(prev => [...prev, newCartItem])
        console.log('✅ Product added to cart successfully (localStorage only)')
      }
      
      // Note: Database cart table not set up yet - using localStorage fallback
      // TODO: Enable database storage once cart table is created
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setButtonLoading(loadingId, false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    // Check if user is authenticated
    if (!user) {
      throw new Error('Authentication required to update cart')
    }

    setLoading(true)
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      // Update local state immediately
      setCartItems(prev => 
        prev.map(item => 
          item.product_id === productId
            ? { ...item, quantity }
            : item
        )
      )

      // Store in database
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error updating quantity in database:', error)
      }
      
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    // Check if user is authenticated
    if (!user) {
      throw new Error('Authentication required to remove items from cart')
    }

    setLoading(true)
    try {
      // Remove from local state immediately
      setCartItems(prev => prev.filter(item => item.product_id !== productId))

      // Remove from database
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing from cart in database:', error)
      }
      
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    // Check if user is authenticated
    if (!user) {
      throw new Error('Authentication required to clear cart')
    }

    setLoading(true)
    try {
      // Clear local state immediately
      setCartItems([])

      // Clear from database
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error clearing cart in database:', error)
      }
      
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading,
    buttonLoadingStates,
    setButtonLoading
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

