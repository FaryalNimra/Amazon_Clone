'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Smartphone, Shirt, Home as HomeIcon, BookOpen, Heart, Gamepad2, Car, Trophy, Clock, Tag, ShoppingCart } from 'lucide-react'
import TodaysDeals from '@/components/TodaysDeals'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { useCart } from '@/contexts/CartContext'

export default function Home() {
  // Get message from URL query parameters
  const [message, setMessage] = useState<string | null>(null)
  const { user, getUserRole } = useAuth()
  const { openSignInModal } = useModal()
  const { addToCart, loading: cartLoading } = useCart()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const messageParam = urlParams.get('message')
      if (messageParam) {
        setMessage(messageParam)
        // Clear the message from URL after displaying
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  const handleAddToCart = async (product: any) => {
    // Check if user is authenticated as a buyer
    if (!user) {
      // User not logged in, show sign-in modal
      openSignInModal()
      return
    }

    const userRole = getUserRole()
    if (userRole !== 'buyer') {
      // User is not a buyer (e.g., they're a seller), show sign-in modal for buyer
      openSignInModal()
      return
    }

    // User is authenticated as a buyer, proceed with add to cart
    try {
      // Transform product data to match Product interface
      const productData = {
        id: Math.floor(Math.random() * 10000), // Generate unique numeric ID
        name: product.name,
        description: `${product.name} - ${product.category}`,
        price: product.price,
        originalPrice: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        brand: product.category,
        inStock: true,
        discount: 0
      }
      
      await addToCart(productData)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white-bg">
      {/* Message Display */}
      {message && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg max-w-md text-center">
          <div className="flex items-center justify-between">
            <span className="text-sm">{message}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-yellow-600 hover:text-yellow-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-red bg-opacity-90 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              Limited Time Offer
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover the Best Deals
            </h1>
            
            {/* Subheading */}
            <p className="text-xl sm:text-2xl lg:text-3xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Up to 50% Off on Top Brands
            </p>
            
                         {/* Call to Action */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <button 
                 onClick={() => {
                   setTimeout(() => {
                     const element = document.getElementById('featured-products')
                     if (element) {
                       element.scrollIntoView({ 
                         behavior: 'smooth',
                         block: 'start'
                       })
                       console.log('Scrolling to featured products')
                     } else {
                       console.log('Featured products section not found')
                     }
                   }, 100)
                 }}
                 className="group bg-primary-red hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center"
               >
                 Shop Now
                 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
               
               <button 
                 onClick={() => {
                   setTimeout(() => {
                     const element = document.getElementById('featured-categories')
                     if (element) {
                       element.scrollIntoView({ 
                         behavior: 'smooth',
                         block: 'start'
                       })
                       console.log('Scrolling to featured categories')
                     } else {
                       console.log('Featured categories section not found')
                     }
                   }, 100)
                 }}
                 className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
               >
                 Browse Categories
               </button>
             </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-300">
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Free Shipping
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Secure Payment
              </div>
              <div className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Store Section */}
      <section className="py-24 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-text mb-4">
              Why Choose Our Store?
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              We provide everything you need for a seamless shopping experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-red rounded-xl flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-4">
                Fast & Free Shipping
              </h3>
              <p className="text-text-muted">
                Get your orders delivered quickly with our free shipping on all orders over $50
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-red rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-4">
                Secure Shopping
              </h3>
              <p className="text-text-muted">
                Shop with confidence with our secure payment processing and buyer protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-red rounded-xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-4">
                Premium Quality
              </h3>
              <p className="text-text-muted">
                Curated selection of high-quality products from trusted brands worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Deals Section */}
      <TodaysDeals />

             {/* Featured Categories Section */}
       <section id="featured-categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-text mb-4">
              Featured Categories
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Explore our wide range of products across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                name: 'Electronics', 
                icon: Smartphone, 
                color: 'bg-blue-500',
                gradient: 'from-blue-500 to-blue-600',
                description: 'Latest gadgets and devices'
              },
              { 
                name: 'Fashion', 
                icon: Shirt, 
                color: 'bg-pink-500',
                gradient: 'from-pink-500 to-pink-600',
                description: 'Trendy clothing and accessories'
              },
              { 
                name: 'Home & Garden', 
                icon: HomeIcon, 
                color: 'bg-green-500',
                gradient: 'from-green-500 to-green-600',
                description: 'Everything for your home'
              },
              { 
                name: 'Sports', 
                icon: Trophy, 
                color: 'bg-orange-500',
                gradient: 'from-orange-500 to-orange-600',
                description: 'Sports equipment and gear'
              },
              { 
                name: 'Books', 
                icon: BookOpen, 
                color: 'bg-purple-500',
                gradient: 'from-purple-500 to-purple-600',
                description: 'Books for all interests'
              },
              { 
                name: 'Beauty', 
                icon: Heart, 
                color: 'bg-red-500',
                gradient: 'from-red-500 to-red-600',
                description: 'Beauty and personal care'
              },
              { 
                name: 'Toys', 
                icon: Gamepad2, 
                color: 'bg-yellow-500',
                gradient: 'from-yellow-500 to-yellow-600',
                description: 'Fun toys and games'
              },
              { 
                name: 'Automotive', 
                icon: Car, 
                color: 'bg-gray-500',
                gradient: 'from-gray-500 to-gray-600',
                description: 'Auto parts and accessories'
              }
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <Link 
                  key={index}
                  href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group block"
                >
                  <div className={`bg-gradient-to-br ${category.gradient} rounded-xl p-6 text-center text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}>
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-white text-opacity-80">{category.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* View All Categories Button */}
          <div className="text-center mt-12">
            <Link 
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-primary-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

             {/* Featured Products Section */}
       <section id="featured-products" className="py-24 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-primary-red mr-3" />
              <h2 className="text-3xl font-bold text-primary-text">
                Featured Products
              </h2>
            </div>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Our most popular and highly-rated products that customers love
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Wireless Bluetooth Headphones',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 89.99,
                rating: 4.8,
                reviewCount: 1247,
                category: 'Electronics'
              },
              {
                name: 'Premium Running Shoes',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 79.99,
                rating: 4.9,
                reviewCount: 892,
                category: 'Sports'
              },
              {
                name: 'Smart Home Security Camera',
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 149.99,
                rating: 4.7,
                reviewCount: 567,
                category: 'Electronics'
              },
              {
                name: 'Organic Skincare Set',
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 44.99,
                rating: 4.6,
                reviewCount: 334,
                category: 'Beauty'
              },
              {
                name: 'Portable Bluetooth Speaker',
                image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 64.99,
                rating: 4.5,
                reviewCount: 445,
                category: 'Electronics'
              },
              {
                name: 'Designer Watch Collection',
                image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                price: 199.99,
                rating: 4.9,
                reviewCount: 678,
                category: 'Fashion'
              }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                {/* Product Image */}
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-primary-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm text-text-muted mb-2">{product.category}</div>
                  <h3 className="font-semibold text-lg text-primary-text mb-3 line-clamp-2 overflow-hidden">
                    {product.name}
                  </h3>
                  
                  {/* Star Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : i < product.rating 
                                ? 'text-yellow-400 fill-current opacity-50' 
                                : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-muted ml-2">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                  
                  {/* Pricing */}
                  <div className="flex items-center mb-4">
                    <span className="text-2xl font-bold text-primary-red">
                      ${product.price}
                    </span>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={cartLoading}
                      className="w-full bg-primary-red hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                    >
                      <ShoppingCart className="mr-2 w-4 h-4" />
                      {cartLoading ? 'Adding...' : 
                       !user || getUserRole() !== 'buyer' ? 'Sign In to Buy' : 'Add to Cart'}
                    </button>
                    
                    <Link 
                      href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-primary-text font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center border border-gray-300"
                    >
                      View Product
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Products Button */}
          <div className="text-center mt-12">
            <Link 
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-primary-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
                     </div>
         </div>
       </section>
     </div>
   )
}