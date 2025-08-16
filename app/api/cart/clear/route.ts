import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Clear all cart items for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing cart:', error)
      return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cart cleared successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/cart/clear:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
