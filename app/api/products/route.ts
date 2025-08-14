import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching products...')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    
    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    // Execute query
    const { data: products, error } = await query
    
    if (error) {
      console.error('❌ Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ Successfully fetched ${products?.length || 0} products`)
    
    return NextResponse.json({
      success: true,
      products: products || [],
      total: products?.length || 0,
      category: category || 'all'
    })
    
  } catch (error: any) {
    console.error('❌ Unexpected error in products API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, price, stock, image_url, seller_id } = body
    
    console.log('🔍 Adding new product:', { name, category, price })
    
    // Validate required fields
    if (!name || !category || !price || !stock) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, price, stock' },
        { status: 400 }
      )
    }
    
    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          category,
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url,
          seller_id
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error adding product:', error)
      return NextResponse.json(
        { error: 'Failed to add product', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Product added successfully:', product.id)
    
    return NextResponse.json({ 
      message: 'Product created successfully', 
      product: product 
    })
    
  } catch (error: any) {
    console.error('❌ Unexpected error in products POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
