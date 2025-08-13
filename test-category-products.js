// Test script to verify products are being fetched correctly
// Run this to see what's happening with the database

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

async function testCategoryProducts() {
  console.log('🧪 Testing Category Products...\n')

  try {
    // Test 1: Check if products table exists and has data
    console.log('1️⃣ Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (productsError) {
      console.error('❌ Products table error:', productsError)
      return false
    }
    
    console.log('✅ Products table accessible')
    console.log(`📦 Found ${products?.length || 0} products`)
    
    if (products && products.length > 0) {
      console.log('\n📋 Sample product structure:')
      console.log(JSON.stringify(products[0], null, 2))
    }
    
    // Test 2: Test category filtering
    console.log('\n2️⃣ Testing category filtering...')
    const { data: electronicsProducts, error: electronicsError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Electronics')
      .limit(3)
    
    if (electronicsError) {
      console.error('❌ Electronics category error:', electronicsError)
    } else {
      console.log(`✅ Electronics category: ${electronicsProducts?.length || 0} products`)
      if (electronicsProducts && electronicsProducts.length > 0) {
        console.log('📱 Sample electronics product:')
        console.log(JSON.stringify(electronicsProducts[0], null, 2))
      }
    }
    
    // Test 3: Test Fashion category
    console.log('\n3️⃣ Testing Fashion category...')
    const { data: fashionProducts, error: fashionError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Fashion')
      .limit(3)
    
    if (fashionError) {
      console.error('❌ Fashion category error:', fashionError)
    } else {
      console.log(`✅ Fashion category: ${fashionProducts?.length || 0} products`)
      if (fashionProducts && fashionProducts.length > 0) {
        console.log('👗 Sample fashion product:')
        console.log(JSON.stringify(fashionProducts[0], null, 2))
      }
    }
    
    // Test 4: Check all available categories
    console.log('\n4️⃣ Checking available categories...')
    const { data: categoryData, error: categoryError } = await supabase
      .from('products')
      .select('category')
    
    if (categoryError) {
      console.error('❌ Category check error:', categoryError)
    } else {
      const uniqueCategories = [...new Set(categoryData?.map(p => p.category) || [])]
      console.log('📂 Available categories:', uniqueCategories)
      
      // Show product count per category
      uniqueCategories.forEach(category => {
        const count = categoryData?.filter(p => p.category === category).length || 0
        console.log(`   ${category}: ${count} products`)
      })
    }
    
    console.log('\n🎯 Category test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Category test failed:', error)
    return false
  }
}

// Run the test
testCategoryProducts()
  .then(success => {
    if (success) {
      console.log('\n✅ Category products test successful!')
      console.log('You can now test the category pages.')
    } else {
      console.log('\n❌ Category products test failed.')
      console.log('Please check the issues above.')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Script crashed:', error)
    process.exit(1)
  })

