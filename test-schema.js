/**
 * Test Script: Database Schema Verification
 * 
 * This script tests the Supabase connection and verifies that the 'image_url' column
 * exists in the 'products' table. Run this to diagnose schema cache issues.
 * 
 * Prerequisites:
 * 1. Install dotenv: npm install dotenv
 * 2. Set your environment variables in .env.local
 * 
 * Usage:
 * 1. Set your environment variables in .env.local
 * 2. Run: node test-schema.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseSchema() {
  console.log('🧪 Testing Supabase Database Schema...\n')
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return false
    }
    console.log('✅ Connection successful\n')
    
    // Test 2: Check if products table exists
    console.log('2️⃣ Checking products table structure...')
    const { data: structureTest, error: structureError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Table structure check failed:', structureError.message)
      return false
    }
    
    if (structureTest && structureTest.length > 0) {
      const columns = Object.keys(structureTest[0])
      console.log('✅ Products table accessible')
      console.log('📋 Available columns:', columns)
      
      // Check for specific columns
      const requiredColumns = ['id', 'name', 'description', 'category', 'price', 'stock', 'image_url', 'seller_id', 'created_at']
      const missingColumns = requiredColumns.filter(col => !columns.includes(col))
      
      if (missingColumns.length > 0) {
        console.error('❌ Missing required columns:', missingColumns)
        return false
      } else {
        console.log('✅ All required columns present\n')
      }
    } else {
      console.log('ℹ️ Products table is empty (this is normal for new databases)\n')
    }
    
    // Test 3: Test insert with image_url column
    console.log('3️⃣ Testing insert operation with image_url...')
    const testProduct = {
      name: 'Test Product - Schema Verification',
      description: 'This is a test product to verify the database schema',
      category: 'Other',
      price: 9.99,
      stock: 1,
      image_url: 'https://example.com/test-image.jpg',
      seller_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      created_at: new Date().toISOString()
    }
    
    const { data: insertTest, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message)
      
      // Check if this is a schema cache issue
      if (insertError.message.includes('image_url') && insertError.message.includes('schema cache')) {
        console.log('🔄 This appears to be a schema cache issue!')
        console.log('💡 The frontend needs to refresh its schema cache')
        console.log('💡 Try using the "🔄 Test Schema Refresh" button in the seller dashboard')
      }
      
      return false
    }
    
    console.log('✅ Insert test successful')
    console.log('📝 Inserted product:', insertTest)
    
    // Test 4: Clean up test data
    console.log('\n4️⃣ Cleaning up test data...')
    if (insertTest && insertTest.length > 0) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('name', 'Test Product - Schema Verification')
      
      if (deleteError) {
        console.error('⚠️ Cleanup failed:', deleteError.message)
      } else {
        console.log('✅ Test data cleaned up')
      }
    }
    
    console.log('\n🎉 All tests passed! Database schema is working correctly.')
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Database Schema Test...\n')
  
  const success = await testDatabaseSchema()
  
  if (success) {
    console.log('\n✅ Schema verification completed successfully')
    console.log('💡 Your "Add New Product" form should work now')
  } else {
    console.log('\n❌ Schema verification failed')
    console.log('💡 Check the error messages above for guidance')
    console.log('💡 You may need to run the database setup SQL again')
  }
  
  process.exit(success ? 0 : 1)
}

// Run the test
main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
