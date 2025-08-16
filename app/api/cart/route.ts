import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart items:', error)
      return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 })
    }

    return NextResponse.json({ cartItems: cartItems || [] })
  } catch (error) {
    console.error('Error in GET /api/cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add item to cart or update quantity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1, productData } = body

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 })
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing cart item:', checkError)
      return NextResponse.json({ error: 'Failed to check cart item' }, { status: 500 })
    }

    let result

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating cart item:', error)
        return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
      }

      result = data
    } else {
      // Insert new cart item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          product_name: productData.name,
          product_description: productData.description,
          product_price: productData.price,
          product_image: productData.image_url,
          product_category: productData.category,
          seller_id: productData.seller_id
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting cart item:', error)
        return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ 
      success: true, 
      cartItem: result,
      message: existingItem ? 'Cart item updated' : 'Item added to cart'
    })
  } catch (error) {
    console.error('Error in POST /api/cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'Cart item ID and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

      if (deleteError) {
        console.error('Error deleting cart item:', deleteError)
        return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Item removed from cart' 
      })
    }

    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) {
      console.error('Error updating cart item quantity:', error)
      return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      cartItem: data,
      message: 'Quantity updated' 
    })
  } catch (error) {
    console.error('Error in PUT /api/cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')
    const userId = searchParams.get('userId')

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 })
    }

    // If userId is provided, ensure user can only delete their own cart items
    let query = supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting cart item:', error)
      return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
