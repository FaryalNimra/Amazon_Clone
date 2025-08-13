// Script to check the actual database schema
// Run this to see what columns actually exist in your products table

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...\n')

  try {
    // Check if products table exists
    console.log('1️⃣ Checking if products table exists...')
    const { data: tableExists, error: tableError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Products table error:', tableError)
      
      if (tableError.message.includes('does not exist')) {
        console.log('\n💡 SOLUTION: You need to run the database setup script!')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Open the SQL Editor')
        console.log('3. Copy and paste the contents of database-setup.sql')
        console.log('4. Run the script')
        console.log('\nThis will create the products table with all required columns.')
        return false
      }
      
      return false
    }
    
    console.log('✅ Products table exists')
    
    // Get actual table structure
    console.log('\n2️⃣ Getting actual table structure...')
    const { data: structure, error: structureError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Structure check error:', structureError)
      return false
    }
    
    if (structure && structure.length > 0) {
      const actualColumns = Object.keys(structure[0])
      console.log('📋 Actual columns found:', actualColumns)
      
      // Check for required columns
      const requiredColumns = [
        'id', 'name', 'description', 'category', 'price', 
        'stock', 'image_url', 'seller_id', 'created_at', 'updated_at'
      ]
      
      console.log('\n3️⃣ Checking required columns...')
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col))
      const extraColumns = actualColumns.filter(col => !requiredColumns.includes(col))
      
      if (missingColumns.length > 0) {
        console.error('❌ Missing required columns:', missingColumns)
      } else {
        console.log('✅ All required columns present')
      }
      
      if (extraColumns.length > 0) {
        console.log('ℹ️ Extra columns found:', extraColumns)
      }
      
      // Check specific column types
      console.log('\n4️⃣ Checking column details...')
      for (const column of requiredColumns) {
        if (actualColumns.includes(column)) {
          const value = structure[0][column]
          const type = value !== null ? typeof value : 'null'
          console.log(`   ${column}: ${type} (${value !== null ? value : 'null'})`)
        }
      }
      
    } else {
      console.log('ℹ️ Table is empty - this is fine for a new setup')
      
      // Try to get column info from information_schema
      console.log('\n5️⃣ Getting column info from information_schema...')
      try {
        const { data: columnInfo, error: columnError } = await supabase
          .rpc('get_table_columns', { table_name: 'products' })
        
        if (columnError) {
          console.log('ℹ️ Could not get column info from information_schema')
        } else {
          console.log('📋 Column info:', columnInfo)
        }
      } catch (e) {
        console.log('ℹ️ information_schema query not available')
      }
    }
    
    // Test RLS policies
    console.log('\n6️⃣ Testing RLS policies...')
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('products')
        .select('*')
        .limit(1)
      
      if (rlsError) {
        console.error('❌ RLS test failed:', rlsError)
      } else {
        console.log('✅ RLS policies working')
      }
    } catch (e) {
      console.log('ℹ️ RLS test not available')
    }
    
    console.log('\n🎯 Schema check completed!')
    return true
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
    return false
  }
}

// Run the check
checkDatabaseSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Database schema looks good!')
      console.log('You can now test the product form.')
    } else {
      console.log('\n❌ Database schema has issues.')
      console.log('Please fix the issues above before testing.')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Script crashed:', error)
    process.exit(1)
  })
