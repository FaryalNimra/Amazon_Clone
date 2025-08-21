'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail,
  ArrowRight,
  Truck,
  Package,
  Headphones,
  Home,
  ShoppingBag,
  User,
  Phone,
  HelpCircle
} from 'lucide-react'

// Custom X (Twitter) icon component
const XIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-5 h-5 fill-current"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    if (email.trim()) {
      try {
        // Here you would typically send the email to your backend
        console.log('Newsletter subscription:', email)
        setIsSubscribed(true)
        setEmail('')
        // Reset subscription status after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000)
      } catch (error) {
        console.error('Newsletter subscription error:', error)
      }
    }
  }

  // Safe navigation function to prevent authentication issues
  const handleSafeNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Use window.location for safe navigation
      window.location.href = href
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to Next.js Link
      window.location.href = href
    }
  }

  return (
    <footer className="bg-gray-900 text-white" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-red">Useful Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/electronics" 
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Cart
                </Link>
              </li>
              <li>
                <Link 
                  href="/#featured-categories" 
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <User className="w-4 h-4 mr-2" />
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-red">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping & Returns
                  <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <Package className="w-4 h-4 mr-2" />
                  Track Order
                  <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <Headphones className="w-4 h-4 mr-2" />
                  Support Center
                  <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-primary-red">Newsletter Subscription</h3>
            <p className="text-gray-300 mb-4">
              Get the latest updates, deals, and offers directly in your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent text-white placeholder-gray-400"
                    required
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
              {isSubscribed && (
                <p className="text-green-400 text-sm">
                  ✓ Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                onClick={(e) => e.stopPropagation()}
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                onClick={(e) => e.stopPropagation()}
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                onClick={(e) => e.stopPropagation()}
                aria-label="Follow us on X (formerly Twitter)"
              >
                <XIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                onClick={(e) => e.stopPropagation()}
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 YourWebsiteName. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer








