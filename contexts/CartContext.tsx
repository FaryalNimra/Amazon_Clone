'use client'

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  seller_id: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'REMOVE_QUANTITY'; payload: string }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        // If item exists, increase quantity
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        }
      } else {
        // If item doesn't exist, add it with quantity 1
        const newItem = { ...action.payload, quantity: 1 }
        const newItems = [...state.items, newItem]
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      )
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'REMOVE_QUANTITY': {
      const existingItem = state.items.find(item => item.id === action.payload)
      
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity by 1
        const updatedItems = state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        }
      } else if (existingItem && existingItem.quantity === 1) {
        // Remove item completely if quantity becomes 0
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload })
      }
      
      return state
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      }
    
    case 'LOAD_CART':
      const newTotal = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: action.payload,
        total: newTotal,
        itemCount: newItemCount
      }
    
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<{ success: boolean; error?: string }>
  removeFromCart: (id: string) => Promise<{ success: boolean; error?: string }>
  updateQuantity: (id: string, quantity: number) => Promise<{ success: boolean; error?: string }>
  removeQuantity: (id: string) => Promise<{ success: boolean; error?: string }>
  clearCart: () => Promise<{ success: boolean; error?: string }>
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const { user, userRole } = useAuth()

  // Load cart from backend and localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Only load cart if user is authenticated and is a buyer
        if (user && userRole === 'buyer') {
          // First try to load from localStorage for immediate display
          if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem(`cart_${user.id}`)
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart)
                // Only update if cart data actually changed
                if (JSON.stringify(parsedCart) !== JSON.stringify(state.items)) {
                  dispatch({ type: 'LOAD_CART', payload: parsedCart })
                }
              } catch (error) {
                console.error('Error loading cart from localStorage:', error)
              }
            }
          }

          // TODO: Load from backend when user is authenticated
          // This will be implemented when we have user authentication
          // const userId = getCurrentUserId()
          // if (userId) {
          //   const response = await fetch(`/api/cart?userId=${userId}`)
          //   if (response.ok) {
          //     const { cartItems } = await response.json()
          //     dispatch({ type: 'LOAD_CART', payload: cartItems })
          //   }
          // }
        } else {
          // Clear cart if user is not authenticated or not a buyer
          if (state.items.length > 0) {
            dispatch({ type: 'CLEAR_CART' })
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }

    loadCart()
  }, [user?.id, userRole]) // Only depend on user ID and role, not the entire user object

  // Save cart to localStorage whenever it changes (only for authenticated buyers)
  useEffect(() => {
    if (typeof window !== 'undefined' && user && userRole === 'buyer') {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(state.items))
    }
  }, [state.items, user, userRole])

  // Clear cart when user logs out or changes role
  useEffect(() => {
    if (!user || userRole !== 'buyer') {
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [user, userRole])

  const addToCart = async (item: Omit<CartItem, 'quantity'>): Promise<{ success: boolean; error?: string }> => {
    console.log('🔍 CartContext: addToCart called with item:', item)
    console.log('🔍 CartContext: user:', user)
    console.log('🔍 CartContext: userRole:', userRole)
    
    // Check authentication and role
    if (!user) {
      console.log('❌ CartContext: No user found, returning error')
      return { success: false, error: 'You must be signed in to add items to cart' }
    }

    if (userRole !== 'buyer') {
      console.log('❌ CartContext: User is not a buyer, returning error')
      return { success: false, error: 'Only buyers can add items to cart' }
    }

    console.log('✅ CartContext: User authenticated and is buyer, proceeding with add to cart')
    
    // Update local state immediately for better UX
    dispatch({ type: 'ADD_ITEM', payload: item as CartItem })
    console.log('✅ CartContext: Item added to cart successfully')
    
    // TODO: Sync with backend when user is authenticated
    // try {
    //   const userId = getCurrentUserId()
    //   if (userId) {
    //     await fetch('/api/cart', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         userId,
    //         productId: item.id,
    //         quantity: 1,
    //         productData: item
    //       })
    //     })
    //   }
    // } catch (error) {
    //   console.error('Error syncing cart with backend:', error)
    // }

    return { success: true }
  }

  const removeFromCart = async (id: string): Promise<{ success: boolean; error?: string }> => {
    // Check authentication and role
    if (!user) {
      return { success: false, error: 'You must be signed in to modify cart' }
    }

    if (userRole !== 'buyer') {
      return { success: false, error: 'Only buyers can modify cart' }
    }

    // Update local state immediately
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    
    // TODO: Sync with backend when user is authenticated
    // try {
    //   const userId = getCurrentUserId()
    //   if (userId) {
    //     const cartItem = state.items.find(item => item.id === id)
    //     if (cartItem) {
    //       await fetch(`/api/cart?cartItemId=${cartItem.backendId}&userId=${userId}`, {
    //         method: 'DELETE'
    //       })
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error syncing cart removal with backend:', error)
    // }

    return { success: true }
  }

  const updateQuantity = async (id: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    // Check authentication and role
    if (!user) {
      return { success: false, error: 'You must be signed in to modify cart' }
    }

    if (userRole !== 'buyer') {
      return { success: false, error: 'Only buyers can modify cart' }
    }

    // Update local state immediately
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    
    // TODO: Sync with backend when user is authenticated
    // try {
    //   const userId = getCurrentUserId()
    //   if (userId) {
    //     const cartItem = state.items.find(item => item.id === id)
    //     if (cartItem) {
    //       await fetch('/api/cart', {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //           cartItemId: cartItem.backendId,
    //           quantity
    //         })
    //       })
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error syncing quantity update with backend:', error)
    // }

    return { success: true }
  }

  const removeQuantity = async (id: string): Promise<{ success: boolean; error?: string }> => {
    // Check authentication and role
    if (!user) {
      return { success: false, error: 'You must be signed in to modify cart' }
    }

    if (userRole !== 'buyer') {
      return { success: false, error: 'Only buyers can modify cart' }
    }

    // Update local state immediately
    dispatch({ type: 'REMOVE_QUANTITY', payload: id })
    
    // TODO: Sync with backend when user is authenticated
    // try {
    //   const userId = getCurrentUserId()
    //   if (userId) {
    //     const cartItem = state.items.find(item => item.id === id)
    //     if (cartItem) {
    //       const newQuantity = cartItem.quantity - 1
    //       if (newQuantity <= 0) {
    //         // Item will be removed by the reducer
    //         await fetch(`/api/cart?cartItemId=${cartItem.backendId}&userId=${userId}`, {
    //           method: 'DELETE'
    //       })
    //       } else {
    //         await fetch('/api/cart', {
    //           method: 'PUT',
    //           headers: { 'Content-Type': 'application/json' },
    //           body: JSON.stringify({
    //             cartItemId: cartItem.backendId,
    //             quantity: newQuantity
    //           })
    //         })
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error syncing quantity removal with backend:', error)
    // }

    return { success: true }
  }

  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    // Check authentication and role
    if (!user) {
      return { success: false, error: 'You must be signed in to modify cart' }
    }

    if (userRole !== 'buyer') {
      return { success: false, error: 'Only buyers can modify cart' }
    }

    // Update local state immediately
    dispatch({ type: 'CLEAR_CART' })
    
    // TODO: Sync with backend when user is authenticated
    // try {
    //   const userId = getCurrentUserId()
    //   if (userId) {
    //     await fetch('/api/cart/clear', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ userId })
    //     })
    //   }
    // } catch (error) {
    //   console.error('Error syncing cart clear with backend:', error)
    // }

    return { success: true }
  }

  const isInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id)
  }

  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    removeQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
