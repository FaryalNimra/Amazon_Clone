import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  // Only log error in browser, not during build
  console.error('Missing Supabase environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Export the client
export { supabase }

// Function to test Supabase email configuration
export const testEmailConfiguration = async () => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }
  
  try {
    // Test if we can access Supabase
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: 'Supabase connection failed' }
    }
    
    console.log('Supabase connection successful')
    return { success: true, message: 'Supabase is properly configured' }
  } catch (err) {
    console.error('Supabase test error:', err)
    return { success: false, error: 'Supabase test failed' }
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

// Cart table types
export interface CartItem {
  id?: number
  user_id: string
  product_id: number
  quantity: number
  added_at?: string
  product?: {
    id: number
    name: string
    price: number
    image: string
    description: string
  }
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  brand: string
  inStock: boolean
  discount?: number
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