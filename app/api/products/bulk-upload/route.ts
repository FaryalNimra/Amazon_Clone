import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Create authenticated Supabase client using the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is a seller by verifying seller info in user metadata
    const sellerInfo = user.user_metadata?.seller_info
    if (!sellerInfo || !sellerInfo.name) {
      return NextResponse.json(
        { error: 'User is not a seller. Please make sure you have a seller account.' },
        { status: 403 }
      )
    }

    // Get request body
    const { products } = await request.json()
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided' },
        { status: 400 }
      )
    }

    // Validate products
    const validationErrors: string[] = []
    products.forEach((product: any, index: number) => {
      if (!product.name?.trim()) {
        validationErrors.push(`Row ${index + 1}: Name is required`)
      }
      if (!product.description?.trim()) {
        validationErrors.push(`Row ${index + 1}: Description is required`)
      }
      if (!product.category?.trim()) {
        validationErrors.push(`Row ${index + 1}: Category is required`)
      }
      if (!product.price || product.price <= 0) {
        validationErrors.push(`Row ${index + 1}: Price must be greater than 0`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Process categories - check if they exist, create if they don't
    const uniqueCategories = Array.from(new Set(products.map((p: any) => p.category.trim())))
    
    for (const categoryName of uniqueCategories) {
      // Check if category exists
      const { data: existingCategory } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', categoryName)
        .single()

      // If category doesn't exist, create it
      if (!existingCategory) {
        const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        await supabase
          .from('product_categories')
          .insert({
            name: categoryName,
            description: `${categoryName} products`,
            slug: slug
          })
      }
    }

    // Prepare products for insertion
    const productsToInsert = products.map((product: any) => ({
      name: product.name.trim(),
      description: product.description.trim(),
      category: product.category.trim(),
      price: parseFloat(product.price),
      stock: product.stock || 10, // Use provided stock or default to 10
      image_url: product.image_url?.trim() || null,
      seller_id: user.id, // Use the user's ID as seller_id
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert products in batches (Supabase has a limit on single insert)
    const batchSize = 100
    const insertedProducts = []
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize)
      
      const { data: batchData, error: batchError } = await supabase
        .from('products')
        .insert(batch)
        .select()

      if (batchError) {
        console.error('Batch insert error:', batchError)
        return NextResponse.json(
          { error: 'Failed to insert products', details: batchError.message },
          { status: 500 }
        )
      }

      if (batchData) {
        insertedProducts.push(...batchData)
      }
    }

    return NextResponse.json({
      message: 'Products uploaded successfully',
      count: insertedProducts.length,
      products: insertedProducts,
      seller_name: sellerInfo.name
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
