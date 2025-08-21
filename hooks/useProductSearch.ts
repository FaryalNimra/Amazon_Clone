import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SearchResult {
  id: number
  name: string
  price: number
  image_url: string
  category: string
  description?: string
  rating?: number
  reviewCount?: number
  created_at?: string
  discount?: number
  brand?: string
  inStock?: boolean
  originalPrice?: number
  stock?: number
  seller_id?: string
}

export interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  sortBy?: string
}

export interface UseProductSearchReturn {
  results: SearchResult[]
  loading: boolean
  error: string | null
  searchProducts: (query: string, filters?: SearchFilters) => Promise<void>
  clearResults: () => void
}

export const useProductSearch = (): UseProductSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Category variations for better matching
  const getCategoryVariations = useCallback((category: string): string[] => {
    const categoryMap: { [key: string]: string[] } = {
      'Smartphones': ['Smartphones', 'Mobile Phones', 'Phones', 'iPhone', 'Android', 'Mobile', 'Smartphone'],
      'Laptops': ['Laptops', 'Notebooks', 'Computers', 'PC', 'MacBook', 'Laptop'],
      'Tablets': ['Tablets', 'iPad', 'Android Tablet', 'Tablet'],
      'Headphones': ['Headphones', 'Earphones', 'Audio', 'Sound', 'Music'],
      'Cameras': ['Cameras', 'Photography', 'DSLR', 'Mirrorless', 'Digital Camera'],
      'Gaming': ['Gaming', 'Games', 'Console', 'PlayStation', 'Xbox', 'Nintendo'],
      'Smart Home': ['Smart Home', 'Home Automation', 'IoT', 'Smart Devices'],
      'Wearables': ['Wearables', 'Smartwatch', 'Fitness Tracker', 'Watch'],
      'Accessories': ['Accessories', 'Chargers', 'Cases', 'Cables', 'Adapters']
    }
    
    return categoryMap[category] || [category]
  }, [])

  // Search keywords for broader matching
  const getSearchKeywords = useCallback((category: string): string[] => {
    const keywords: string[] = []
    const lowerCaseCategory = category.toLowerCase()
    
    if (lowerCaseCategory.includes('smartphone')) {
      keywords.push('smartphone', 'mobile phone', 'phone', 'iphone', 'android')
    }
    if (lowerCaseCategory.includes('laptop')) {
      keywords.push('laptop', 'notebook', 'computer', 'pc', 'macbook')
    }
    if (lowerCaseCategory.includes('tablet')) {
      keywords.push('tablet', 'ipad')
    }
    if (lowerCaseCategory.includes('headphones')) {
      keywords.push('headphones', 'earphones', 'audio', 'sound', 'music')
    }
    if (lowerCaseCategory.includes('camera')) {
      keywords.push('camera', 'photography', 'dslr', 'mirrorless', 'digital camera')
    }
    if (lowerCaseCategory.includes('gaming')) {
      keywords.push('gaming', 'games', 'console', 'playstation', 'xbox', 'nintendo')
    }
    if (lowerCaseCategory.includes('smart home')) {
      keywords.push('smart home', 'home automation', 'iot', 'smart devices')
    }
    if (lowerCaseCategory.includes('wearables')) {
      keywords.push('wearables', 'smartwatch', 'fitness tracker', 'watch')
    }
    if (lowerCaseCategory.includes('accessories')) {
      keywords.push('accessories', 'chargers', 'cases', 'cables', 'adapters')
    }
    
    return keywords
  }, [])

  const searchProducts = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let foundProducts: SearchResult[] = []
      const { category, priceRange } = filters

      // If category is specified, try category-specific search first
      if (category && category !== 'All') {
        console.log('🔍 Searching in category:', category)
        
        // Get category variations for better matching
        const categoryVariations = getCategoryVariations(category)
        console.log('🔍 Trying category variations:', categoryVariations)
        
        // Try each category variation
        for (const catVariation of categoryVariations) {
          const { data: variationData, error: variationError } = await supabase
            .from('products')
            .select('id, name, price, image_url, category, description, stock, seller_id, created_at')
            .eq('category', catVariation)
            .ilike('name', `%${query}%`)
            .limit(20)
          
          if (variationError) {
            console.error('Variation search error:', catVariation, variationError)
            continue
          }
          
          if (variationData && variationData.length > 0) {
            console.log('🔍 Found', variationData.length, 'products in category variation:', catVariation)
            foundProducts = [...foundProducts, ...variationData]
          }
        }

        // If no results with category variations, try broader search within category
        if (foundProducts.length === 0) {
          console.log('🔍 No results in category variations, trying broader search...')
          
          const searchKeywords = getSearchKeywords(category)
          console.log('🔍 Search keywords:', searchKeywords)
          
          // Create OR query for multiple keywords within the category
          const orConditions = searchKeywords.map(keyword => 
            `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',')
          
          if (orConditions) {
            const { data: keywordData, error: keywordError } = await supabase
              .from('products')
              .select('id, name, price, image_url, category, description, stock, seller_id, created_at')
              .or(orConditions)
              .limit(20)
            
            if (!keywordError && keywordData) {
              foundProducts = keywordData
              console.log('🔍 Products found by keyword search:', foundProducts.length)
            }
          }
        }
      }

      // If no category-specific results or no category filter, do general search
      if (foundProducts.length === 0) {
        console.log('🔍 Doing general search for:', query)
        
        const { data: generalData, error: generalError } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, description, stock, seller_id, created_at')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(20)
        
        if (generalError) {
          console.error('General search error:', generalError)
        } else if (generalData) {
          foundProducts = generalData
          console.log('🔍 Products found by general search:', foundProducts.length)
        }
      }

      // Apply price range filter if specified
      if (priceRange && priceRange.length === 2) {
        foundProducts = foundProducts.filter(product => 
          product.price >= priceRange[0] && product.price <= priceRange[1]
        )
      }

      // Transform data to match SearchResult interface
      const transformedProducts = foundProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        description: product.description,
        rating: 4.0, // Default rating since field doesn't exist in DB
        reviewCount: 0, // Default review count since field doesn't exist in DB
        created_at: product.created_at || new Date().toISOString(),
        discount: 0, // Default discount since field doesn't exist in DB
        brand: product.category || 'Unknown', // Use category as brand since brand field doesn't exist
        inStock: (product.stock || 0) > 0, // Derive from stock count
        originalPrice: product.price, // Use current price as original price
        stock: product.stock || 0,
        seller_id: product.seller_id || 'unknown-seller'
      }))

      // Remove duplicates based on product ID
      const uniqueProducts = transformedProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )

      // Sort by relevance (exact matches first, then partial matches)
      const sortedProducts = uniqueProducts.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase())
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase())
        
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        
        return 0
      })

      setResults(sortedProducts)
      console.log('🔍 Search completed. Found', sortedProducts.length, 'products')
      
    } catch (error) {
      console.error('Search error:', error)
      setError('Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [getCategoryVariations, getSearchKeywords])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    searchProducts,
    clearResults
  }
}
