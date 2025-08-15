'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import AddToCartButton from './AddToCartButton'
import Link from 'next/link'

interface DealProduct {
  id: string
  name: string
  image: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  endTime: Date
  category: string
}

const TodaysDeals: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const deals: DealProduct[] = [
    {
      id: '1',
      name: 'Wireless Noise-Canceling Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      originalPrice: 299.99,
      discountedPrice: 179.99,
      discountPercentage: 40,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Premium Fitness Smartwatch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      originalPrice: 399.99,
      discountedPrice: 249.99,
      discountPercentage: 38,
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      category: 'Electronics'
    },
    {
      id: '3',
      name: '4K Ultra HD Smart TV',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      originalPrice: 899.99,
      discountedPrice: 599.99,
      discountPercentage: 33,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      category: 'Electronics'
    },
    {
      id: '4',
      name: 'Smart Home Security Bundle',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      originalPrice: 199.99,
      discountedPrice: 119.99,
      discountPercentage: 40,
      endTime: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
      category: 'Electronics'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const endTime = deals[0].endTime.getTime() // Use first deal's time for demo
      const distance = endTime - now

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])



  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-primary-red mr-3" />
            <h2 className="text-3xl font-bold text-primary-text">
              Today's Deals
            </h2>
          </div>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-6">
            Limited time offers on premium products. Don't miss out on these amazing deals!
          </p>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Clock className="w-5 h-5 text-primary-red" />
            <span className="text-sm font-medium text-primary-text">Deal ends in:</span>
            <div className="flex space-x-2">
              <div className="bg-primary-red text-white px-3 py-1 rounded-lg text-sm font-bold">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className="text-primary-text font-bold">:</span>
              <div className="bg-primary-red text-white px-3 py-1 rounded-lg text-sm font-bold">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className="text-primary-text font-bold">:</span>
              <div className="bg-primary-red text-white px-3 py-1 rounded-lg text-sm font-bold">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <div 
              key={deal.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative">
                <img 
                  src={deal.image} 
                  alt={deal.name}
                  className="w-full h-48 object-cover"
                />
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-primary-red text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{deal.discountPercentage}%
                </div>
                {/* Category Badge */}
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-primary-text px-3 py-1 rounded-full text-sm font-semibold">
                  {deal.category}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="font-semibold text-lg text-primary-text mb-3 line-clamp-2 overflow-hidden">
                  {deal.name}
                </h3>
                
                {/* Pricing */}
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-primary-red">
                    ${deal.discountedPrice}
                  </span>
                  <span className="text-lg text-text-muted line-through ml-3">
                    ${deal.originalPrice}
                  </span>
                </div>
                
                {/* Savings Info */}
                <div className="text-sm text-green-600 font-medium mb-4">
                  You save ${(deal.originalPrice - deal.discountedPrice).toFixed(2)}!
                </div>
                
                {/* Add to Cart Button */}
                <AddToCartButton
                  product={{
                    id: deal.id,
                    name: deal.name,
                    description: `${deal.name} - ${deal.category}`,
                    price: deal.discountedPrice,
                    originalPrice: deal.originalPrice,
                    image_url: deal.image,
                    rating: 4.5,
                    reviewCount: 0,
                    brand: deal.category,
                    inStock: true,
                    discount: deal.discountPercentage,
                    created_at: new Date().toISOString()
                  }}
                  className="w-full"
                  disabled={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* View All Deals Button */}
        <div className="text-center mt-12">
          <Link
            href="/category/electronics"
            className="inline-flex items-center bg-primary-red hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            View All Deals
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TodaysDeals
