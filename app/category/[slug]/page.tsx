'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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

const CategoryPage = ({ params }: { params: { slug: string } }) => {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Get category info based on slug
  const getCategoryInfo = (slug: string) => {
    const categoryMap: { [key: string]: { name: string; description: string } } = {
      'electronics': {
        name: 'Electronics',
        description: 'Discover the latest gadgets, devices, and electronic accessories'
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

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for category:', categoryName, 'slug:', params.slug)
        
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        // Handle main Fashion category - fetch all fashion subcategories
        if (params.slug === 'fashion') {
          query = query.in('category', ['Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Fashion', 'Shoes', 'Bags'])
        } else {
          query = query.eq('category', categoryName)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching products:', error)
          setLoading(false)
          return
        }

        console.log('Raw products data:', data)

        // Transform data to match Product interface
        const transformedProducts = data?.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
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
  }, [categoryName, params.slug])

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
        { name: 'Gaming' },
        { name: 'Audio' },
        { name: 'Cameras' },
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
        { name: 'Mobile Phones', slug: 'mobile-phones' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Home Appliances', slug: 'home-appliances' }
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
  const filteredProducts = products
    .filter(product => {
      if (selectedCategories.length > 0) {
        // Check if product matches any selected category
        const productMatchesCategory = selectedCategories.some((selectedCategory: string) => {
          // Simple category matching based on product name/description
          const productText = `${product.name} ${product.description}`.toLowerCase()
          return productText.includes(selectedCategory.toLowerCase())
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
          return b.rating - a.rating
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return b.reviewCount - a.reviewCount
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
                    onChange={(e) => setSortBy(e.target.value)}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceRange([0, 1000])
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
                      {Math.max(...filteredProducts.map(p => p.rating), 0)}
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
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-red text-white' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-red text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {currentProducts.map(product => (
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
                    

                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === index + 1
                          ? 'bg-primary-red text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
