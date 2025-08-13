'use client'

import React, { useState, useRef } from 'react'
import { Upload, Edit3, Trash2, Check, X, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProductRow {
  id: string
  name: string
  description: string
  category: string
  price: number
  image_url: string
  isEditing?: boolean
  originalData?: ProductRow
}

interface BulkUploadProps {
  onUploadSuccess: () => void
}

const BulkProductUpload: React.FC<BulkUploadProps> = ({ onUploadSuccess }) => {
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
            image_url: values[headers.indexOf('image_url')] || ''
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

    setIsUploading(true)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        showMessage('error', 'You must be logged in to upload products')
        return
      }

      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ products })
      })

      if (response.ok) {
        showMessage('success', 'Products uploaded successfully!')
        setProducts([])
        onUploadSuccess()
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bulk Product Upload</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Upload multiple products at once using a CSV file. Review and edit products before final upload 
              to ensure accuracy and quality.
            </p>
          </div>
        </div>
      </div>

      {/* CSV Template Download */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Template Download</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Download our pre-formatted CSV template to ensure your product data is correctly structured. 
              The template includes sample data and all required columns.
            </p>
            
            {/* Column Information */}
            <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Required Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">name</span>
                  <span className="text-xs text-gray-500">(required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">description</span>
                  <span className="text-xs text-gray-500">(required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">category</span>
                  <span className="text-xs text-gray-500">(required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">price</span>
                  <span className="text-xs text-gray-500">(required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">image_url</span>
                  <span className="text-xs text-gray-500">(optional)</span>
                </div>
              </div>
            </div>
            
            {/* Sample Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Data Preview:</h4>
              <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border overflow-x-auto">
                <div className="whitespace-nowrap">
                  <span className="text-blue-600">name</span>,<span className="text-green-600">description</span>,<span className="text-purple-600">category</span>,<span className="text-orange-600">price</span>,<span className="text-red-600">image_url</span>
                </div>
                <div className="whitespace-nowrap mt-1">
                  <span className="text-blue-600">"Wireless Headphones"</span>,<span className="text-green-600">"High-quality wireless headphones"</span>,<span className="text-purple-600">"Electronics"</span>,<span className="text-orange-600">89.99</span>,<span className="text-red-600">"https://..."</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                const csvContent = `name,description,category,price,image_url
"Wireless Bluetooth Headphones","High-quality wireless headphones with noise cancellation","Electronics",89.99,"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
"Premium Running Shoes","Comfortable running shoes for professional athletes","Sports & Outdoors",129.99,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
"Organic Cotton T-Shirt","Soft and comfortable organic cotton t-shirt","Fashion",24.99,"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
"Smart Home Security Camera","WiFi-enabled security camera with night vision","Electronics",149.99,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"`
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'product-template.csv'
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV Template
            </button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-red hover:from-red-50 hover:to-red-100 transition-all duration-300 group">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-red-200 group-hover:to-red-300 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300">
            <Upload className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your CSV File</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
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
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-red to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isParsing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Parsing CSV...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-3" />
                  Choose CSV File
                </>
              )}
            </button>
            
            {/* Cancel Button */}
            <button
              onClick={() => resetUpload()}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <X className="w-6 h-6 mr-3" />
              Cancel
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Supported format: CSV files only</p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Max size: 5MB</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>UTF-8 encoding</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {showMessageState && (
        <div className={`p-4 rounded-lg ${
          uploadMessage.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadMessage.includes('successfully') ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            <span className="whitespace-pre-line">{uploadMessage}</span>
          </div>
        </div>
      )}

      {/* Products Preview Table */}
      {products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Preview ({products.length} products)
            </h3>
            <button
              onClick={resetUpload}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset Upload
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      {/* Product Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isEditing ? (
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleInputChange(product.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        {product.isEditing ? (
                          <textarea
                            value={product.description}
                            onChange={(e) => handleInputChange(product.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 max-w-xs truncate">{product.description}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isEditing ? (
                          <select
                            value={product.category}
                            onChange={(e) => handleInputChange(product.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={product.price}
                            onChange={(e) => handleInputChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                        )}
                      </td>

                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.image_url ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            {product.isEditing && (
                              <input
                                type="url"
                                value={product.image_url}
                                onChange={(e) => handleInputChange(product.id, 'image_url', e.target.value)}
                                placeholder="Image URL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No image</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {product.isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(product.id)}
                                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={() => handleCancel(product.id)}
                                className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(product.id)}
                                className="inline-flex items-center px-3 py-2 bg-primary-red hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-red">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(products.map(p => p.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleBulkUpload}
              disabled={isUploading}
              className="inline-flex items-center px-8 py-4 bg-primary-red hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
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
