'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/contexts/ModalContext'
import { supabase } from '@/lib/supabase'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  User,
  BarChart3,
  Calendar,
  Mail,
  Home,
  Edit3,
  Upload,
  Tag,
  DollarSign,
  Layers,
  Eye,
  CheckCircle,
  RotateCcw,
  Truck,
  XCircle,
  FileText,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Download,
  Percent,
  Zap,
  Megaphone,
  Gift,
  MessageSquare,
  Star,
  Award,
  Shield,
  CreditCard,
  Truck as TruckIcon,
  Receipt,
  Bell,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Users,
  MessageCircle,
  Star as StarIcon,
  X,
  Save,
  Image
} from 'lucide-react'
import BulkProductUpload from '@/components/BulkProductUpload'

interface SellerData {
  id: string
  name: string
  email: string
  store_name: string
  business_type: string
  created_at: string
  total_products: number
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  image_url: string | null
  seller_id: string
  created_at: string
  updated_at: string
}

interface ProductModalData {
  isOpen: boolean
  mode: 'view' | 'edit' | 'delete'
  product: Product | null
}

interface ProductForm {
  name: string
  description: string
  category: string
  price: number
  stock: number
  image: File | null
  imageUrl: string
  useImageUrl: boolean
}


const SellerDashboard: React.FC = () => {
  const { openSellerSignInModal } = useModal()
  const router = useRouter()
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Custom authentication state
  const [user, setUser] = useState<any>(null)
  
  // Product form state
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    image: null,
    imageUrl: '',
    useImageUrl: false
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Product management state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [recentlyUploaded, setRecentlyUploaded] = useState<string[]>([])
  const [productModal, setProductModal] = useState<ProductModalData>({
    isOpen: false,
    mode: 'view',
    product: null
  })
  const [editForm, setEditForm] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    image: null,
    imageUrl: '',
    useImageUrl: false
  })
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Categories for products
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Beauty',
    'Toys & Games',
    'Automotive',
    'Food & Beverages',
    'Jewelry & Accessories',
    'Art & Collectibles',
    'Pet Supplies',
    'Office & School',
    'Baby & Kids',
    'Tools & Hardware'
  ]
  


  // Using centralized Supabase client from lib/supabase.ts


  useEffect(() => {
    // Add dashboard-active class to body and html to hide scrollbars
    document.body.classList.add('dashboard-active')
    document.documentElement.classList.add('dashboard-active')
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.classList.remove('dashboard-active')
      document.documentElement.classList.remove('dashboard-active')
    }
  }, [])

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Get user from localStorage (custom authentication)
      const storedUser = localStorage.getItem('userData')
      if (!storedUser) {
        openSellerSignInModal()
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)

        // Check if user is a seller
        if (userData.role !== 'seller') {
          // User is not a seller, redirect to home with message
          router.push('/?message=You are currently signed in as a buyer. Please log out before registering or logging in as a seller.')
          return
        }

        // Set seller data from user session
        setSellerData({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          store_name: userData.storeName || 'My Store',
          business_type: userData.businessType || 'individual',
          created_at: new Date().toISOString(),
          total_products: 0 // This would come from database in real app
        })
        
        setLoading(false)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        openSellerSignInModal()
      }
    }

    checkUserAndRedirect()
  }, [router, openSellerSignInModal])

  // Fetch products when user is authenticated
  useEffect(() => {
    if (user?.id && activeTab === 'manage-products') {
      fetchProducts()
    }
  }, [user?.id, activeTab])

  // Custom logout function
  const handleLogout = () => {
    console.log('🔄 SellerDashboard: Starting logout process...')
    
    // Clear localStorage and state
    localStorage.removeItem('userData')
    setUser(null)
    setSellerData(null)
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('userDataChanged'))
    }
    
    console.log('✅ SellerDashboard: Logout completed, redirecting to home...')
    router.push('/')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'price' || name === 'stock') {
      setProductForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file.')
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image file size must be less than 10MB.')
        return
      }
      
      setProductForm(prev => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
      setFormError('') // Clear any previous errors
    }
  }

  const removeImage = () => {
    setProductForm(prev => ({ ...prev, image: null, imageUrl: '', useImageUrl: false }))
    setImagePreview(null)
    setFormError('') // Clear any errors
  }

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      image: null,
      imageUrl: '',
      useImageUrl: false
    })
    setImagePreview(null)
    setFormError('')
  }

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `sellers/${user?.id}/products/${fileName}`
      
      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('❌ Storage upload error:', error)
        throw new Error('Failed to upload image to storage.')
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      
      return publicUrl
      
    } catch (error: any) {
      console.error('❌ Image upload failed:', error)
      throw error
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation check
    if (!productForm.name.trim()) {
      setFormError('Product name is required.')
      return
    }

    if (!productForm.description.trim()) {
      setFormError('Product description is required.')
      return
    }

    if (!productForm.category) {
      setFormError('Please select a category.')
      return
    }

    if (productForm.price <= 0) {
      setFormError('Price must be greater than 0.')
      return
    }

    if (productForm.stock < 0) {
      setFormError('Stock cannot be negative.')
      return
    }

    if (productForm.useImageUrl && !productForm.imageUrl.trim()) {
      setFormError('Please provide a valid image URL.')
      return
    }

    if (!productForm.useImageUrl && !productForm.image) {
      setFormError('Please upload an image or provide an image URL.')
      return
    }

    // Confirm submission
    const confirmed = window.confirm(
      `Are you sure you want to add "${productForm.name}" to your store?\n\n` +
      `Price: $${productForm.price.toFixed(2)}\n` +
      `Category: ${productForm.category}\n` +
      `Stock: ${productForm.stock}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    // User authentication check
    if (!user) {
      setFormError('User not authenticated.')
      setIsSubmitting(false)
      return
    }

    try {
      // Check if product with same name already exists for this seller
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('name', productForm.name.trim())
        .eq('seller_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error checking existing product:', checkError)
        throw new Error(`Database error: ${checkError.message}`)
      }

      if (existingProduct) {
        setFormError(`A product with the name "${productForm.name}" already exists in your store.`)
        setIsSubmitting(false)
        return
      }

      // Handle image upload if file is selected
      let finalImageUrl: string | null = productForm.useImageUrl ? productForm.imageUrl.trim() : null
      
      if (!productForm.useImageUrl && productForm.image) {
        finalImageUrl = await uploadImageToStorage(productForm.image)
        if (!finalImageUrl) {
          throw new Error('Failed to upload image. Please try again.')
        }
      }

      // Prepare product data for database
      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: productForm.price,
        stock: productForm.stock,
        image_url: finalImageUrl,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert product into database
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Database insert error:', insertError)
        throw new Error(insertError.message || 'Failed to add product to database.')
      }

      // Success
      setToastMessage(`Product "${productForm.name}" added successfully!`)
      setShowSuccessToast(true)
      
      // Reset form
      resetForm()
      
      // Update seller data to reflect new product count
      if (sellerData) {
        setSellerData(prev => prev ? { ...prev, total_products: prev.total_products + 1 } : null)
      }

      // Auto-hide success toast after 3 seconds
      setTimeout(() => setShowSuccessToast(false), 3000)
      
      // Automatically switch to manage-products tab to show the new product
      setActiveTab('manage-products')
      
      // Refresh products list to show the newly added product
      fetchProducts()

    } catch (error: any) {
      console.error('❌ Error adding product:', error)
      setFormError(error.message || 'An unexpected error occurred. Please try again.')
      setToastMessage(error.message || 'Failed to add product.')
      setShowErrorToast(true)
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwitchToBuyerMode = () => {
    localStorage.removeItem('user')
    setUser(null)
    setSellerData(null)
    router.push('/')
  }

  const fetchProducts = async () => {
    if (!user?.id) return
    
    setProductsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setToastMessage('Failed to fetch products')
        setShowErrorToast(true)
      } else {
        setProducts(data || [])
        // Update seller data with actual product count
        if (sellerData) {
          setSellerData(prev => prev ? { ...prev, total_products: data?.length || 0 } : null)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setToastMessage('Failed to fetch products')
      setShowErrorToast(true)
    } finally {
      setProductsLoading(false)
    }
  }

  const openProductModal = (mode: 'view' | 'edit' | 'delete', product: Product) => {
    setProductModal({ isOpen: true, mode, product })
    
    if (mode === 'edit') {
      setEditForm({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: null,
        imageUrl: product.image_url || '',
        useImageUrl: !!product.image_url
      })
      setEditImagePreview(product.image_url || null)
    }
  }

  const closeProductModal = () => {
    setProductModal({ isOpen: false, mode: 'view', product: null })
    setEditForm({
      name: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      image: null,
      imageUrl: '',
      useImageUrl: false
    })
    setEditImagePreview(null)
    setFormError('')
    setDeleteConfirm(false)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'price' || name === 'stock') {
      setEditForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file.')
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image file size must be less than 10MB.')
        return
      }
      
      setEditForm(prev => ({ ...prev, image: file }))
      setEditImagePreview(URL.createObjectURL(file))
      setFormError('') // Clear any previous errors
    }
  }

  const removeEditImage = () => {
    setEditForm(prev => ({ ...prev, image: null, imageUrl: '', useImageUrl: false }))
    setEditImagePreview(null)
    setFormError('') // Clear any errors
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation check
    if (!editForm.name.trim()) {
      setFormError('Product name is required.')
      return
    }

    if (!editForm.description.trim()) {
      setFormError('Product description is required.')
      return
    }

    if (!editForm.category) {
      setFormError('Please select a category.')
      return
    }

    if (editForm.price <= 0) {
      setFormError('Price must be greater than 0.')
      return
    }

    if (editForm.stock < 0) {
      setFormError('Stock cannot be negative.')
      return
    }

    if (editForm.useImageUrl && !editForm.imageUrl.trim()) {
      setFormError('Please provide a valid image URL.')
      return
    }

    if (!editForm.useImageUrl && !editForm.image) {
      setFormError('Please upload an image or provide an image URL.')
      return
    }

    // Confirm submission
    const confirmed = window.confirm(
      `Are you sure you want to update "${editForm.name}" in your store?\n\n` +
      `Price: $${editForm.price.toFixed(2)}\n` +
      `Category: ${editForm.category}\n` +
      `Stock: ${editForm.stock}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    // User authentication check
    if (!user) {
      setFormError('User not authenticated.')
      setIsSubmitting(false)
      return
    }

    try {
      // Get the product to update
      const { data: productToUpdate, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productModal.product?.id)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching product to update:', fetchError)
        throw new Error(`Database error: ${fetchError.message}`)
      }

      if (!productToUpdate) {
        setFormError('Product not found.')
        setIsSubmitting(false)
        return
      }

      // Handle image upload if file is selected
      let finalImageUrl: string | null = editForm.useImageUrl ? editForm.imageUrl.trim() : null
      
      if (!editForm.useImageUrl && editForm.image) {
        finalImageUrl = await uploadImageToStorage(editForm.image)
        if (!finalImageUrl) {
          throw new Error('Failed to upload image. Please try again.')
        }
      }

      // Prepare product data for database
      const productData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        price: editForm.price,
        stock: editForm.stock,
        image_url: finalImageUrl || productToUpdate.image_url, // Keep existing if no new image
        updated_at: new Date().toISOString()
      }

      // Update product in database
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productModal.product?.id)

      if (updateError) {
        console.error('❌ Database update error:', updateError)
        throw new Error(updateError.message || 'Failed to update product in database.')
      }

      // Success
      setToastMessage(`Product "${editForm.name}" updated successfully!`)
      setShowSuccessToast(true)
      
      // Close modal and reset form
      closeProductModal()
      
      // Update seller data to reflect new product count
      if (sellerData) {
        setSellerData(prev => prev ? { ...prev, total_products: prev.total_products + 1 } : null) // This might need adjustment if update doesn't change count
      }

      // Auto-hide success toast after 3 seconds
      setTimeout(() => setShowSuccessToast(false), 3000)

    } catch (error: any) {
      console.error('❌ Error updating product:', error)
      setFormError(error.message || 'An unexpected error occurred. Please try again.')
      setToastMessage(error.message || 'Failed to update product.')
      setShowErrorToast(true)
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productModal.product?.id) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${productModal.product.name}" from your store?\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productModal.product.id)

      if (deleteError) {
        console.error('❌ Database delete error:', deleteError)
        throw new Error(deleteError.message || 'Failed to delete product from database.')
      }

      // Success
      setToastMessage(`Product "${productModal.product.name}" deleted successfully!`)
      setShowSuccessToast(true)
      
      // Close modal and reset form
      closeProductModal()
      
      // Update seller data to reflect new product count
      if (sellerData) {
        setSellerData(prev => prev ? { ...prev, total_products: prev.total_products - 1 } : null)
      }

      // Auto-hide success toast after 3 seconds
      setTimeout(() => setShowSuccessToast(false), 3000)

    } catch (error: any) {
      console.error('❌ Error deleting product:', error)
      setFormError(error.message || 'An unexpected error occurred. Please try again.')
      setToastMessage(error.message || 'Failed to delete product.')
      setShowErrorToast(true)
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }


  

  const navigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: BarChart3,
      description: 'Sales summary, orders, revenue, store performance'
    },
    {
      id: 'store',
      label: 'Store Management',
      icon: Store,
      description: 'View, edit, and manage your products',
      subItems: [
        { id: 'manage-products', label: 'View / Edit / Delete Products', icon: Edit3 },
        { id: 'add-product', label: 'Add New Product', icon: Package },
        { id: 'bulk-upload', label: 'Bulk Upload Products', icon: Upload }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      description: 'Order management, tracking, returns',
      subItems: [
        { id: 'view-orders', label: 'View Orders', icon: Eye },
        { id: 'update-status', label: 'Update Status', icon: CheckCircle },
        { id: 'returns-refunds', label: 'Process Returns / Refunds', icon: RotateCcw }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory Management',
      icon: Package,
      description: 'Stock management, alerts, restocking',
      subItems: [
        { id: 'stock-levels', label: 'Stock Levels', icon: BarChart3 },
        { id: 'low-stock-alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
        { id: 'restock', label: 'Restock Products', icon: Package }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: TrendingUp,
      description: 'Sales data, performance metrics, insights',
      subItems: [
        { id: 'sales-reports', label: 'Sales Reports', icon: BarChart3 },
        { id: 'product-performance', label: 'Product Performance', icon: Package }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing & Promotions',
      icon: Megaphone,
      description: 'Coupons, sales, ads, campaigns',
      subItems: [
        { id: 'discount-codes', label: 'Discount Codes', icon: Percent },
        { id: 'flash-sales', label: 'Flash Sales', icon: Zap }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      description: 'Customer list, messages, feedback',
      subItems: [
        { id: 'customer-list', label: 'Customer List', icon: User },
        { id: 'messages', label: 'Messages', icon: MessageCircle },
        { id: 'reviews-management', label: 'Reviews Management', icon: StarIcon }
      ]
    },
    {
      id: 'account',
      label: 'Account & Settings',
      icon: Settings,
      description: 'Profile, payment, shipping, security',
      subItems: [
        { id: 'profile', label: 'Profile Information', icon: User },
        { id: 'payment-details', label: 'Payment & Bank Details', icon: CreditCard },
        { id: 'shipping-preferences', label: 'Shipping Preferences', icon: TruckIcon },
        { id: 'security-settings', label: 'Security Settings', icon: Shield },
        { id: 'notification-settings', label: 'Notification Settings', icon: Bell }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Support, FAQs, tutorials',
      subItems: [
        { id: 'contact-support', label: 'Contact Support', icon: MessageSquare },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
        { id: 'tutorials', label: 'Tutorials', icon: BookOpen }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  if (!sellerData) {
    return null
  }

  const getCurrentSection = () => {
    return navigationSections.find(section => 
      section.id === activeTab || 
      section.subItems?.some(subItem => subItem.id === activeTab)
    )
  }

  const getCurrentSubItem = () => {
    const section = getCurrentSection()
    return section?.subItems?.find(subItem => subItem.id === activeTab)
  }

  const renderContent = () => {
    const section = getCurrentSection()
    const subItem = getCurrentSubItem()
    
    if (activeTab === 'dashboard') {
      return (
        <div className="h-[calc(100vh-80px)] p-6 content-scrollable">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Seller Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{sellerData.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{sellerData.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Store Name</p>
                    <p className="font-medium text-gray-900">{sellerData.store_name}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(sellerData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="font-medium text-gray-900">{sellerData.total_products}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Business Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {sellerData.business_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{sellerData.total_products}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Store className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Store Rating</p>
                  <p className="text-2xl font-bold text-gray-900">0.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Start by adding your first product</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )
    }

    // Add New Product Form
    if (activeTab === 'add-product') {
      return (
        <div className="h-[calc(100vh-80px)] p-6 content-scrollable">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
              <p className="text-sm text-gray-600">Fill in the details below to add a new product to your store</p>
            </div>
            
            {/* Success Toast */}
            {showSuccessToast && (
              <div className="fixed top-4 right-4 z-50 animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{toastMessage}</p>
                      <p className="text-xs text-green-600 mt-1">Redirecting to products list...</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setShowSuccessToast(false)}
                        className="inline-flex text-green-400 hover:text-green-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Toast */}
            {showErrorToast && (
              <div className="fixed top-4 right-4 z-50 animate-fade-in">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{toastMessage}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setShowErrorToast(false)}
                        className="inline-flex text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Error (Inline) */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{formError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">

              {/* Success Toast */}
              {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{toastMessage}</p>
                      </div>
                      <div className="ml-auto pl-3">
                        <button
                          type="button"
                          onClick={() => setShowSuccessToast(false)}
                          className="inline-flex text-green-400 hover:text-green-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Toast */}
              {showErrorToast && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{toastMessage}</p>
                      </div>
                      <div className="ml-auto pl-3">
                        <button
                          type="button"
                          onClick={() => setShowErrorToast(false)}
                          className="inline-flex text-red-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Error (Inline) */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Category and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={productForm.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock/Quantity */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                
                {/* Toggle between Upload and URL */}
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageType"
                      checked={!productForm.useImageUrl}
                      onChange={() => setProductForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                      className="mr-2 text-primary-red focus:ring-primary-red"
                    />
                    <span className="text-sm text-gray-700">Upload Image</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageType"
                      checked={productForm.useImageUrl}
                      onChange={() => setProductForm(prev => ({ ...prev, useImageUrl: true, image: null }))}
                      className="mr-2 text-primary-red focus:ring-primary-red"
                    />
                    <span className="text-sm text-gray-700">Image URL</span>
                  </label>
                </div>
                
                {productForm.useImageUrl ? (
                  <div className="space-y-3">
                    {/* URL Input */}
                    <input
                      type="url"
                      name="imageUrl"
                      value={productForm.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    />
                    
                    {/* URL Preview */}
                    <div className="relative inline-block">
                      {productForm.imageUrl ? (
                        <img
                          src={productForm.imageUrl}
                          alt="Product preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          onError={() => setImagePreview(null)}
                          onLoad={() => setImagePreview(productForm.imageUrl)}
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                          Enter URL to preview
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setProductForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Image URL: {productForm.imageUrl || 'Not provided'}</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-red transition-colors">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-primary-red hover:text-red-600">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>
                )}
                
                {/* Image Preview for Upload */}
                {!productForm.useImageUrl && imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Image selected: {productForm.image?.name}</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Product to Store
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('manage-products')}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Products
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset Form
                </button>


              </div>
            </form>
          </div>
        </div>
        </div>
      )
    }

    // Manage Products Section
    if (activeTab === 'manage-products') {
      return (
        <div className="h-[calc(100vh-80px)] p-6 content-scrollable">
          <div className="space-y-6 max-w-7xl mx-auto">
          {/* Success Message for Recently Added Product */}
          {showSuccessToast && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Product added successfully!</p>
                  <p className="text-sm text-green-600">Your new product is now visible in the list below.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Products Summary */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Products Overview</h3>
                <div className="flex items-center space-x-6 mt-2">
                  <p className="text-sm text-gray-600">
                    Total Products: <span className="font-semibold text-primary-red">{products.length}</span>
                  </p>
                  {(() => {
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                    const recentCount = products.filter(p => new Date(p.created_at) > oneDayAgo).length
                    return recentCount > 0 ? (
                      <p className="text-sm text-green-600">
                        Recently Added: <span className="font-semibold text-green-700">{recentCount}</span>
                      </p>
                    ) : null
                  })()}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('bulk-upload')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
                >
                  <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                </button>
                <button
                  onClick={() => setActiveTab('add-product')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Package className="w-4 h-4 mr-2" /> Add New Product
                </button>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Your Products</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
                    <select
                      id="sort"
                      onChange={(e) => {
                        const sortBy = e.target.value
                        const sortedProducts = [...products].sort((a, b) => {
                          switch (sortBy) {
                            case 'newest':
                              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                            case 'oldest':
                              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            case 'price-low':
                              return a.price - b.price
                            case 'price-high':
                              return b.price - a.price
                            case 'name':
                              return a.name.localeCompare(b.name)
                            default:
                              return 0
                          }
                        })
                        setProducts(sortedProducts)
                      }}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-red"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="filter" className="text-sm text-gray-600">Filter:</label>
                    <select
                      id="filter"
                      onChange={(e) => {
                        const filterBy = e.target.value
                        if (filterBy === 'recent') {
                          // Show only products added in last 24 hours
                          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                          const recentProducts = products.filter(p => new Date(p.created_at) > oneDayAgo)
                          setProducts(recentProducts)
                        } else if (filterBy === 'all') {
                          // Show all products (refresh from database)
                          fetchProducts()
                        }
                      }}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-red"
                    >
                      <option value="all">All Products</option>
                      <option value="recent">Recently Added (24h)</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={fetchProducts}
                    disabled={productsLoading}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    title="Refresh products list"
                  >
                    <RotateCcw className={`w-4 h-4 ${productsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            {productsLoading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
                <p>Loading products...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a moment...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>You haven't added any products yet. Start by adding one!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {products.map((product) => {
                  // Check if product was recently uploaded via bulk upload
                  const isRecentlyUploaded = recentlyUploaded.includes(product.id)
                  // Also check if product was added recently (within last 5 minutes)
                  const isRecentlyAdded = new Date(product.created_at).getTime() > Date.now() - 5 * 60 * 1000
                  
                  return (
                    <div key={product.id} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 ${isRecentlyUploaded || isRecentlyAdded ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                      <div className="flex items-center">
                        <img
                          src={product.image_url || '/placeholder.jpg'} // Use placeholder if no image
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                            {isRecentlyUploaded && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Upload className="w-3 h-3 mr-1" />
                                Bulk Uploaded
                              </span>
                            )}
                            {isRecentlyAdded && !isRecentlyUploaded && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{product.description}</p>
                          <p className="text-sm text-gray-700">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                          <p className="text-xs text-gray-400">Added: {new Date(product.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openProductModal('view', product)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
                          title="View Product"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openProductModal('edit', product)}
                          className="p-2 text-primary-red hover:text-red-600 rounded-full"
                          title="Edit Product"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openProductModal('delete', product)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full"
                          title="Delete Product"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Modal */}
          {productModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                                     <h3 className="text-lg font-medium text-gray-900">
                     {productModal.mode === 'edit' ? 'Edit Product' : productModal.mode === 'delete' ? 'Delete Product' : 'View Product'}
                   </h3>
                </div>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                     {productModal.mode === 'view' && (
                    <form onSubmit={handleProductSubmit} className="space-y-6">
                      {/* Product Name */}
                      <div>
                        <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          id="add-name"
                          name="name"
                          value={productForm.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="add-description" className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          id="add-description"
                          name="description"
                          value={productForm.description}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="Describe your product..."
                        />
                      </div>

                      {/* Category and Price Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="add-category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            id="add-category"
                            name="category"
                            value={productForm.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="add-price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            id="add-price"
                            name="price"
                            value={productForm.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Stock/Quantity */}
                      <div>
                        <label htmlFor="add-stock" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="add-stock"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      {/* Product Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Image *
                        </label>
                        
                        {/* Toggle between Upload and URL */}
                        <div className="flex items-center space-x-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="add-imageType"
                              checked={!productForm.useImageUrl}
                              onChange={() => setProductForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                              className="mr-2 text-primary-red focus:ring-primary-red"
                            />
                            <span className="text-sm text-gray-700">Upload Image</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="add-imageType"
                              checked={productForm.useImageUrl}
                              onChange={() => setProductForm(prev => ({ ...prev, useImageUrl: true, image: null }))}
                              className="mr-2 text-primary-red focus:ring-primary-red"
                            />
                            <span className="text-sm text-gray-700">Image URL</span>
                          </label>
                        </div>
                        
                        {productForm.useImageUrl ? (
                          <div className="space-y-3">
                            {/* URL Input */}
                            <input
                              type="url"
                              name="imageUrl"
                              value={productForm.imageUrl}
                              onChange={handleInputChange}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                            />
                            
                            {/* URL Preview */}
                            <div className="relative inline-block">
                              {productForm.imageUrl ? (
                                <img
                                  src={productForm.imageUrl}
                                  alt="Product preview"
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                  onError={() => setImagePreview(null)}
                                  onLoad={() => setImagePreview(productForm.imageUrl)}
                                />
                              ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                  Enter URL to preview
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setProductForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">Image URL: {productForm.imageUrl || 'Not provided'}</p>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-red transition-colors">
                            <input
                              type="file"
                              id="add-image"
                              name="add-image"
                              onChange={handleImageChange}
                              accept="image/*"
                              required
                              className="hidden"
                            />
                            <label htmlFor="add-image" className="cursor-pointer">
                              <Image className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium text-primary-red hover:text-red-600">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </label>
                          </div>
                        )}
                        
                        {/* Image Preview for Upload */}
                        {!productForm.useImageUrl && imagePreview && (
                          <div className="mt-3 relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-sm text-gray-500 mt-2">Image selected: {productForm.image?.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding Product...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Add Product to Store
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={closeProductModal}
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {productModal.mode === 'edit' && (
                                         <form onSubmit={handleEditSubmit} className="space-y-6">
                      {/* Product Name */}
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          id="edit-name"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          id="edit-description"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditInputChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="Describe your product..."
                        />
                      </div>

                      {/* Category and Price Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            id="edit-category"
                            name="category"
                            value={editForm.category}
                            onChange={handleEditInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            id="edit-price"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Stock/Quantity */}
                      <div>
                        <label htmlFor="edit-stock" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="edit-stock"
                          name="stock"
                          value={editForm.stock}
                          onChange={handleEditInputChange}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      {/* Product Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Image *
                        </label>
                        
                        {/* Toggle between Upload and URL */}
                        <div className="flex items-center space-x-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="edit-imageType"
                              checked={!editForm.useImageUrl}
                              onChange={() => setEditForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                              className="mr-2 text-primary-red focus:ring-primary-red"
                            />
                            <span className="text-sm text-gray-700">Upload Image</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="edit-imageType"
                              checked={editForm.useImageUrl}
                              onChange={() => setEditForm(prev => ({ ...prev, useImageUrl: true, image: null }))}
                              className="mr-2 text-primary-red focus:ring-primary-red"
                            />
                            <span className="text-sm text-gray-700">Image URL</span>
                          </label>
                        </div>
                        
                        {editForm.useImageUrl ? (
                          <div className="space-y-3">
                            {/* URL Input */}
                            <input
                              type="url"
                              name="imageUrl"
                              value={editForm.imageUrl}
                              onChange={handleEditInputChange}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                            />
                            
                            {/* URL Preview */}
                            <div className="relative inline-block">
                              {editForm.imageUrl ? (
                                <img
                                  src={editForm.imageUrl}
                                  alt="Product preview"
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                  onError={() => setEditImagePreview(null)}
                                  onLoad={() => setEditImagePreview(editForm.imageUrl)}
                                />
                              ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                  Enter URL to preview
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditForm(prev => ({ ...prev, useImageUrl: false, image: null, imageUrl: '' }))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">Image URL: {editForm.imageUrl || 'Not provided'}</p>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-red transition-colors">
                            <input
                              type="file"
                              id="edit-image"
                              name="edit-image"
                              onChange={handleEditImageChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <label htmlFor="edit-image" className="cursor-pointer">
                              <Image className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium text-primary-red hover:text-red-600">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </label>
                          </div>
                        )}
                        
                        {/* Image Preview for Upload */}
                        {!editForm.useImageUrl && editImagePreview && (
                          <div className="mt-3 relative inline-block">
                            <img
                              src={editImagePreview}
                              alt="Product preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={removeEditImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-sm text-gray-500 mt-2">Image selected: {editForm.image?.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating Product...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update Product
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={closeProductModal}
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {productModal.mode === 'delete' && (
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Are you sure you want to delete "{productModal.product?.name}"? This action cannot be undone.
                      </p>
                      <div className="flex justify-center space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={closeProductModal}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteProduct}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Delete Product
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )
    }

    // Bulk Upload Section
    if (activeTab === 'bulk-upload') {
      return (
        <div className="h-[calc(100vh-80px)] p-6 content-scrollable">
          <div className="space-y-6 max-w-7xl mx-auto">
          {/* Success Message for Recently Uploaded Products */}
          {showSuccessToast && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Bulk upload successful!</p>
                  <p className="text-sm text-green-600">
                    Your products have been uploaded successfully! Redirecting to products list...
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveTab('manage-products')
                        setShowSuccessToast(false)
                      }}
                      className="inline-flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-medium rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Products Now
                    </button>
                    <button
                      onClick={() => setShowSuccessToast(false)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Stay Here
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <BulkProductUpload 
            sellerId={user?.id}
            onUploadSuccess={(uploadedProductIds) => {
              // Show success message
              setToastMessage('Bulk upload completed successfully!')
              setShowSuccessToast(true)
              
              // Track recently uploaded products
              if (uploadedProductIds && Array.isArray(uploadedProductIds)) {
                setRecentlyUploaded(uploadedProductIds)
              }
              
              // Refresh products list after successful upload
              fetchProducts()
              
              // Show a brief success animation, then auto-redirect
              setTimeout(() => {
                setActiveTab('manage-products')
                setShowSuccessToast(false)
              }, 2000)
              
              // Clear recently uploaded state after 10 minutes
              setTimeout(() => {
                setRecentlyUploaded([])
              }, 10 * 60 * 1000)
            }} 
          />
        </div>
        </div>
      )
    }

    // For all other sections, show placeholder content
    return (
      <div className="h-[calc(100vh-80px)] p-6 content-scrollable">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500 py-8">
          {section?.icon && React.createElement(section.icon, { 
            className: "w-12 h-12 mx-auto mb-4 text-gray-300" 
          })}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {subItem ? subItem.label : section?.label}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {section?.description || 'Feature coming soon'}
          </p>
          {section?.id === 'store' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-3">
                💡 <strong>Tip:</strong> Click on "Store Management" in the sidebar to view and manage your products!
              </p>
              <button
                onClick={() => setActiveTab('manage-products')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View My Products Now
              </button>
            </div>
          )}
          {section?.id !== 'store' && (
            <p className="text-sm">This feature will be available soon</p>
          )}
            </div>
          </div>
        </div>
        </div>
      )
    }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex main-screen-wrapper dashboard-container"
      style={{ 
        overflow: 'hidden', 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937; /* gray-800 */
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4b5563; /* gray-600 */
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
        
        /* Content area scrollbar styles */
        .content-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .content-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6; /* gray-100 */
          border-radius: 4px;
        }
        .content-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; /* gray-300 */
          border-radius: 4px;
        }
        .content-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; /* gray-400 */
        }
        .content-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
        
        /* Main container - no scrollbars */
        .main-container {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .main-container::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Main screen wrapper - no scrollbars */
        .main-screen-wrapper {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .main-screen-wrapper::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Ensure body and html have no scrollbars */
        body, html {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        body::-webkit-scrollbar, html::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Remove ALL scrollbars from main dashboard */
        .min-h-screen, .flex, .bg-gray-50 {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .min-h-screen::-webkit-scrollbar, .flex::-webkit-scrollbar, .bg-gray-50::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Force remove scrollbars from any element */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Global scrollbar removal */
        html, body, #__next, .main-screen-wrapper, .min-h-screen {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar, #__next::-webkit-scrollbar, .main-screen-wrapper::-webkit-scrollbar, .min-h-screen::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Additional scrollbar hiding for all browsers */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Force no scrollbars on main elements */
        .seller-dashboard-root {
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .seller-dashboard-root::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Animation classes */
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation - Dark Theme */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 shadow-lg fixed left-0 top-0 h-full z-50 transition-all duration-300 transform ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Top Header - Logo and Collapse Button */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-red rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <span className="text-xl font-bold text-white">Seller Hub</span>
                )}
              </div>
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 bg-gray-900 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
            <div className="space-y-1 bg-gray-900">
              {navigationSections.map((section) => {
                const IconComponent = section.icon
                const isActive = activeTab === section.id || 
                  section.subItems?.some(subItem => subItem.id === activeTab)
                
                return (
                  <div key={section.id} className="space-y-1">
                    {/* Main Section */}
                    <button
                      onClick={() => {
                        // For Store Management, default to manage-products tab
                        if (section.id === 'store') {
                          setActiveTab('manage-products')
                        } else {
                          setActiveTab(section.id)
                        }
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-primary-red text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{section.label}</span>
                            {section.id === 'store' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Products
                              </span>
                            )}
                          </div>
                          {!sidebarCollapsed && (
                            <p className="text-xs opacity-75 mt-0.5">{section.description}</p>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub Items */}
                    {!sidebarCollapsed && section.subItems && isActive && (
                      <div className="ml-6 space-y-1">
                        {section.subItems.map((subItem) => {
                          const SubIconComponent = subItem.icon
                          const isSubActive = activeTab === subItem.id
                          
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(subItem.id)
                                setMobileSidebarOpen(false)
                              }}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                                isSubActive
                                  ? 'bg-red-100 text-primary-red'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                              }`}
                            >
                              <SubIconComponent className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium">{subItem.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Fixed Bottom Actions */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={handleSwitchToBuyerMode}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">Back to Buyer View</span>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-400 hover:bg-red-900 hover:text-red-200 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 transition-all duration-300 main-screen-wrapper ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
        style={{ 
          overflow: 'hidden', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top Header - Fixed */}
        <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getCurrentSubItem()?.label || getCurrentSection()?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-600">Welcome back, {sellerData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Store</p>
                <p className="font-semibold text-gray-900">{sellerData.store_name}</p>
              </div>
              <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - No scrollbars on main container */}
        <div className="h-[calc(100vh-80px)] overflow-hidden main-container" style={{ overflow: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default function SellerDashboardPage() {
  return <SellerDashboard />
}


