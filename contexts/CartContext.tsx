'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, CartItem, Product } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (product: Product) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
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
  const { user } = useAuth()

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0
    return total + (price * item.quantity)
  }, 0)

  // Fetch cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems()
    } else {
      setCartItems([])
    }
  }, [user])

  const fetchCartItems = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) {
        console.error('Error fetching cart items:', error)
        return
      }

      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product: Product) => {
    if (!user) {
      alert('Please sign in to add items to cart')
      return
    }

    setLoading(true)
    try {
      // Check if product already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.id)

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + 1
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('user_id', user.id)
          .eq('product_id', product.id)

        if (error) {
          console.error('Error updating cart:', error)
          return
        }

        // Update local state
        setCartItems(prev => 
          prev.map(item => 
            item.product_id === product.id 
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          })

        if (error) {
          console.error('Error adding to cart:', error)
          return
        }

        // Refresh cart items
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return

    setLoading(true)
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error updating quantity:', error)
        return
      }

      // Update local state
      setCartItems(prev => 
        prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity }
            : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: number) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing from cart:', error)
        return
      }

      // Update local state
      setCartItems(prev => prev.filter(item => item.product_id !== productId))
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error clearing cart:', error)
        return
      }

      setCartItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
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
    loading
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

