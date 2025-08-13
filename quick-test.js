// Quick Test - Check if new API key works
const { createClient } = require('@supabase/supabase-js')

// Get environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 QUICK API KEY TEST')
console.log('=====================')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 'NOT FOUND')
console.log('Key starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT FOUND')

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Environment variables missing!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function quickTest() {
  try {
    console.log('\n🧪 Testing connection...')
    
    // Test 1: Basic connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.log('❌ Storage failed:', bucketError.message)
    } else {
      console.log('✅ Storage working!')
    }
    
    // Test 2: Database connection
    const { data: dbTest, error: dbError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)
    
    if (dbError) {
      console.log('❌ Database failed:', dbError.message)
    } else {
      console.log('✅ Database working!')
    }
    
    // Test 3: Auth service
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('❌ Auth failed:', authError.message)
    } else {
      console.log('✅ Auth working!')
    }
    
    console.log('\n🎯 RESULT:')
    if (!bucketError && !dbError && !authError) {
      console.log('✅ ALL SERVICES WORKING! Sign up should work now!')
    } else {
      console.log('❌ Some services still failing. Check your API key.')
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

quickTest()
