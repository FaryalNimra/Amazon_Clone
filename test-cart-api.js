// Test script for Cart API endpoints
// Run this with: node test-cart-api.js

const BASE_URL = 'http://localhost:3000' // Adjust if your dev server runs on different port

// Test data
const testUserId = 'test-user-123'
const testProductId = 'test-product-456'
const testProductData = {
  name: 'Test Product',
  description: 'This is a test product for API testing',
  price: 29.99,
  image_url: 'https://via.placeholder.com/300x200?text=Test+Product',
  category: 'Electronics',
  seller_id: 'test-seller-789'
}

// Helper function to make API calls
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    return { status: 'ERROR', data: { error: error.message } }
  }
}

// Test functions
async function testAddToCart() {
  console.log('\n🧪 Testing: Add Item to Cart')
  
  const result = await makeRequest(`${BASE_URL}/api/cart`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      productId: testProductId,
      quantity: 1,
      productData: testProductData
    })
  })
  
  console.log('Status:', result.status)
  console.log('Response:', result.data)
  
  if (result.status === 200) {
    console.log('✅ Add to cart successful!')
    return result.data.cartItem
  } else {
    console.log('❌ Add to cart failed!')
    return null
  }
}

async function testGetCart() {
  console.log('\n🧪 Testing: Get Cart Items')
  
  const result = await makeRequest(`${BASE_URL}/api/cart?userId=${testUserId}`)
  
  console.log('Status:', result.status)
  console.log('Response:', result.data)
  
  if (result.status === 200) {
    console.log('✅ Get cart successful!')
    return result.data.cartItems
  } else {
    console.log('❌ Get cart failed!')
    return []
  }
}

async function testUpdateQuantity(cartItemId) {
  console.log('\n🧪 Testing: Update Cart Item Quantity')
  
  const result = await makeRequest(`${BASE_URL}/api/cart`, {
    method: 'PUT',
    body: JSON.stringify({
      cartItemId: cartItemId,
      quantity: 3
    })
  })
  
  console.log('Status:', result.status)
  console.log('Response:', result.data)
  
  if (result.status === 200) {
    console.log('✅ Update quantity successful!')
  } else {
    console.log('❌ Update quantity failed!')
  }
}

async function testRemoveFromCart(cartItemId) {
  console.log('\n🧪 Testing: Remove Item from Cart')
  
  const result = await makeRequest(`${BASE_URL}/api/cart?cartItemId=${cartItemId}&userId=${testUserId}`, {
    method: 'DELETE'
  })
  
  console.log('Status:', result.status)
  console.log('Response:', result.data)
  
  if (result.status === 200) {
    console.log('✅ Remove from cart successful!')
  } else {
    console.log('❌ Remove from cart failed!')
  }
}

async function testClearCart() {
  console.log('\n🧪 Testing: Clear Entire Cart')
  
  const result = await makeRequest(`${BASE_URL}/api/cart/clear`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId
    })
  })
  
  console.log('Status:', result.status)
  console.log('Response:', result.data)
  
  if (result.status === 200) {
    console.log('✅ Clear cart successful!')
  } else {
    console.log('❌ Clear cart failed!')
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Cart API Tests...')
  console.log('Make sure your Next.js dev server is running on port 3000')
  
  try {
    // Test 1: Add item to cart
    const cartItem = await testAddToCart()
    
    if (cartItem) {
      // Test 2: Get cart items
      await testGetCart()
      
      // Test 3: Update quantity
      await testUpdateQuantity(cartItem.id)
      
      // Test 4: Get cart again to see updated quantity
      await testGetCart()
      
      // Test 5: Remove item
      await testRemoveFromCart(cartItem.id)
      
      // Test 6: Clear cart
      await testClearCart()
      
      // Test 7: Verify cart is empty
      await testGetCart()
    }
    
    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error)
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runTests()
} else {
  // Browser environment
  console.log('This test script is designed to run in Node.js')
  console.log('Run: node test-cart-api.js')
}
