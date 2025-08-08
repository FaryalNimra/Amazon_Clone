'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, X } from 'lucide-react'
import { sellerSignUpSchema, type SellerSignUpFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/contexts/ModalContext'
import Logo from './Logo'
import AuthHero from './AuthHero'
import Link from 'next/link'

interface SellerSignUpFormProps {
  onClose?: () => void
  showCloseButton?: boolean
}

const SellerSignUpForm: React.FC<SellerSignUpFormProps> = ({ onClose, showCloseButton = true }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false)
  const [showAccountCreatedModal, setShowAccountCreatedModal] = useState(false)
  const { openSignInModal, closeSellerSignUpModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerSignUpFormData>({
    resolver: zodResolver(sellerSignUpSchema),
  })

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Normalize email to lowercase for case-insensitive comparison
      const normalizedEmail = email.toLowerCase().trim()
      
      console.log('Checking if email exists:', normalizedEmail)
      
      // Use Supabase Auth's signInWithPassword method to check if user exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: 'dummy-password-for-check'
      })

      console.log('SignIn attempt result:', { data, error })

      // If there's an error, it likely means the user exists but password is wrong
      if (error) {
        console.log('User exists (error detected) - returning true')
        return true
      }

      // If no error, user doesn't exist
      console.log('User does not exist (no error) - returning false')
      return false
    } catch (err) {
      console.error('Error in checkEmailExists:', err)
      return false // Safe fallback - assume email doesn't exist
    }
  }

  const onSubmit = async (data: SellerSignUpFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const normalizedEmail = data.email.toLowerCase().trim()

      // Directly try to sign up, Supabase will return error if email exists
      const { data: authData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            role: 'seller',
            user_type: 'seller',
            seller_info: {
              name: data.name,
              email: normalizedEmail,
              phone: data.phone,
              store_name: data.storeName,
              gst_number: data.gstNumber,
              business_type: data.businessType,
              business_address: data.businessAddress,
              created_at: new Date().toISOString()
            }
          },
        },
      })

      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('User already registered')
        ) {
          // Account already exists
          setShowAccountExistsModal(true)
        } else {
          setError(error.message || 'An error occurred during registration.')
        }
        return
      }

      if (authData.user) {
        // Account created successfully
        setShowAccountCreatedModal(true)
      }
    } catch (err) {
      console.error('Unexpected signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInRedirect = () => {
    setShowAccountExistsModal(false)
    setShowAccountCreatedModal(false)
    if (onClose) onClose()
    closeSellerSignUpModal()
    openSignInModal()
  }

  // Account Already Exists Modal
  if (showAccountExistsModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Account Already Exists
                </h2>
                
                <p className="text-gray-600 mb-6">
                  An account with this email already exists. Please sign in.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleSignInRedirect}
                    className="w-full bg-primary-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => setShowAccountExistsModal(false)}
                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Try Different Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Account Created Successfully Modal
  if (showAccountCreatedModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Account Created!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Please verify your email before signing in.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleSignInRedirect}
                    className="w-full bg-primary-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountCreatedModal(false)
                      if (onClose) onClose()
                    }}
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
              Create Seller Account
            </h1>
            <p className="text-text-muted">
              Join us as a seller to start selling your products
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {signUpSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-700 text-sm">
                  <strong>Account created successfully!</strong> Please check your email to verify your account.
                </span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-text mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="auth-input"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-2">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-primary-text mb-2">
                Store Name
              </label>
              <input
                {...register('storeName')}
                type="text"
                id="storeName"
                className="auth-input"
                placeholder="Enter your store name"
              />
              {errors.storeName && (
                <p className="text-red-600 text-sm mt-2">{errors.storeName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="gstNumber" className="block text-sm font-medium text-primary-text mb-2">
                GST Number
              </label>
              <input
                {...register('gstNumber')}
                type="text"
                id="gstNumber"
                className="auth-input"
                placeholder="Enter your 15-digit GST number"
              />
              {errors.gstNumber && (
                <p className="text-red-600 text-sm mt-2">{errors.gstNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-primary-text mb-2">
                Business Type
              </label>
              <select
                {...register('businessType')}
                id="businessType"
                className="auth-input"
              >
                <option value="">Select business type</option>
                <option value="individual">Individual</option>
                <option value="partnership">Partnership</option>
                <option value="private-limited">Private Limited</option>
                <option value="public-limited">Public Limited</option>
                <option value="llp">LLP</option>
                <option value="proprietorship">Proprietorship</option>
              </select>
              {errors.businessType && (
                <p className="text-red-600 text-sm mt-2">{errors.businessType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-primary-text mb-2">
                Business Address
              </label>
              <textarea
                {...register('businessAddress')}
                id="businessAddress"
                className="auth-input"
                rows={3}
                placeholder="Enter your complete business address"
              />
              {errors.businessAddress && (
                <p className="text-red-600 text-sm mt-2">{errors.businessAddress.message}</p>
              )}
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-primary-text mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="auth-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-2">{errors.phone.message}</p>
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
                  placeholder="Create a strong password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-text mb-2">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="auth-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || signUpSuccess}
              className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : signUpSuccess ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Account created! Redirecting...
                </div>
              ) : (
                'Create Seller Account'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-muted">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={openSignInModal}
                className="auth-secondary-button block text-center"
              >
                Sign in instead
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-text-muted">
            By creating an account, you agree to our{' '}
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
    </div>
  )
}

export default SellerSignUpForm
