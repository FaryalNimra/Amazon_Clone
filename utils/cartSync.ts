// Utility functions for cart backend synchronization

export interface CartSyncData {
  userId: string
  productId: string
  quantity: number
  productData: {
    name: string
    description: string
    price: number
    image_url: string
    category: string
    seller_id: string
  }
}

// Add item to cart in backend
export async function addToCartBackend(syncData: CartSyncData) {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    })

    if (!response.ok) {
      throw new Error('Failed to sync cart with backend')
    }

    return await response.json()
  } catch (error) {
    console.error('Error syncing cart with backend:', error)
    throw error
  }
}

// Update cart item quantity in backend
export async function updateCartItemBackend(cartItemId: string, quantity: number) {
  try {
    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId, quantity })
    })

    if (!response.ok) {
      throw new Error('Failed to update cart item in backend')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating cart item in backend:', error)
    throw error
  }
}

// Remove cart item from backend
export async function removeCartItemBackend(cartItemId: string, userId?: string) {
  try {
    const url = userId 
      ? `/api/cart?cartItemId=${cartItemId}&userId=${userId}`
      : `/api/cart?cartItemId=${cartItemId}`

    const response = await fetch(url, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to remove cart item from backend')
    }

    return await response.json()
  } catch (error) {
    console.error('Error removing cart item from backend:', error)
    throw error
  }
}

// Clear entire cart in backend
export async function clearCartBackend(userId: string) {
  try {
    const response = await fetch('/api/cart/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart in backend')
    }

    return await response.json()
  } catch (error) {
    console.error('Error clearing cart in backend:', error)
    throw error
  }
}

// Load cart items from backend
export async function loadCartFromBackend(userId: string) {
  try {
    const response = await fetch(`/api/cart?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to load cart from backend')
    }

    const { cartItems } = await response.json()
    return cartItems || []
  } catch (error) {
    console.error('Error loading cart from backend:', error)
    throw error
  }
}

// Sync local cart with backend (for when user logs in)
export async function syncLocalCartWithBackend(userId: string, localCartItems: any[]) {
  try {
    // Load backend cart
    const backendCartItems = await loadCartFromBackend(userId)
    
    // Merge local and backend cart items
    const mergedItems = mergeCartItems(localCartItems, backendCartItems)
    
    // Update backend with merged items
    for (const item of mergedItems) {
      await addToCartBackend({
        userId,
        productId: item.id,
        quantity: item.quantity,
        productData: {
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          category: item.category,
          seller_id: item.seller_id
        }
      })
    }

    return mergedItems
  } catch (error) {
    console.error('Error syncing local cart with backend:', error)
    throw error
  }
}

// Helper function to merge local and backend cart items
function mergeCartItems(localItems: any[], backendItems: any[]) {
  const merged = [...localItems]
  
  for (const backendItem of backendItems) {
    const existingLocalItem = merged.find(item => item.id === backendItem.product_id)
    
    if (existingLocalItem) {
      // Item exists in both, use the higher quantity
      existingLocalItem.quantity = Math.max(existingLocalItem.quantity, backendItem.quantity)
    } else {
      // Item only exists in backend, add it to local
      merged.push({
        id: backendItem.product_id,
        name: backendItem.product_name,
        description: backendItem.product_description,
        price: backendItem.product_price,
        image_url: backendItem.product_image,
        category: backendItem.product_category,
        seller_id: backendItem.seller_id,
        quantity: backendItem.quantity,
        backendId: backendItem.id // Store backend ID for future sync
      })
    }
  }
  
  return merged
}
