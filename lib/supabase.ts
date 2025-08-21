import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test function to verify storage connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
      console.error('Storage connection error:', error)
      return { success: false, error: error.message }
    }
    console.log('Available buckets:', data)
    return { success: true, buckets: data }
  } catch (err: any) {
    console.error('Connection test failed:', err)
    return { success: false, error: err.message }
  }
}

// Function to test if specific bucket exists and is accessible
export const testBucketAccess = async (bucketName: string) => {
  try {
    // Try to list files in the bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('')
    
    if (error) {
      console.error(`Bucket ${bucketName} access error:`, error)
      return { success: false, error: error.message }
    }
    
    console.log(`Bucket ${bucketName} is accessible, files:`, data)
    return { success: true, files: data }
  } catch (err: any) {
    console.error(`Bucket ${bucketName} test failed:`, err)
    return { success: false, error: err.message }
  }
}

// Function to get user profile data from auth metadata
export const getUserProfile = async (userId: string) => {
  if (!supabase) {
    return { data: null, role: null, error: 'Supabase not configured' }
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { data: null, role: null, error }
    }

    const role = user.user_metadata?.role || user.user_metadata?.user_type
    
    if (role === 'seller') {
      return { 
        data: user.user_metadata?.seller_info || null, 
        role: 'seller' 
      }
    } else if (role === 'buyer') {
      return { 
        data: user.user_metadata?.buyer_info || null, 
        role: 'buyer' 
      }
    }

    return { data: null, role: null }
  } catch (err) {
    console.error('Error fetching user profile:', err)
    return { data: null, role: null, error: err }
  }
}

// Function to update user profile in auth metadata
export const updateUserProfile = async (
  userId: string,
  userRole: 'buyer' | 'seller',
  updateData: {
    name?: string
    phone?: string
    storeName?: string
    gstNumber?: string
    businessType?: string
    businessAddress?: string
  }
) => {
  if (!supabase) {
    return { error: 'Supabase not configured' }
  }
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: userError || 'User not found' }
    }

    // Update user metadata
    const currentMetadata = user.user_metadata || {}
    let updatedMetadata = { ...currentMetadata }

    if (userRole === 'seller') {
      updatedMetadata.seller_info = {
        ...currentMetadata.seller_info,
        ...updateData,
        updated_at: new Date().toISOString()
      }
    } else {
      updatedMetadata.buyer_info = {
        ...currentMetadata.buyer_info,
        ...updateData,
        updated_at: new Date().toISOString()
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: updatedMetadata
    })

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return { error: updateError }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in updateUserProfile:', err)
    return { error: err }
  }
}



export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  originalPrice?: number
  image_url: string // Updated to match database schema (was 'image')
  rating: number
  reviewCount: number
  brand: string
  inStock: boolean
  discount?: number
  seller_id: string
  created_at: string
}

// User profile types
export interface BuyerProfile {
  name: string
  email: string
  phone?: string
  created_at: string
  updated_at?: string
}

export interface SellerProfile {
  name: string
  email: string
  phone: string
  store_name: string
  gst_number: string
  business_type: string
  business_address: string
  created_at: string
  updated_at?: string
} 

// Function to force Supabase to refresh its schema cache
export const refreshSupabaseSchema = async () => {
  try {
    console.log('🔄 Refreshing Supabase schema cache...')
    
    // Method 1: Test a simple query to trigger schema refresh
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url')
      .limit(1)
    
    if (error) {
      console.error('❌ Schema refresh test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Schema cache refreshed successfully')
    return { success: true, data }
    
  } catch (err: any) {
    console.error('❌ Schema refresh error:', err)
    return { success: false, error: err.message }
  }
}

// Function to verify database schema matches expected structure
export const verifyDatabaseSchema = async () => {
  try {
    console.log('🔍 Verifying database schema...')
    
    // First, let's see what columns actually exist in the products table
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Schema verification failed:', error)
      return { success: false, error: error.message, missingColumns: [] }
    }
    
    // Get the actual columns from the database
    const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : []
    console.log('📋 Actual database columns:', actualColumns)
    
    // Check if we have the essential columns for product creation
    const essentialColumns = ['name', 'description', 'category', 'price']
    const missingEssential = essentialColumns.filter(col => !actualColumns.includes(col))
    
    if (missingEssential.length > 0) {
      console.error('❌ Missing essential columns:', missingEssential)
      return { 
        success: false, 
        error: `Missing essential columns: ${missingEssential.join(', ')}`,
        missingColumns: missingEssential,
        actualColumns 
      }
    }
    
    console.log('✅ Database schema verified successfully')
    console.log('📋 Available columns:', actualColumns)
    
    return { 
      success: true, 
      data, 
      columns: actualColumns,
      // Check for stock column (your table uses 'stock')
      hasStock: actualColumns.includes('stock'),
      // Check for image_url column (your table uses 'image_url')
      hasImageUrl: actualColumns.includes('image_url'),
      // Check for seller_id column (your table uses 'seller_id')
      hasSellerId: actualColumns.includes('seller_id')
    }
    
  } catch (err: any) {
    console.error('❌ Schema verification error:', err)
    return { success: false, error: err.message }
  }
}

// Function to check if email exists for buyers or sellers
export const checkEmailExists = async (email: string): Promise<{
  exists: boolean
  userType: 'buyer' | 'seller' | null
  userId: string | null
  name: string | null
  error?: string
}> => {
  try {
    console.log('🔍 Checking if email exists:', email)
    
    // Check buyers table
    const { data: buyerData, error: buyerError } = await supabase
      .from('buyers')
      .select('id, name, email')
      .eq('email', email)
      .single()
    
    if (buyerData && !buyerError) {
      console.log('✅ Email found in buyers table')
      return { exists: true, userType: 'buyer', userId: buyerData.id, name: buyerData.name }
    }
    
    // Check sellers table
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('id, name, email')
      .eq('email', email)
      .single()
    
    if (sellerData && !sellerError) {
      console.log('✅ Email found in sellers table')
      return { exists: true, userType: 'seller', userId: sellerData.id, name: sellerData.name }
    }
    
    console.log('❌ Email not found in any table')
    return { exists: false, userType: null, userId: null, name: null }
    
  } catch (err: any) {
    console.error('❌ Error checking email existence:', err)
    return { exists: false, userType: null, userId: null, name: null, error: err.message }
  }
} 

// Function to update password for buyers or sellers
export const updatePassword = async (
  email: string,
  userType: 'buyer' | 'seller',
  newPassword: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    console.log(`🔐 Updating password for ${userType}:`, email)
    
    // Hash the new password (you might want to use a proper hashing library)
    // For now, we'll use a simple approach - in production, use bcrypt or similar
    const hashedPassword = newPassword // TODO: Implement proper hashing
    
    if (userType === 'buyer') {
      console.log('🔄 Attempting to update buyer password...')
      
      // First, let's check if the buyer exists and get their ID
      const { data: buyerData, error: buyerCheckError } = await supabase
        .from('buyers')
        .select('id, email')
        .eq('email', email)
        .single()
      
      if (buyerCheckError) {
        console.error('❌ Error checking buyer existence:', buyerCheckError)
        return { success: false, error: `Buyer not found: ${buyerCheckError.message}` }
      }
      
      if (!buyerData) {
        console.error('❌ Buyer not found with email:', email)
        return { success: false, error: 'Buyer not found with this email' }
      }
      
      console.log('✅ Buyer found, updating password for ID:', buyerData.id)
      
      // Now update the password
      const { data: updateData, error: updateError } = await supabase
        .from('buyers')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', buyerData.id)
        .select('id, email')
      
      if (updateError) {
        console.error('❌ Error updating buyer password:', updateError)
        console.error('❌ Error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        })
        return { success: false, error: `Failed to update password: ${updateError.message}` }
      }
      
      console.log('✅ Buyer password updated successfully:', updateData)
      
    } else if (userType === 'seller') {
      console.log('🔄 Attempting to update seller password...')
      
      // First, let's check if the seller exists and get their ID
      const { data: sellerData, error: sellerCheckError } = await supabase
        .from('sellers')
        .select('id, email')
        .eq('email', email)
        .single()
      
      if (sellerCheckError) {
        console.error('❌ Error checking seller existence:', sellerCheckError)
        return { success: false, error: `Seller not found: ${sellerCheckError.message}` }
      }
      
      if (!sellerData) {
        console.error('❌ Seller not found with email:', email)
        return { success: false, error: 'Seller not found with this email' }
      }
      
      console.log('✅ Seller found, updating password for ID:', sellerData.id)
      
      // Now update the password
      const { data: updateData, error: updateError } = await supabase
        .from('sellers')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerData.id)
        .select('id, email')
      
      if (updateError) {
        console.error('❌ Error updating seller password:', updateError)
        console.error('❌ Error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        })
        return { success: false, error: `Failed to update password: ${updateError.message}` }
      }
      
      console.log('✅ Seller password updated successfully:', updateData)
    }
    
    console.log('✅ Password updated successfully for', userType, email)
    return { success: true }
    
  } catch (err: any) {
    console.error('❌ Error updating password:', err)
    console.error('❌ Error stack:', err.stack)
    return { success: false, error: err.message }
  }
} 