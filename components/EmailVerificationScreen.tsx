'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { useRouter } from 'next/navigation'
import Logo from './Logo'
import AuthHero from './AuthHero'
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react'

interface EmailVerificationScreenProps {
  email: string
  onVerificationComplete: () => void
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  email, 
  onVerificationComplete 
}) => {
  const [isChecking, setIsChecking] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const { openSignInModal } = useModal()
  const router = useRouter()

  const checkEmailVerification = async () => {
    setIsChecking(true)
    setError('')

    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError('Error checking verification status')
        return
      }

      if (currentUser?.email_confirmed_at) {
        setIsVerified(true)
        // Don't auto-redirect, let user choose to sign in
      }
    } catch (err) {
      setError('Failed to check verification status')
    } finally {
      setIsChecking(false)
    }
  }

  const handleSignInClick = () => {
    openSignInModal()
  }

  const handleContinueToHome = () => {
    onVerificationComplete()
  }

  useEffect(() => {
    // Check verification status every 3 seconds
    const interval = setInterval(checkEmailVerification, 3000)
    
    // Also check immediately
    checkEmailVerification()

    return () => clearInterval(interval)
  }, [])

  // Show success screen when verified
  if (isVerified) {
    return (
      <div className="auth-container">
        <AuthHero />
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="auth-card py-8 px-6">
            <Logo />
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-primary-text mb-4">
                Email Verified!
              </h2>
              
              <p className="text-text-muted mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleSignInClick}
                  className="auth-button w-full"
                >
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Sign In to Continue
                  </div>
                </button>

                <button
                  onClick={handleContinueToHome}
                  className="auth-secondary-button w-full"
                >
                  Continue to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <AuthHero />
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="auth-card py-8 px-6">
          <Logo />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-primary-text mb-4">
              Verify your email
            </h2>
            
            <p className="text-text-muted mb-6">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={checkEmailVerification}
                disabled={isChecking}
                className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Checking...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Check verification status
                  </div>
                )}
              </button>

              <div className="text-sm text-text-muted">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={handleSignInClick}
                  className="text-primary-red hover:underline"
                >
                  try signing in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationScreen
