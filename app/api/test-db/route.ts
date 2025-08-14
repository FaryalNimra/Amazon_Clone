import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing database connection and schema...')
    
    // Test 1: Basic connection
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
    
    // Test 2: Check if profiles table exists
    try {
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profilesError) {
        console.log('❌ Profiles table error:', profilesError)
        return NextResponse.json({
          success: true,
          connection: 'Connected',
          profilesTable: {
            exists: false,
            error: profilesError.message,
            code: profilesError.code,
            details: profilesError.details,
            hint: profilesError.hint
          }
        })
      }
      
      console.log('✅ Profiles table exists and is accessible')
      return NextResponse.json({
        success: true,
        connection: 'Connected',
        profilesTable: {
          exists: true,
          accessible: true
        }
      })
      
    } catch (profilesErr: any) {
      console.error('❌ Unexpected error checking profiles table:', profilesErr)
      return NextResponse.json({
        success: true,
        connection: 'Connected',
        profilesTable: {
          exists: false,
          error: profilesErr.message
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

