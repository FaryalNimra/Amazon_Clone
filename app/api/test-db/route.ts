import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...')
    
    // Test if products table exists and is accessible
    const { data: tableTest, error: tableError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table access error:', tableError)
      return NextResponse.json(
        { success: false, error: 'Table access failed', details: tableError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Products table accessible:', tableTest)
    
    // Test RLS policies
    const { data: policyTest, error: policyError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (policyError) {
      console.error('❌ RLS policy error:', policyError)
      return NextResponse.json(
        { success: false, error: 'RLS policy failed', details: policyError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ RLS policies working:', policyTest)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableTest,
      policyTest
    })

  } catch (error: any) {
    console.error('❌ Database test error:', error)
    return NextResponse.json(
      { success: false, error: 'Database test failed', details: error.message },
      { status: 500 }
    )
  }
}

