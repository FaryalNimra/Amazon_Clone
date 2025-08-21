'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary-red hover:text-red-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-lg text-gray-600">
            Learn more about our company and mission
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Welcome to our e-commerce platform! We are passionate about providing high-quality products 
              and exceptional customer service to our valued customers.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Our mission is to make online shopping simple, secure, and enjoyable. We strive to offer 
              a wide selection of products at competitive prices while maintaining the highest standards 
              of customer satisfaction.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us?</h2>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✓ Wide selection of quality products</li>
              <li>✓ Secure and fast checkout</li>
              <li>✓ Excellent customer support</li>
              <li>✓ Competitive pricing</li>
              <li>✓ Fast and reliable shipping</li>
            </ul>
            
            <div className="text-center mt-8">
              <Link
                href="/"
                className="inline-flex items-center bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



