'use client'

import React from 'react'
import { RefreshCw, Clock, BarChart3, Settings } from 'lucide-react'

export default function Dashboard() {
  return (
    <div 
      className="min-h-screen bg-gray-50 py-8 dashboard-container"
      style={{ 
        overflow: 'hidden', 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your application dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Welcome</h3>
              <p className="text-gray-600">
                This is your main dashboard. You can add your content here.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  View Products
                </button>
                <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About Dashboard</h3>
          <div className="prose text-gray-600 max-w-none">
            <p className="mb-4">
              This dashboard provides you with an overview of your application and quick access to important features.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              You can customize this dashboard by adding your own components and functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
