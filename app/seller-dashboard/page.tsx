'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  User,
  BarChart3,
  Calendar,
  Mail,
  Home
} from 'lucide-react'

interface SellerData {
  id: string
  name: string
  email: string
  store_name: string
  business_type: string
  created_at: string
  total_products: number
}

const SellerDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const { openSellerSignInModal } = useModal()
  const router = useRouter()
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!user) {
        openSellerSignInModal()
        return
      }

      // Check if user is verified
      if (!user.email_confirmed_at) {
        router.push('/email-verification')
        return
      }

      // Check if user is a seller
      const userRole = user.user_metadata?.role || user.user_metadata?.user_type
      
      if (userRole !== 'seller') {
        // User is not a seller, redirect to home
        router.push('/')
        return
      }

      // Get seller data from user metadata
      const sellerInfo = user.user_metadata?.seller_info
      if (sellerInfo) {
        setSellerData({
          id: user.id,
          name: sellerInfo.name,
          email: sellerInfo.email,
          store_name: sellerInfo.store_name,
          business_type: sellerInfo.business_type,
          created_at: sellerInfo.created_at,
          total_products: 0 // This would come from database in real app
        })
      } else {
        // Fallback to basic user data
        setSellerData({
          id: user.id,
          name: user.user_metadata?.name || 'Seller',
          email: user.email || '',
          store_name: 'My Store',
          business_type: 'individual',
          created_at: user.created_at,
          total_products: 0
        })
      }
      
      setLoading(false)
    }

    checkUserAndRedirect()
  }, [user, router, openSellerSignInModal])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleSwitchToBuyer = () => {
    router.push('/')
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  if (!sellerData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg fixed left-0 top-0 h-full z-50">
        <div className="p-6">
          {/* Logo/Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-primary-red rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Seller Hub</span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <button
              onClick={handleSwitchToBuyer}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Buyer</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-gray-600">Welcome back, {sellerData.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Store</p>
                <p className="font-semibold text-gray-900">{sellerData.store_name}</p>
              </div>
              <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Seller Information Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{sellerData.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{sellerData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Store Name</p>
                        <p className="font-medium text-gray-900">{sellerData.store_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Join Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(sellerData.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="font-medium text-gray-900">{sellerData.total_products}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Business Type</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {sellerData.business_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{sellerData.total_products}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">$0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Store className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Store Rating</p>
                      <p className="text-2xl font-bold text-gray-900">0.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start by adding your first product</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Products management coming soon</p>
                <p className="text-sm">You'll be able to add, edit, and manage your products here</p>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Orders management coming soon</p>
                <p className="text-sm">You'll be able to view and manage your orders here</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500 py-8">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Settings coming soon</p>
                <p className="text-sm">You'll be able to manage your account settings here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SellerDashboardPage() {
  return <SellerDashboard />
}


