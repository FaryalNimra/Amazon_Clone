'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestSignupPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { userRole, userProfile, signOut } = useAuth()
  const [authStatus, setAuthStatus] = useState<string>('Not signed in')
  const [localStorageData, setLocalStorageData] = useState<string | null>(null)

  // Monitor auth status changes
  useEffect(() => {
    if (userRole && userProfile) {
      setAuthStatus(`Signed in as ${userRole}: ${userProfile.email}`)
    } else {
      setAuthStatus('Not signed in')
    }
  }, [userRole, userProfile])

  // Safely access localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData(localStorage.getItem('userData'))
    }
  }, [])

  const testSignOut = async () => {
    setLoading(true)
    try {
      console.log('🧪 Test: Starting sign out test...')
      
      // Store initial state
      const initialUserData = localStorage.getItem('userData')
      console.log('🧪 Test: Initial user data:', initialUserData)
      
      // Perform sign out
      await signOut()
      
      // Wait a bit for state updates
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check final state
      const finalUserData = localStorage.getItem('userData')
      console.log('🧪 Test: Final user data:', finalUserData)
      
      // Update local state
      setLocalStorageData(finalUserData)
      
      setTestResult({
        status: 'SIGNOUT_TEST',
        success: !finalUserData && !userRole && !userProfile,
        data: {
          initialUserData: initialUserData ? 'Present' : 'None',
          finalUserData: finalUserData ? 'Present' : 'None',
          finalUserRole: userRole || 'None',
          finalUserProfile: userProfile ? 'Present' : 'None',
          message: !finalUserData && !userRole && !userProfile 
            ? 'Sign out successful - all user data cleared' 
            : 'Sign out failed - user data still present'
        }
      })
    } catch (error) {
      setTestResult({
        status: 'SIGNOUT_TEST',
        success: false,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
    } finally {
      setLoading(false)
    }
  }

  const testBuyerSignup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `testbuyer${Date.now()}@example.com`,
          password: 'TestPass123',
          name: 'Test Buyer',
          phone: '+1234567890',
          role: 'buyer',
          additionalData: {}
        }),
      })

      const result = await response.json()
      setTestResult({
        status: response.status,
        success: response.ok,
        data: result
      })
    } catch (error) {
      setTestResult({
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
    } finally {
      setLoading(false)
    }
  }

  const testSellerSignup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `testseller${Date.now()}@example.com`,
          password: 'TestPass123',
          name: 'Test Seller',
          phone: '+1234567890',
          role: 'seller',
          additionalData: {
            storeName: 'Test Store',
            gstNumber: '22AAAAA0000A1Z5',
            businessType: 'individual',
            businessAddress: '123 Test Street, Test City'
          }
        }),
      })

      const result = await response.json()
      setTestResult({
        status: response.status,
        success: response.ok,
        data: result
      })
    } catch (error) {
      setTestResult({
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvironment = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setTestResult({
      status: 'ENV_CHECK',
      success: !!(supabaseUrl && supabaseKey),
      data: {
        supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
        supabaseKey: supabaseKey ? '✅ Set' : '❌ Missing',
        message: supabaseUrl && supabaseKey 
          ? 'Environment variables are properly configured' 
          : 'Missing environment variables. Check .env.local file'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Signup Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={checkEnvironment}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Check Environment
          </button>
          
          <button
            onClick={testBuyerSignup}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Buyer Signup'}
          </button>
          
          <button
            onClick={testSellerSignup}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Seller Signup'}
          </button>
        </div>

        {/* Auth Status and Sign Out Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">Current Status: </span>
              <span className={`px-2 py-1 rounded text-sm ${
                userRole ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {authStatus}
              </span>
            </div>
            
            {userRole && (
              <button
                onClick={testSignOut}
                disabled={loading}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing Sign Out...' : 'Test Sign Out'}
              </button>
            )}
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  setLocalStorageData(localStorage.getItem('userData'))
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Refresh Local Storage Data
            </button>
            
            <div className="text-xs text-gray-500">
              💡 Use "Refresh Local Storage Data" to manually update the displayed localStorage values
            </div>
          </div>
        </div>

        {/* Navbar State Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Navbar State Test</h2>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">Local Storage User Data: </span>
              <span className="text-sm text-gray-600">
                {localStorageData ? 'Present' : 'None'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">AuthContext User Role: </span>
              <span className="text-sm text-gray-600">
                {userRole || 'None'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">AuthContext User Profile: </span>
              <span className="text-sm text-gray-600">
                {userProfile ? 'Present' : 'None'}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>After clicking "Test Sign Out", the navbar should:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hide the user profile dropdown</li>
                <li>Show the Sign In / Sign Up buttons</li>
                <li>Close any open mobile menu</li>
                <li>Update without requiring a page refresh</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-time State Monitoring */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Real-time State Monitoring</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Local Storage:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                localStorageData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {localStorageData ? '✅ Has Data' : '❌ Empty'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">AuthContext Role:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                userRole ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userRole ? `✅ ${userRole}` : '❌ None'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">AuthContext Profile:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                userProfile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userProfile ? '✅ Present' : '❌ None'}
              </span>
            </div>
            
            <div className="text-blue-600 text-xs mt-3">
              💡 This section updates in real-time. Watch the values change when you sign out!
            </div>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="space-y-4">
              <div>
                <span className="font-medium">Status: </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testResult.status}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Success: </span>
                <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                  {testResult.success ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Response Data:</span>
                <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Check if you have created a <code>.env.local</code> file in your project root</li>
            <li>Verify your Supabase URL and anon key are correct</li>
            <li>Restart your development server after adding environment variables</li>
            <li>Check the browser console and terminal for error messages</li>
            <li>Ensure your Supabase project has authentication enabled</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
