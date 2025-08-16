'use client'

import React, { useState, useRef } from 'react'
import { Upload, Edit3, Trash2, Check, X, Download, Eye, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProductRow {
  id: string
  name: string
  description: string
  category: string
  price: number
  image_url: string
  stock?: number
  isEditing?: boolean
  originalData?: ProductRow
}

interface BulkUploadProps {
  onUploadSuccess: (uploadedProductIds?: string[]) => void
  sellerId?: string
}

const BulkProductUpload: React.FC<BulkUploadProps> = ({ onUploadSuccess, sellerId }) => {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [showMessageState, setShowMessageState] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Media',
    'Automotive',
    'Toys & Games'
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showMessage('error', 'Please select a valid CSV file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB')
      return
    }

    setIsParsing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n').filter(line => line.trim()) // Remove empty lines
      if (lines.length < 2) {
        showMessage('error', 'CSV file must have at least a header row and one data row')
        return
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Validate required headers
      const requiredHeaders = ['name', 'description', 'category', 'price', 'image_url']
      const optionalHeaders = ['stock']
      const allHeaders = [...requiredHeaders, ...optionalHeaders]
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        showMessage('error', `Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const parsedProducts: ProductRow[] = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          // Simple CSV parsing - split by comma and handle quoted values
          const values = lines[i].split(',').map(v => {
            const trimmed = v.trim()
            // Remove quotes if present
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              return trimmed.slice(1, -1)
            }
            return trimmed
          })
          
          const product: ProductRow = {
            id: `temp-${i}`,
            name: values[headers.indexOf('name')] || '',
            description: values[headers.indexOf('description')] || '',
            category: values[headers.indexOf('category')] || '',
            price: parseFloat(values[headers.indexOf('price')]) || 0,
            image_url: values[headers.indexOf('image_url')] || '',
            stock: parseInt(values[headers.indexOf('stock')]) || 10
          }
          
          if (product.name && product.description && product.category && product.price > 0) {
            parsedProducts.push(product)
          }
        }
      }

      setProducts(parsedProducts)
      showMessage('success', `Successfully parsed ${parsedProducts.length} products from CSV`)
      setIsParsing(false)
    }
    
    reader.onerror = () => {
      showMessage('error', 'Failed to read the CSV file. Please try again.')
      setIsParsing(false)
    }
    
    reader.readAsText(file)
  }

  const handleEdit = (id: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return {
          ...product,
          isEditing: true,
          originalData: { ...product }
        }
      }
      return product
    }))
  }

  const handleSave = (id: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return {
          ...product,
          isEditing: false,
          originalData: undefined
        }
      }
      return product
    }))
  }

  const handleCancel = (id: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id && product.originalData) {
        return {
          ...product.originalData,
          isEditing: false,
          originalData: undefined
        }
      }
      return product
    }))
  }

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id))
  }

  const handleInputChange = (id: string, field: keyof ProductRow, value: string | number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return { ...product, [field]: value }
      }
      return product
    }))
  }

  const validateProducts = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (products.length === 0) {
      errors.push('No products to upload')
      return { isValid: false, errors }
    }

    products.forEach((product, index) => {
      if (!product.name.trim()) {
        errors.push(`Row ${index + 1}: Name is required`)
      }
      if (!product.description.trim()) {
        errors.push(`Row ${index + 1}: Description is required`)
      }
      if (!product.category.trim()) {
        errors.push(`Row ${index + 1}: Category is required`)
      }
      if (product.price <= 0) {
        errors.push(`Row ${index + 1}: Price must be greater than 0`)
      }
      if (product.image_url && !isValidUrl(product.image_url)) {
        errors.push(`Row ${index + 1}: Invalid image URL`)
      }
      
      // Additional validation
      if (product.name.trim().length < 3) {
        errors.push(`Row ${index + 1}: Name must be at least 3 characters`)
      }
      if (product.description.trim().length < 10) {
        errors.push(`Row ${index + 1}: Description must be at least 10 characters`)
      }
      if (product.price > 999999.99) {
        errors.push(`Row ${index + 1}: Price cannot exceed $999,999.99`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleBulkUpload = async () => {
    const validation = validateProducts()
    if (!validation.isValid) {
      showMessage('error', `Validation failed:\n${validation.errors.join('\n')}`)
      return
    }

    if (!sellerId) {
      showMessage('error', 'Seller ID not found. Please make sure you are logged in as a seller.')
      return
    }

    setIsUploading(true)
    try {
      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products, sellerId })
      })

      if (response.ok) {
        const result = await response.json()
        showMessage('success', 'Products uploaded successfully!')
        setProducts([])
        
        // Pass the uploaded product IDs to the success callback
        const uploadedIds = result.products?.map((p: any) => p.id) || []
        onUploadSuccess(uploadedIds)
        
        // Show loading effect and refresh data instead of full page reload
        // This keeps user on the same tab while showing loading spinner
        setTimeout(() => {
          // Trigger parent component refresh without page reload
          if (onUploadSuccess) {
            onUploadSuccess(uploadedIds)
          }
        }, 500)
      } else {
        const errorData = await response.json()
        let errorMessage = 'Upload failed'
        
        if (errorData.error) {
          errorMessage += `: ${errorData.error}`
        }
        
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += `\n\nDetails:\n${errorData.details.join('\n')}`
        }
        
        showMessage('error', errorMessage)
      }
    } catch (error) {
      showMessage('error', `Upload failed: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', message: string) => {
    setUploadMessage(message)
    setShowMessageState(true)
    setTimeout(() => setShowMessageState(false), 5000)
  }

  const resetUpload = () => {
    setProducts([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 via-pink-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
                             <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                 Bulk Product Upload
               </h2>
               <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                 Upload multiple products at once using a CSV file. Review and edit products before final upload 
                 to ensure accuracy and quality. <span className="font-semibold text-red-600">Save time and effort!</span>
               </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <p className="text-xs text-gray-600 font-medium">After upload, products will appear in:</p>
            <button
              onClick={() => {
                if (onUploadSuccess) {
                  onUploadSuccess()
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Products
            </button>
          </div>
        </div>
      </div>

      {/* CSV Template Download */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Download className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
                         <h3 className="text-base font-bold text-gray-900 mb-3">CSV Template Download</h3>
             <p className="text-sm text-gray-700 mb-6 leading-relaxed">
               Download our pre-formatted CSV template to ensure your product data is correctly structured. 
               The template includes sample data and all required columns.
             </p>
            
            {/* Column Information */}
            <div className="bg-white rounded-xl p-6 border border-blue-100 mb-6 shadow-md">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Required Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">name</span>
                  <span className="text-xs text-green-600 font-medium">(required)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">description</span>
                  <span className="text-xs text-green-600 font-medium">(required)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">category</span>
                  <span className="text-xs text-green-600 font-medium">(required)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">price</span>
                  <span className="text-xs text-green-600 font-medium">(required)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">image_url</span>
                  <span className="text-xs text-blue-600 font-medium">(optional)</span>
                </div>
              </div>
              
              <h4 className="text-base font-semibold text-gray-900 mb-4">Optional Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">stock</span>
                  <span className="text-xs text-blue-600 font-medium">(optional)</span>
                </div>
              </div>
            </div>
            
            {/* Sample Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 mb-6 shadow-md">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Sample Data Preview:</h4>
              <div className="text-sm text-gray-700 font-mono bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto shadow-inner">
                <div className="whitespace-nowrap">
                  <span className="text-blue-600 font-semibold">name</span>,<span className="text-green-600 font-semibold">description</span>,<span className="text-purple-600 font-semibold">category</span>,<span className="text-orange-600 font-semibold">price</span>,<span className="text-red-600 font-semibold">image_url</span>,<span className="text-indigo-600 font-semibold">stock</span>
                </div>
                <div className="whitespace-nowrap mt-2 text-gray-600">
                  <span className="text-blue-600">"Wireless Bluetooth Headphones"</span>,<span className="text-green-600">"High-quality wireless headphones with noise cancellation"</span>,<span className="text-purple-600">"Electronics"</span>,<span className="text-orange-600">89.99</span>,<span className="text-red-600">"https://..."</span>,<span className="text-indigo-600">50</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                const csvContent = `name,description,category,price,image_url,stock
"Wireless Bluetooth Headphones","High-quality wireless headphones with noise cancellation","Electronics",89.99,"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",50
"Premium Running Shoes","Comfortable running shoes for professional athletes","Sports & Outdoors",129.99,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",75
"Organic Cotton T-Shirt","Soft and comfortable organic cotton t-shirt","Fashion",24.99,"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",120
"Smart Home Security Camera","WiFi-enabled security camera with night vision","Electronics",149.99,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",30`
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'product-template.csv'
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV Template
            </button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 border-2 border-dashed border-red-300 rounded-2xl p-6 text-center hover:border-red-400 hover:from-red-100 hover:to-pink-100 transition-all duration-500 group shadow-lg hover:shadow-xl">
        <div className="max-w-lg mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-red-200 via-pink-200 to-red-300 group-hover:from-red-300 group-hover:via-pink-300 group-hover:to-red-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 transform group-hover:scale-110 shadow-lg">
            <Upload className="w-8 h-8 text-red-600 group-hover:text-red-700 transition-colors" />
          </div>
          
                     <h3 className="text-base font-bold text-gray-900 mb-3">Upload Your CSV File</h3>
           <p className="text-sm text-gray-700 mb-6 leading-relaxed">
             Choose a CSV file with your product data. Make sure it follows the template format 
             for the best results.
           </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium rounded-xl transition-all duration-500 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isParsing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Parsing CSV...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Choose CSV File
                </>
              )}
            </button>
            
            {/* Cancel Button */}
            <button
              onClick={() => resetUpload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600 mb-3 font-medium">Supported format: CSV files only</p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Max size: 5MB</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>UTF-8 encoding</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {showMessageState && (
        <div className={`p-4 rounded-xl shadow-lg border-2 ${
          uploadMessage.includes('successfully') 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadMessage.includes('successfully') ? (
              <Check className="w-5 h-5 mr-3 text-green-600" />
            ) : (
              <X className="w-5 h-5 mr-3 text-red-600" />
            )}
            <span className="whitespace-pre-line font-medium text-sm">{uploadMessage}</span>
          </div>
        </div>
      )}

      {/* Products Preview Table */}
      {products.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Preview ({products.length} products)
            </h3>
            <button
              onClick={resetUpload}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Reset Upload
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">CSV Products Preview</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs font-medium text-gray-700">Sort by:</label>
                    <select className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm">
                      <option value="name">Name: A to Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No products to preview. Please upload a CSV file first.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {products.map((product, index) => {
                   // Soft pastel colors for product cards
                   const cardStyles = [
                     'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm',
                     'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm',
                     'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 shadow-sm',
                     'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-sm',
                     'bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 shadow-sm',
                     'bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 shadow-sm',
                     'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm',
                     'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-sm'
                   ]
                   
                   const cardStyle = cardStyles[index % cardStyles.length]
                   
                   return (
                     <div key={product.id} className={`rounded-lg p-3 ${cardStyle} hover:shadow-md transition-all duration-300`}>
                       <div className="flex items-start space-x-3">
                         {/* Product Image */}
                         <div className="flex-shrink-0">
                           <img
                             src={product.image_url || '/placeholder.jpg'}
                             alt={product.name}
                             className="w-14 h-14 object-cover rounded-lg border-2 border-white shadow-sm"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement
                               target.style.display = 'none'
                             }}
                           />
                         </div>
                         
                         {/* Product Details */}
                         <div className="flex-1 min-w-0 space-y-2">
                           {/* Product Name and Badge */}
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                 {product.isEditing ? (
                                   <input
                                     type="text"
                                     value={product.name}
                                     onChange={(e) => handleInputChange(product.id, 'name', e.target.value)}
                                     className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs font-medium"
                                   />
                                 ) : (
                                   product.name
                                 )}
                               </h4>
                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                 <Upload className="w-3 h-3 mr-1" />
                                 CSV Preview
                               </span>
                             </div>
                             
                             {/* Price */}
                             <div className="text-right">
                               <p className="text-base font-bold text-gray-900">
                                 ${product.isEditing ? (
                                   <input
                                     type="number"
                                     step="0.01"
                                     min="0"
                                     value={product.price}
                                     onChange={(e) => handleInputChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                                     className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs font-medium"
                                   />
                                 ) : (
                                   product.price.toFixed(2)
                                 )}
                               </p>
                             </div>
                           </div>
                           
                           {/* Description */}
                           <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                             {product.isEditing ? (
                               <textarea
                                 value={product.description}
                                 onChange={(e) => handleInputChange(product.id, 'description', e.target.value)}
                                 rows={2}
                                 className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs resize-none"
                                 placeholder="Enter product description..."
                               />
                             ) : (
                               <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{product.description}</p>
                             )}
                           </div>
                           
                           {/* Category and Actions Row */}
                           <div className="flex items-center justify-between pt-1">
                             <div className="flex items-center space-x-3">
                               <div>
                                 <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                 {product.isEditing ? (
                                   <select
                                     value={product.category}
                                     onChange={(e) => handleInputChange(product.id, 'category', e.target.value)}
                                     className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs font-medium"
                                   >
                                     <option value="">Select Category</option>
                                     {categories.map((cat) => (
                                       <option key={cat} value={cat}>{cat}</option>
                                     ))}
                                   </select>
                                 ) : (
                                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                     {product.category}
                                   </span>
                                 )}
                               </div>
                             </div>
                             
                             {/* Action Buttons - Icon Only */}
                             <div className="flex items-center space-x-1">
                               {product.isEditing ? (
                                 <>
                                   <button
                                     onClick={() => handleSave(product.id)}
                                     className="p-1.5 text-green-600 hover:text-green-700 rounded-full hover:bg-green-100 transition-colors"
                                     title="Save Changes"
                                   >
                                     <Check className="w-4 h-4" />
                                   </button>
                                   <button
                                     onClick={() => handleCancel(product.id)}
                                     className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                                     title="Cancel Changes"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 </>
                               ) : (
                                 <>
                                   <button
                                     onClick={() => handleEdit(product.id)}
                                     className="p-1.5 text-red-600 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                     title="Edit Product"
                                   >
                                     <Edit3 className="w-4 h-4" />
                                   </button>
                                   <button
                                     onClick={() => handleDelete(product.id)}
                                     className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                     title="Delete Product"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )
                 })}
               </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{products.length}</div>
              <div className="text-xs font-medium text-gray-700">Total Products</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
              </div>
              <div className="text-xs font-medium text-gray-700">Total Value</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {new Set(products.map(p => p.category)).size}
              </div>
              <div className="text-xs font-medium text-gray-700">Categories</div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center pt-3">
            <button
              onClick={handleBulkUpload}
              disabled={isUploading}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Confirm Upload ({products.length} products)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkProductUpload
