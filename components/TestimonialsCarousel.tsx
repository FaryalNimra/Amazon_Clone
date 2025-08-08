'use client'

import React, { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Testimonial {
  name: string
  image: string
  rating: number
  feedback: string
  location: string
}

const TestimonialsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  const testimonials: Testimonial[] = [

    {
      name: 'Michael Chen',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'Best online shopping experience ever! The customer service team was incredibly helpful when I had questions about my order.',
      location: 'Los Angeles, CA'
    },
    {
      name: 'Emily Rodriguez',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'I love the variety of products available. Found exactly what I was looking for at great prices. Will definitely shop here again!',
      location: 'Miami, FL'
    },
    {
      name: 'David Thompson',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4,
      feedback: 'Great selection of electronics and the deals are unbeatable. Fast shipping and everything arrived in perfect condition.',
      location: 'Chicago, IL'
    },
    {
      name: 'Lisa Wang',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'The organic skincare set I purchased is fantastic! My skin has never looked better. Thank you for such quality products.',
      location: 'Seattle, WA'
    },
    {
      name: 'James Wilson',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'Outstanding customer service and product quality. The smart home security bundle was easy to install and works perfectly.',
      location: 'Austin, TX'
    },
    {
      name: 'Amanda Foster',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4,
      feedback: 'Love the fashion selection! The designer watch I bought is beautiful and the price was much better than retail stores.',
      location: 'Denver, CO'
    },
    {
      name: 'Robert Kim',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'Excellent customer service and fast delivery. The product quality exceeded my expectations. Highly recommended!',
      location: 'San Francisco, CA'
    },
    {
      name: 'Jennifer Davis',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      feedback: 'Amazing deals and great selection. The customer support team was very helpful with my questions.',
      location: 'Boston, MA'
    }
  ]

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1) // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2) // Tablet: 2 items
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3) // Desktop: 3 items
      } else {
        setItemsPerView(4) // Large screens: 4 items
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalPages = Math.ceil(testimonials.length / itemsPerView)
  const maxIndex = testimonials.length - itemsPerView

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  const handleDotClick = (pageIndex: number) => {
    setCurrentIndex(pageIndex * itemsPerView)
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-primary-red mr-3" />
            <h2 className="text-3xl font-bold text-primary-text">
              What Our Customers Say
            </h2>
          </div>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Real feedback from satisfied customers who love our products and service
          </p>
        </div>
        
        {/* Testimonials Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <button 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-primary-red p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-primary-red p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${
              currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-full"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center h-full flex flex-col">
                    {/* Customer Image */}
                    <div className="flex justify-center mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
                      />
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < testimonial.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-text-muted ml-2">
                        {testimonial.rating}.0
                      </span>
                    </div>
                    
                    {/* Customer Feedback */}
                    <blockquote className="text-sm text-primary-text mb-4 leading-relaxed italic flex-grow">
                      "{testimonial.feedback}"
                    </blockquote>
                    
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-primary-text text-base mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-primary-red'
                    : 'bg-gray-300 hover:bg-primary-red'
                }`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
        
        {/* View All Reviews Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-primary-red font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg border-2 border-primary-red">
            Read All Reviews
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsCarousel
