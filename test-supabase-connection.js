// Test Supabase Connection and Auth Service
const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = 'https://lroczysrywslknzhmxaz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyb2N6eXNyeXdzbGtuemhteGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5NzUsImV4cCI6MjA3MDIwNjk3NX0.Ls80jXIJxh112YC9p8F_nk5I3He0b5TgQ6_I8eWgY4SY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.log('❌ Storage connection failed:', bucketError.message)
    } else {
      console.log('✅ Storage connection successful')
    }
    
    // Test 2: Auth service status
    console.log('\n2️⃣ Testing auth service...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('❌ Auth service error:', authError.message)
    } else {
      console.log('✅ Auth service working')
    }
    
    // Test 3: Try to create a test user (this will fail but show us the exact error)
    console.log('\n3️⃣ Testing user creation...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User',
          phone: '1234567890'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ User creation failed:', signUpError.message)
      console.log('🔍 Error details:', signUpError)
    } else {
      console.log('✅ User creation successful (test user created)')
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

// Run the test
testSupabaseConnection()
