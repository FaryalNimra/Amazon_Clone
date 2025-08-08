'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
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

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', email)
      setIsSubscribed(true)
      setEmail('')
      // Reset subscription status after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-red">Useful Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/category/electronics" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-red">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shipping-returns" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <Package className="w-4 h-4 mr-2" />
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <Headphones className="w-4 h-4 mr-2" />
                  Support Center
                </Link>
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
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
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
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-red rounded-full flex items-center justify-center transition-colors"
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




