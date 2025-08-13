// Simple test script to verify Supabase bucket connection
// Run this in your browser console or create a test page

const testBucketConnection = async () => {
  try {
    console.log('🔍 Testing bucket connection...')
    
    // Test 1: List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return false
    }
    
    console.log('📦 Available buckets:', buckets)
    
    // Test 2: Check if our bucket exists
    const productImagesBucket = buckets?.find(b => b.id === 'product-images')
    console.log('🎯 Product-images bucket found:', productImagesBucket)
    
    // Test 3: Try to access the bucket
    if (productImagesBucket) {
      const { data: files, error: filesError } = await supabase.storage
        .from('product-images')
        .list('')
      
      if (filesError) {
        console.error('❌ Error accessing bucket:', filesError)
        return false
      } else {
        console.log('✅ Bucket accessible, files:', files)
        return true
      }
    } else {
      console.error('❌ Product-images bucket not found')
      return false
    }
    
  } catch (error) {
    console.error('❌ Storage test failed:', error)
    return false
  }
}

// Run the test
testBucketConnection()







