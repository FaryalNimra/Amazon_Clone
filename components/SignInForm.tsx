'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, X, ArrowRight } from 'lucide-react'
import { signInSchema, type SignInFormData } from '@/lib/validation'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { supabase } from '@/lib/supabase'
import Logo from './Logo'
import AuthHero from './AuthHero'
import ForgotPasswordModal from './ForgotPasswordModal'

interface SignInFormProps {
  onClose?: () => void
  showCloseButton?: boolean
  isSellerForm?: boolean
}

const SignInForm: React.FC<SignInFormProps> = ({ onClose, showCloseButton = true, isSellerForm = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signInSuccess, setSignInSuccess] = useState(false)
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null)
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showUnverifiedEmailModal, setShowUnverifiedEmailModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const { signIn, buyerSignIn } = useAuth()
  const { closeSellerSignInModal, closeSellerSignUpModal, openSignUpModal, openSellerSignUpModal, closeSignInModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Attempting sign in for:', data.email)
      const result = await buyerSignIn(data.email, data.password)

      if (result.error) {
        console.error('❌ SignInForm: Sign in failed:', result.error)
        setError(result.error)
        return
      }

      // ✅ Sign in successful
      console.log('✅ SignInForm: Sign in successful!')
      setSignInSuccess(true)

      // Get role from localStorage
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUserRole(parsedUser.role)
          console.log('👤 SignInForm: User role detected:', parsedUser.role)
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }

      // 🔥 Close modal after successful login
      if (isSellerForm) {
        closeSellerSignInModal()
      } else {
        closeSignInModal()
      }

      console.log('🎉 Modal closed after successful sign in!')
      return
    } catch (err) {
      console.error('❌ Unexpected sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!userEmail) return

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })

      if (error) {
        setError('Failed to resend verification email. Please try again.')
      } else {
        setError('')
        alert('Verification email resent successfully!')
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.')
    }
  }

  const handleCloseUnverifiedModal = () => {
    setShowUnverifiedEmailModal(false)
    setUserEmail('')
    setError('')
  }

  // Unverified Email Modal
  if (showUnverifiedEmailModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Please Verify Your Email
                </h2>

                <p className="text-gray-600 mb-6">
                  Your email <strong>{userEmail}</strong> is not verified. Please check your inbox and verify your email before signing in.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-primary-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Resend Verification Email
                  </button>

                  <button
                    onClick={handleCloseUnverifiedModal}
                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleBackToSignIn = () => {
    setEmailVerificationRequired(false)
    setUserEmail('')
    setError('')
  }

  const handleCreateAccount = () => {
    if (isSellerForm) {
      closeSellerSignInModal()
      openSellerSignUpModal()
    } else {
      closeSignInModal()
      openSignUpModal()
    }
  }

  return (
    <div className="auth-container">
      <AuthHero />
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="auth-card py-8 px-6 relative">
          {/* Close Button */}
          {onClose && showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
          <Logo />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-text mb-2">
              Welcome Back
            </h1>
            <p className="text-text-muted">
              Sign in to access your secure account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {signInSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-green-700 text-sm font-medium">
                    <strong>Sign in successful!</strong> {userRole === 'buyer' ? 'Redirecting to home page...' : userRole === 'seller' ? 'Redirecting to seller dashboard...' : 'Redirecting...'}
                  </span>
                </div>

                {/* Manual Redirect Button */}
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (userRole === 'seller') {
                        window.location.href = '/seller-dashboard'
                      } else if (userRole === 'buyer') {
                        window.location.href = '/'
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {userRole === 'seller' ? 'Go to Seller Dashboard' : userRole === 'buyer' ? 'Go to Home Page' : 'Continue'}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="auth-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-primary-text transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-border-light rounded bg-light-gray"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-text">
                  Keep me signed in
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-primary-red hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || signInSuccess}
              className="auth-button w-full py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : signInSuccess ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {userRole === 'buyer' ? 'Redirecting to home page...' : userRole === 'seller' ? 'Redirecting to seller dashboard...' : 'Redirecting...'}
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-muted">New to SecureAuth?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleCreateAccount}
                className="auth-secondary-button block text-center w-full"
              >
                Create your account
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-text-muted">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary-red hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-red hover:underline">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}

export default SignInForm
