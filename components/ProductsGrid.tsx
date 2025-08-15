'use client'

import React, { useState, useEffect } from 'react'
import { Star, Heart, RefreshCw } from 'lucide-react'

import { Product } from '@/lib/supabase'

interface ProductsGridProps {
  category?: string
  limit?: number
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ category, limit = 12 }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category, limit])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching products...')
      
      // Build API URL with query parameters
      const params = new URLSearchParams()
      if (category && category !== 'all') {
        params.append('category', category)
      }
      if (limit) {
        params.append('limit', limit.toString())
      }
      
      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`
      console.log('📡 API URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }
      
      console.log(`✅ Fetched ${data.products?.length || 0} products`)
      setProducts(data.products || [])
      
    } catch (err: any) {
      console.error('❌ Error fetching products:', err)
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-2">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={fetchProducts}
          className="bg-primary-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No products found</div>
        {category && (
          <div className="text-sm text-gray-400">
            No products in category: {category}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
        >
          {/* Product Image */}
          <div className="relative">
            <img 
              src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {/* Stock Badge */}
            {product.stock > 0 ? (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                In Stock
              </div>
            ) : (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Out of Stock
              </div>
            )}
            {/* Category Badge */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-primary-text px-2 py-1 rounded-full text-xs font-semibold">
              {product.category}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-primary-text mb-2 line-clamp-2 overflow-hidden">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {/* Pricing */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary-red">
                ${product.price}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span>4.5</span>
                <span className="ml-1">(0)</span>
              </div>
            </div>
            
            {/* Stock Info */}
            <div className="text-sm text-gray-500 mb-4">
              Stock: {product.stock} units
            </div>
            

          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

export default ProductsGrid
