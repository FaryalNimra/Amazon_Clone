const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database tables...')
    console.log('📝 Note: You need to manually run the SQL in Supabase dashboard')
    console.log('📋 Copy the content from create-tables.sql file')
    
    // Test connection
    console.log('🧪 Testing database connection...')
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.log('❌ Connection test failed:', testError.message)
        console.log('💡 Make sure your Supabase project is set up correctly')
      } else {
        console.log('✅ Database connection successful')
      }
      
    } catch (connErr) {
      console.log('❌ Connection error:', connErr.message)
    }
    
    console.log('\n📋 Manual Setup Instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Click on "SQL Editor" in the left sidebar')
    console.log('3. Copy the content from create-tables.sql file')
    console.log('4. Paste it in the SQL editor')
    console.log('5. Click "Run" to execute')
    console.log('6. Check "Table Editor" to see your new tables')
    
    console.log('\n🎯 Tables that will be created:')
    console.log('- buyers (for buyer accounts)')
    console.log('- sellers (for seller accounts)')
    
    console.log('\n✅ After running SQL, your forms will work properly!')
    
  } catch (error) {
    console.error('❌ Setup script error:', error)
  }
}

// Run the setup
setupDatabase()
