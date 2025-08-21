'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Heart, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  SlidersHorizontal,
  Search,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Product, supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import { useProductSearch } from '@/hooks/useProductSearch'

const CategoryPage = ({ params }: { params: { slug: string } }) => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Ref for smooth scrolling to product list
  const productListRef = useRef<HTMLDivElement>(null)
  
  // Use the search hook for better search functionality
  const { results: searchResults, loading: isSearching, searchProducts, clearResults } = useProductSearch()

  // Get selected category from URL query parameters
  const selectedCategoryFromURL = searchParams.get('category')

  // Update selectedCategories when URL category changes
  useEffect(() => {
    if (selectedCategoryFromURL && selectedCategoryFromURL !== 'All') {
      setSelectedCategories([selectedCategoryFromURL])
      console.log('Updated selectedCategories from URL:', selectedCategoryFromURL)
    } else {
      setSelectedCategories([])
    }
  }, [selectedCategoryFromURL])

  // Get category info based on slug
  const getCategoryInfo = (slug: string) => {
    const categoryMap: { [key: string]: { name: string; description: string } } = {
      'electronics': {
        name: selectedCategoryFromURL && selectedCategoryFromURL !== 'All' ? selectedCategoryFromURL : 'Electronics',
        description: selectedCategoryFromURL && selectedCategoryFromURL !== 'All' 
          ? `Discover the latest ${selectedCategoryFromURL.toLowerCase()} and devices`
          : 'Discover the latest gadgets, devices, and electronic accessories'
      },
      'mobile-phones': {
        name: 'Mobile Phones',
        description: 'Latest smartphones and mobile devices from top brands'
      },
      'gaming': {
        name: 'Gaming',
        description: 'Gaming consoles, accessories, and equipment for gamers'
      },
      'accessories': {
        name: 'Accessories',
        description: 'Essential accessories and add-ons for your devices'
      },
      'home-appliances': {
        name: 'Home Appliances',
        description: 'Smart home appliances and kitchen equipment'
      },
      'fashion': {
        name: 'Fashion',
        description: 'Trendy clothing and accessories for every style'
      },
      'mens-clothing': {
        name: 'Men\'s Clothing',
        description: 'Stylish and comfortable clothing for men'
      },
      'womens-clothing': {
        name: 'Women\'s Clothing',
        description: 'Fashionable and elegant apparel for women'
      },
      'kids-fashion': {
        name: 'Kids\' Fashion',
        description: 'Cute and durable clothing for children'
      },
      'shoes': {
        name: 'Shoes',
        description: 'Footwear for every occasion and style'
      },
      'bags': {
        name: 'Bags',
        description: 'Stylish and functional bags for all your needs'
      },
      'home-garden': {
        name: 'Home & Garden',
        description: 'Everything you need for your home and garden'
      },
      'sports': {
        name: 'Sports',
        description: 'Sports equipment and gear for all activities'
      }
    }
    return categoryMap[slug] || { name: 'Category', description: 'Browse our products' }
  }

  const categoryInfo = getCategoryInfo(params.slug)
  const categoryName = categoryInfo.name
  const categoryDescription = categoryInfo.description

  // Debug logging for category info
  console.log('Category Info:', categoryInfo)
  console.log('Category Name:', categoryName)
  console.log('Category Slug:', params.slug)

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for category:', categoryName, 'slug:', params.slug)
        console.log('Selected category from URL:', selectedCategoryFromURL)
        
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        let data: any[] = []

        // Handle main Fashion category - fetch all fashion subcategories
        if (params.slug === 'fashion') {
          query = query.in('category', ['Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Fashion', 'Shoes', 'Bags'])
        } else if (params.slug === 'electronics') {
          // If a specific category is selected from URL, filter by that category
          if (selectedCategoryFromURL && selectedCategoryFromURL !== 'All') {
            console.log('Filtering by selected category:', selectedCategoryFromURL)
            
            // Get category variations for better matching (similar to navbar logic)
            const getCategoryVariations = (category: string) => {
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
            }
            
            const categoryVariations = getCategoryVariations(selectedCategoryFromURL)
            console.log('Category variations to search:', categoryVariations)
            
            // First, try to find products by exact category match
            let foundProducts: any[] = []
            
            for (const catVariation of categoryVariations) {
              const { data: variationData, error: variationError } = await supabase
                .from('products')
                .select('*')
                .eq('category', catVariation)
                .order('created_at', { ascending: false })
              
              if (variationError) {
                console.error('Error fetching category variation:', catVariation, variationError)
                continue
              }
              
              if (variationData && variationData.length > 0) {
                console.log('Found', variationData.length, 'products in category variation:', catVariation)
                foundProducts = [...foundProducts, ...variationData]
              }
            }
            
            // If we found products in category variations, use those
            if (foundProducts.length > 0) {
              console.log('Total products found in category variations:', foundProducts.length)
              data = foundProducts
            } else {
              // Fallback: search by name containing the category keywords
              console.log('No products found in category variations, trying broader search...')
              
              // Create a broader search query that looks for products containing category-related keywords
              const getSearchKeywords = (category: string) => {
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
              }

              const searchKeywords = getSearchKeywords(selectedCategoryFromURL)
              console.log('Search keywords:', searchKeywords)
              
              // Create OR query for multiple keywords
              const orConditions = searchKeywords.map(keyword => `name.ilike.%${keyword}%,description.ilike.%${keyword}%`).join(',')
              console.log('OR conditions:', orConditions)
              
              const { data: nameSearchData, error: nameSearchError } = await supabase
                .from('products')
                .select('*')
                .or(orConditions)
                .order('created_at', { ascending: false })
              
              if (nameSearchError) {
                console.error('Error in name search:', nameSearchError)
              } else {
                data = nameSearchData || []
                console.log('Products found by broader search:', data.length)
              }
              
              // If still no products found, try an even broader search
              if (data.length === 0) {
                console.log('Still no products found, trying very broad search...')
                
                // Try searching for products that contain any word from the category
                const categoryWords = selectedCategoryFromURL.toLowerCase().split(' ')
                console.log('Category words to search:', categoryWords)
                
                // Search in both name and description
                const { data: broadSearchData, error: broadSearchError } = await supabase
                  .from('products')
                  .select('*')
                  .or(categoryWords.map(word => `name.ilike.%${word}%,description.ilike.%${word}%`).join(','))
                  .order('created_at', { ascending: false })
                
                if (broadSearchError) {
                  console.error('Error in broad search:', broadSearchError)
                } else {
                  data = broadSearchData || []
                  console.log('Products found by broad search:', data.length)
                }
                
                // Final fallback: search for any product containing the category name anywhere
                if (data.length === 0) {
                  console.log('Final fallback: searching for any product containing category name...')
                  
                  const { data: finalSearchData, error: finalSearchError } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${selectedCategoryFromURL}%,description.ilike.%${selectedCategoryFromURL}%,category.ilike.%${selectedCategoryFromURL}%`)
                    .order('created_at', { ascending: false })
                  
                  if (finalSearchError) {
                    console.error('Error in final search:', finalSearchError)
                  } else {
                    data = finalSearchData || []
                    console.log('Products found by final fallback search:', data.length)
                  }
                }
              }
            }
          } else {
            // Show ALL products for Electronics page (not just Electronics category)
            query = supabase
              .from('products')
              .select('*')
              .order('created_at', { ascending: false })
          }
        } else {
          query = query.eq('category', categoryName)
        }

        // If we haven't set data yet, execute the query
        if (data.length === 0) {
          // Add debug logging
          console.log('Query being executed:', query)
          console.log('Category being searched:', categoryName)
          console.log('Slug being used:', params.slug)

          let { data: queryData, error } = await query

        if (error) {
          console.error('Error fetching products:', error)
          setLoading(false)
          return
          }

          data = queryData || []
        }

        console.log('Raw products data:', data)
        
        // Debug: Show unique categories found
        if (data && data.length > 0) {
          const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category)))
          console.log('Unique categories found in products:', uniqueCategories)
          console.log('Sample products:', data.slice(0, 3).map((p: any) => ({ name: p.name, category: p.category })))
        }

        // Transform data to match Product interface
        const transformedProducts = data?.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock || 0,
          category: product.category || 'Unknown',
          seller_id: product.seller_id || 'unknown-seller',
          originalPrice: product.original_price,
          image_url: product.image_url || product.image, // Handle both column names
          rating: product.rating || 4.0,
          reviewCount: product.review_count || 0,
          brand: product.brand || product.category || 'Unknown',
          inStock: product.in_stock !== false, // Default to true if not specified
          discount: product.discount || 0,
          created_at: product.created_at || new Date().toISOString()
        })) || []

        console.log('Transformed products:', transformedProducts)
        setProducts(transformedProducts)
        
        // If no products found, still set loading to false
        if (!data || data.length === 0) {
          console.log('No products found for category:', categoryName)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 seconds timeout

    fetchProducts()

    return () => clearTimeout(timeoutId)
  }, [categoryName, params.slug, selectedCategoryFromURL])

  // Add scroll event listener for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get brands based on category
  const getBrands = (categorySlug: string) => {
    const brandMap: { [key: string]: string[] } = {
      'electronics': ['Apple', 'Samsung', 'Sony', 'ASUS', 'Anker', 'Ring', 'JBL', 'Corsair', 'Logitech', 'Google', 'OnePlus', 'Xiaomi', 'Motorola', 'Microsoft', 'Nintendo', 'SteelSeries', 'SecretLab', 'Spigen', 'ZAGG', 'iOttie', 'RAVPower', 'iRobot', 'Dyson', 'LG', 'Breville', 'Panasonic'],
      'fashion': ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Gap', 'Forever 21', 'ASOS', 'Topshop', 'Mango', 'Pull&Bear', 'Bershka', 'Massimo Dutti', 'COS', 'Arket', 'Weekday', 'Urban Outfitters', 'American Eagle', 'Hollister', 'Aeropostale', 'Old Navy', 'Target'],
      'mobile-phones': ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Motorola', 'Huawei', 'Sony', 'LG', 'Nokia', 'BlackBerry', 'HTC'],
      'gaming': ['Sony', 'Microsoft', 'Nintendo', 'SteelSeries', 'SecretLab', 'Razer', 'Logitech', 'Corsair', 'HyperX', 'Astro', 'Turtle Beach', 'Sennheiser'],
      'accessories': ['Anker', 'Spigen', 'ZAGG', 'iOttie', 'RAVPower', 'Belkin', 'Mophie', 'OtterBox', 'UAG', 'Case-Mate', 'Incipio', 'Speck'],
      'home-appliances': ['Samsung', 'iRobot', 'Dyson', 'LG', 'Breville', 'Panasonic', 'Philips', 'KitchenAid', 'Cuisinart', 'Ninja', 'Instant Pot', 'Vitamix'],
      'mens-clothing': ['Zara', 'Levi\'s', 'Tommy Hilfiger', 'Hugo Boss', 'Nike', 'The North Face'],
      'womens-clothing': ['H&M', 'Uniqlo', 'Forever 21', 'Zara'],
      'kids-fashion': ['Gap', 'Old Navy'],
      'shoes': ['Nike', 'Adidas', 'Clarks', 'Forever 21'],
      'bags': ['Calvin Klein', 'ASOS', 'Herschel', 'Adidas']
    }
    
    // For main Fashion category, return all fashion brands
    if (categorySlug === 'fashion') {
      return ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Gap', 'Forever 21', 'ASOS', 'Hugo Boss', 'The North Face', 'Clarks', 'Herschel', 'Old Navy']
    }
    
    return brandMap[categorySlug] || brandMap['electronics']
  }

  const brands = getBrands(params.slug)

  // Get category filters for Electronics
  const getCategoryFilters = (categorySlug: string) => {
    const categoryFilters: { [key: string]: Array<{ name: string }> } = {
      'electronics': [
        { name: 'Smartphones' },
        { name: 'Laptops' },
        { name: 'Tablets' },
        { name: 'Headphones' },
        { name: 'Cameras' },
        { name: 'Gaming' },
        { name: 'Smart Home' },
        { name: 'Wearables' },
        { name: 'Accessories' }
      ],
      'mobile-phones': [
        { name: 'iPhone' },
        { name: 'Samsung' },
        { name: 'Google' },
        { name: 'OnePlus' },
        { name: 'Xiaomi' },
        { name: 'Motorola' }
      ],
      'gaming': [
        { name: 'PlayStation' },
        { name: 'Xbox' },
        { name: 'Nintendo' },
        { name: 'PC Gaming' },
        { name: 'Accessories' }
      ],
      'home-appliances': [
        { name: 'Kitchen' },
        { name: 'Cleaning' },
        { name: 'Laundry' },
        { name: 'Climate' },
        { name: 'Smart Home' }
      ]
    }
    
    return categoryFilters[categorySlug] || categoryFilters['electronics']
  }

  // Get related categories based on current category
  const getRelatedCategories = (currentSlug: string) => {
    const categoryMap: { [key: string]: Array<{ name: string; slug: string }> } = {
      'electronics': [
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Cameras', slug: 'cameras' }
      ],
      'fashion': [
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' },
        { name: 'Kids\' Fashion', slug: 'kids-fashion' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Bags', slug: 'bags' }
      ],
      'mobile-phones': [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Accessories', slug: 'accessories' }
      ],
      'gaming': [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Mobile Phones', slug: 'mobile-phones' },
        { name: 'Accessories', slug: 'accessories' }
      ],
      'accessories': [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Mobile Phones', slug: 'mobile-phones' },
        { name: 'Gaming', slug: 'gaming' }
      ],
      'home-appliances': [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Accessories', slug: 'accessories' }
      ],
      'mens-clothing': [
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' },
        { name: 'Shoes', slug: 'shoes' }
      ],
      'womens-clothing': [
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Shoes', slug: 'shoes' }
      ],
      'kids-fashion': [
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' }
      ],
      'shoes': [
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' }
      ],
      'bags': [
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' }
      ]
    }
    
    // Filter out current category and return others
    return (categoryMap[currentSlug] || categoryMap['electronics']).filter(cat => cat.slug !== currentSlug)
  }

  const relatedCategories = getRelatedCategories(params.slug)

  // Generate breadcrumb items
  const getBreadcrumbItems = () => {
    // Determine parent category based on current category
    const categoryHierarchy: { [key: string]: { parent: string; parentHref: string } } = {
      'electronics': { parent: '', parentHref: '' },
      'mobile-phones': { parent: 'Electronics', parentHref: '/category/electronics' },
      'gaming': { parent: 'Electronics', parentHref: '/category/electronics' },
      'accessories': { parent: 'Electronics', parentHref: '/category/electronics' },
      'home-appliances': { parent: 'Electronics', parentHref: '/category/electronics' },
      'fashion': { parent: '', parentHref: '' },
      'mens-clothing': { parent: 'Fashion', parentHref: '/category/fashion' },
      'womens-clothing': { parent: 'Fashion', parentHref: '/category/fashion' },
      'kids-fashion': { parent: 'Fashion', parentHref: '/category/fashion' },
      'shoes': { parent: 'Fashion', parentHref: '/category/fashion' },
      'bags': { parent: 'Fashion', parentHref: '/category/fashion' }
    }
    
    const hierarchy = categoryHierarchy[params.slug] || { parent: '', parentHref: '' }
    
    if (hierarchy.parent === '') {
      // Main category page
      return [
        { name: 'Home', href: '/' },
        { name: 'Featured Categories', href: '/#featured-categories' },
        { name: categoryName, href: null, isCurrent: true }
      ]
    } else {
      // Subcategory page
      return [
        { name: 'Home', href: '/' },
        { name: 'Featured Categories', href: '/#featured-categories' },
        { name: hierarchy.parent, href: hierarchy.parentHref },
        { name: categoryName, href: null, isCurrent: true }
      ]
    }
  }

  const breadcrumbItems = getBreadcrumbItems()

  // Filter and sort products
  const filteredProducts = (searchResults.length > 0 ? searchResults : products)
    .filter(product => {
      if (selectedCategories.length > 0) {
        // Check if product's actual category matches any selected category
        const productMatchesCategory = selectedCategories.some((selectedCategory: string) => {
          // Direct category field comparison (case-insensitive)
          return product.category.toLowerCase() === selectedCategory.toLowerCase()
        })
        if (!productMatchesCategory) return false
      }
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'newest':
          return new Date(b.created_at || new Date()).getTime() - new Date(a.created_at || new Date()).getTime()
        default:
          return (b.reviewCount || 0) - (a.reviewCount || 0)
      }
    })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
    // Reset to first page and scroll to top when filters change
    setCurrentPage(1)
    setTimeout(() => {
      scrollToProductList()
    }, 100)
  }

  // Smooth scroll to top of product list
  const scrollToProductList = () => {
    if (productListRef.current) {
      setIsScrolling(true)
      
      // Add smooth-scroll class for better cross-browser support
      document.documentElement.classList.add('smooth-scroll')
      
      // Get the element position and account for navbar height (64px = 4rem)
      const elementTop = productListRef.current.offsetTop - 80
      
      // Smooth scroll to the element with offset
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      })
      
      // Remove the class and reset scrolling state after scrolling
      setTimeout(() => {
        document.documentElement.classList.remove('smooth-scroll')
        setIsScrolling(false)
      }, 1000)
    }
  }

  // Handle page change with smooth scrolling
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of product list after a brief delay to ensure state update
    setTimeout(() => {
      scrollToProductList()
    }, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
        </div>
      </div>
    )
  }

  // Show message if no products found
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
                {/* Header/Banner Section */}
        <section className="relative h-64 md:h-80 bg-gradient-to-r from-gray-900 to-gray-800">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
            }}
          />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {categoryName}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {categoryDescription}
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find any products in the "{categoryName}" category at the moment.
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="inline-block bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back to Home
                </Link>
                <p className="text-sm text-gray-500">
                  Check back later or browse other categories
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }}
          className="fixed bottom-6 right-6 z-50 bg-primary-red hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Banner Section */}
      <section className="relative h-64 md:h-80 bg-gradient-to-r from-gray-900 to-gray-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                         {/* Breadcrumb */}
             <nav className="mb-4">
               {/* Category Indicator */}
               {selectedCategoryFromURL && selectedCategoryFromURL !== 'All' && (
                 <div className="mb-3 flex items-center space-x-3">
                   <div className="p-2 bg-primary-red/20 border border-primary-red/30 rounded-lg inline-block">
                     <span className="text-primary-red font-medium text-sm">
                       📱 Viewing: {selectedCategoryFromURL}
                     </span>
                   </div>
                   <Link
                     href="/category/electronics"
                     className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-md transition-colors border border-white/30"
                   >
                     ✕ Clear Filter
                   </Link>
                 </div>
               )}
               
               <ol className="flex items-center space-x-2 text-xs sm:text-sm text-white/80 flex-wrap">
                 {breadcrumbItems.map((item, index) => (
                   <React.Fragment key={index}>
                     <li className="flex items-center">
                       {item.href ? (
                         <Link href={item.href} className="hover:text-white transition-colors">
                           {item.name}
                         </Link>
                       ) : (
                         <span className={item.isCurrent ? "text-white font-medium" : ""}>
                           {item.name}
                         </span>
                       )}
                     </li>
                     {index < breadcrumbItems.length - 1 && (
                       <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                     )}
                   </React.Fragment>
                 ))}
               </ol>
             </nav>
            
            {/* Category Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {categoryName}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {categoryDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
              
              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>


                {/* Sort Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      // Reset to first page and scroll to top when sort changes
                      setCurrentPage(1)
                      setTimeout(() => {
                        scrollToProductList()
                      }, 100)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getCategoryFilters(params.slug).map(category => (
                      <label key={category.name} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => handleCategoryToggle(category.name)}
                          className="rounded border-gray-300 text-primary-red focus:ring-primary-red"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-4">
                    {/* Custom Price Inputs */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                        <input
                          type="number"
                          min="0"
                          max="99999"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            // Ensure min price doesn't exceed max price
                            if (value <= priceRange[1]) {
                              setPriceRange([value, priceRange[1]])
                              setCurrentPage(1)
                              setTimeout(() => {
                                scrollToProductList()
                              }, 100)
                            }
                          }}
                          onBlur={(e) => {
                            // Validate and fix min price on blur
                            const value = parseInt(e.target.value) || 0
                            if (value < 0) {
                              setPriceRange([0, priceRange[1]])
                            } else if (value > priceRange[1]) {
                              setPriceRange([priceRange[1], priceRange[1]])
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                        <input
                          type="number"
                          min="0"
                          max="99999"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1000
                            // Ensure max price is not less than min price
                            if (value >= priceRange[0]) {
                              setPriceRange([priceRange[0], value])
                              setCurrentPage(1)
                              setTimeout(() => {
                                scrollToProductList()
                              }, 100)
                            }
                          }}
                          onBlur={(e) => {
                            // Validate and fix max price on blur
                            const value = parseInt(e.target.value) || 1000
                            if (value < priceRange[0]) {
                              setPriceRange([priceRange[0], priceRange[0] + 100])
                            } else if (value > 99999) {
                              setPriceRange([priceRange[0], 99999])
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="1000+"
                        />
                      </div>
                    </div>
                    
                    {/* Price Range Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                        max="10000"
                        step="100"
                      value={priceRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          const minValue = Math.min(value, priceRange[0])
                          setPriceRange([minValue, value])
                          setCurrentPage(1)
                          setTimeout(() => {
                            scrollToProductList()
                          }, 100)
                        }}
                        className="w-full price-range-slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>$0</span>
                        <span>$2,500</span>
                        <span>$5,000</span>
                        <span>$7,500</span>
                        <span>$10,000+</span>
                      </div>
                    </div>
                    
                    {/* Quick Price Presets */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Quick Presets:</p>
                      <div className="flex flex-wrap gap-2">
                        {[100, 500, 1000, 2500, 5000, 10000].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => {
                              setPriceRange([0, preset])
                              setCurrentPage(1)
                              setTimeout(() => {
                                scrollToProductList()
                              }, 100)
                            }}
                            className={`px-2 py-1 text-xs rounded-md transition-colors price-preset-button ${
                              priceRange[1] === preset
                                ? 'bg-primary-red text-white active'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            ${preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceRange([0, 10000])
                    // Reset to first page and scroll to top when filters are cleared
                    setCurrentPage(1)
                    setTimeout(() => {
                      scrollToProductList()
                    }, 100)
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Main Content */}
          <div className="flex-1">
            {/* Category Stats Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {categoryName} Collection
                  </h2>
                  <p className="text-gray-600">
                    {filteredProducts.length} amazing products waiting for you
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {getCategoryFilters(params.slug).length}
                    </div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.max(...filteredProducts.map(p => p.rating || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Top Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} products found
                </span>
              </div>
              
              <div className="flex items-center space-x-4">

                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
                  <button
                    onClick={() => {
                      setViewMode('grid')
                      // Scroll to top when view mode changes
                      setTimeout(() => {
                        scrollToProductList()
                      }, 100)
                    }}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-red text-white' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('list')
                      // Scroll to top when view mode changes
                      setTimeout(() => {
                        scrollToProductList()
                      }, 100)
                    }}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-red text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div 
              ref={productListRef} 
              className={`grid gap-6 transition-all duration-300 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
              } ${isScrolling ? 'opacity-90' : 'opacity-100'}`}
            >
              {currentProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchResults.length > 0 
                      ? 'No products match your current filters. Try adjusting your search criteria.'
                      : 'No products found for your search. Try different keywords or browse all categories.'
                    }
                  </p>
                  {searchResults.length > 0 && (
                    <button
                      onClick={() => clearResults()}
                      className="bg-primary-red hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                currentProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100">
                  <div className="relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-primary-red text-white px-2 py-1 rounded text-sm font-semibold">
                        {product.discount}% OFF
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.brand}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-red">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <AddToCartButton
                      product={{
                        id: product.id.toString(),
                        name: product.name,
                        description: product.description || '',
                        price: product.price,
                        image_url: product.image_url,
                        category: product.category,
                        seller_id: product.seller_id || 'unknown-seller'
                      }}
                      className="w-full"
                      size="md"
                    />
                  </div>
                </div>
              ))
            )}
            </div>

            {/* Pagination */}
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                {/* Show All Button */}
                  <button
                  onClick={() => handlePageChange(1)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-primary-red text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Show All
                </button>
                
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                {/* Page Numbers */}
                {totalPages > 1 && (
                  <>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                        onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === index + 1
                          ? 'bg-primary-red text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  </>
                )}
                  
                {/* Next Button */}
                  <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                
                {/* Page Info */}
                <div className="ml-4 text-sm text-gray-600">
                  Page {currentPage} of {Math.max(1, totalPages)} • {filteredProducts.length} products
                </div>
              </div>
          </div>
        </div>
      </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }}
          className="fixed bottom-6 right-6 z-50 bg-primary-red hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default CategoryPage
