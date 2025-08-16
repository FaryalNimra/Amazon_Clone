import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing database connection and schema...')
    
    // Test 1: Basic connection with products table
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: connectionError.message 
      }, { status: 500 })
    }
    
    console.log('✅ Database connection successful')
    
    // Test 2: Check products table count
    try {
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.log('❌ Products count error:', countError)
        return NextResponse.json({
          success: true,
          connection: 'Connected',
          productsTable: {
            exists: true,
            count: 'Error getting count',
            error: countError.message
          }
        })
      }
      
      console.log('✅ Products table accessible, count:', count)
      return NextResponse.json({
        success: true,
        connection: 'Connected',
        productsTable: {
          exists: true,
          accessible: true,
          productCount: count
        }
      })
      
    } catch (countErr: any) {
      console.error('❌ Unexpected error getting products count:', countErr)
      return NextResponse.json({
        success: true,
        connection: 'Connected',
        productsTable: {
          exists: true,
          accessible: true,
          count: 'Error getting count'
        }
      })
    }
    
  } catch (err: any) {
    console.error('❌ API route error:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: err.message 
    }, { status: 500 })
  }
}

