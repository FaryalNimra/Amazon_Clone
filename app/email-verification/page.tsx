'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, ArrowRight, Mail, X } from 'lucide-react'
import { useModal } from '@/contexts/ModalContext'

const EmailVerificationPage: React.FC = () => {
  const router = useRouter()
  const { openSignInModal } = useModal()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        setIsLoading(true)
        
        // Get the current authenticated user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.error('Error getting user:', error)
          router.push('/signin')
          return
        }

        setUserEmail(user.email || '')

        // Check if email is verified by looking at last_sign_in_at
        if (user.last_sign_in_at) {
          // Email is verified - user has signed in before
          setIsEmailVerified(true)
          setShowSuccessPopup(true)
        } else {
          // Email is not verified yet
          setIsEmailVerified(false)
        }
      } catch (err) {
        console.error('Error checking email verification:', err)
        router.push('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    // Initial check
    checkEmailVerification()

    // Set up periodic check every 5 seconds to detect verification from other devices
    const intervalId = setInterval(checkEmailVerification, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [router])

  const handleResendVerification = async () => {
    if (!userEmail) return
    
    try {
      setIsResending(true)
      setResendMessage('')
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })

      if (error) {
        setResendMessage('Failed to resend verification email. Please try again.')
      } else {
        setResendMessage('Verification email sent successfully!')
      }
    } catch (err) {
      setResendMessage('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleSignIn = () => {
    setShowSuccessPopup(false)
    openSignInModal()
  }

  const handleBackToHome = () => {
    if (isEmailVerified) {
      router.push('/')
    }
    // If not verified, button is disabled
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking email verification...</p>
        </div>
      </div>
    )
  }

  // Show success popup if email is verified
  if (showSuccessPopup && isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">Your email is verified. Please sign in.</p>
            <button 
              onClick={handleSignIn}
              className="inline-flex items-center bg-primary-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show verification modal if email is not verified
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto w-full">
        {/* Verification Modal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Please verify your email to continue
            </h1>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{userEmail}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>

            {resendMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                resendMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {resendMessage}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-primary-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </div>
                )}
              </button>

              <button
                onClick={handleBackToHome}
                disabled={!isEmailVerified}
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  isEmailVerified
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>You cannot proceed until your email is verified.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationPage
