'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'

export default function TestAuthPage() {
  const { user, userRole, userProfile, signOut } = useAuth()
  const { openSignInModal, openSignUpModal } = useModal()

  const handleSignOut = async () => {
    console.log('🧪 TestAuthPage: Starting sign out test...')
    await signOut()
    console.log('🧪 TestAuthPage: Sign out completed')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Authentication Test Page</h1>
          
          <div className="space-y-6">
            {/* Current Auth State */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Current Authentication State</h2>
              <div className="space-y-2 text-sm">
                <div><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</div>
                <div><strong>User Role:</strong> {userRole || 'None'}</div>
                <div><strong>User Profile:</strong> {userProfile ? 'Available' : 'None'}</div>
                {userProfile && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div><strong>ID:</strong> {userProfile.id}</div>
                    <div><strong>Name:</strong> {userProfile.name}</div>
                    <div><strong>Email:</strong> {userProfile.email}</div>
                    <div><strong>Role:</strong> {userProfile.role || userRole}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {!userProfile ? (
                  <>
                    <button
                      onClick={openSignInModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={openSignUpModal}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                    <div className="text-sm text-gray-600">
                      After signing out, you should see the default navigation bar
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">Test Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                <li>If not signed in, use the Sign In button to authenticate as a buyer</li>
                <li>After signing in, you should see your profile information above</li>
                <li>Click the Sign Out button to test the sign out flow</li>
                <li>After signing out, you should see the default navigation bar (Sign In/Sign Up buttons)</li>
                <li>Check the browser console for detailed logs of the authentication flow</li>
              </ol>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Debug Information</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Check browser console for authentication logs</div>
                <div>Check localStorage for userData</div>
                <div>Verify navbar shows correct navigation state</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
