'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, X, ArrowRight } from 'lucide-react'
import { signUpSchema, type SignUpFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/contexts/ModalContext'
import Logo from './Logo'
import AuthHero from './AuthHero'

interface BuyerSignUpFormProps {
  onClose?: () => void
}

const BuyerSignUpForm: React.FC<BuyerSignUpFormProps> = ({ onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false)
  const [showAccountCreatedModal, setShowAccountCreatedModal] = useState(false)
  const { openSignInModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (formData: SignUpFormData) => {
    setIsLoading(true)
    setError('')
    try {
      const normalizedEmail = formData.email.toLowerCase().trim()

      console.log('🚀 Submitting buyer signup data:', formData)

      // Direct insert into buyers table without Supabase auth
      try {
        console.log('🔄 Storing buyer data directly in buyers table...')
        
        const { data, error: buyerError } = await supabase
          .from('buyers')
          .insert({
            name: formData.name,
            email: normalizedEmail,
            phone: formData.phone || '',
            role: 'buyer',
            password: formData.password // Note: In production, hash this password
          })
          .select()

        if (buyerError) {
          console.error('❌ Error storing buyer data:', buyerError)
          console.log('📝 Buyer table error details:', {
            message: buyerError.message,
            details: buyerError.details,
            hint: buyerError.hint,
            code: buyerError.code
          })
          
          if (buyerError.code === '23505') {
            setError('An account with this email already exists.')
          } else if (buyerError.message.includes('duplicate key')) {
            setError('An account with this email already exists.')
          } else {
            setError(buyerError.message || 'Failed to create account. Please try again.')
          }
          return
        }

        if (data && data.length > 0) {
          console.log('✅ Buyer data stored successfully in buyers table:', data[0])
          
          // Create a simple user session and store in localStorage
          const buyerData = data[0]
          console.log('🎉 Buyer account created successfully!')
          console.log('📝 Buyer data:', buyerData)
          
          // Store buyer data in localStorage for session management
          const userData = {
            id: buyerData.id,
            name: buyerData.name,
            email: buyerData.email,
            phone: buyerData.phone,
            role: 'buyer',
            created_at: buyerData.created_at,
            updated_at: buyerData.updated_at
          }
          
          console.log('💾 Storing BUYER data in localStorage:', userData)
          localStorage.setItem('userData', JSON.stringify(userData))
          
          // Verify the data was stored correctly
          const storedData = localStorage.getItem('userData')
          console.log('✅ Verification - Stored data in localStorage:', storedData)
          
          // Dispatch custom event to notify AuthContext of user data change
          if (typeof window !== 'undefined') {
            console.log('📡 Dispatching userDataChanged event for BUYER')
            window.dispatchEvent(new Event('userDataChanged'))
            
            // Also trigger a storage event to ensure it's detected
            setTimeout(() => {
              console.log('📡 Triggering storage event for BUYER')
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'userData',
                newValue: storedData,
                oldValue: null
              }))
            }, 50)
          }
          
          setSignUpSuccess(true)
          setShowAccountCreatedModal(true)
        } else {
          setError('Failed to create account. Please try again.')
        }
        
      } catch (buyerErr) {
        console.error('❌ Unexpected error storing buyer data:', buyerErr)
        setError('An unexpected error occurred. Please try again.')
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
    openSignInModal()
  }

  // Account Created Successfully Modal
  if (showAccountCreatedModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Account Created!
                </h2>
                
                <p className="text-gray-600 mb-8 text-lg">
                  Welcome to our platform! Your buyer account has been successfully created.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleSignInRedirect}
                    className="w-full bg-primary-red hover:bg-red-600 text-white px-6 py-4 rounded-xl hover:scale-105 transition-all duration-200 transform font-semibold text-lg flex items-center justify-center"
                  >
                    Sign In Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountCreatedModal(false)
                      if (onClose) onClose()
                      window.location.href = '/'
                    }}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Back to Home Page
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
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          )}
          
          <Logo />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-text mb-2">
              Create Buyer Account
            </h1>
            <p className="text-text-muted">Join us as a buyer to start shopping</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {signUpSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-700 text-sm">
                  <strong>Account created successfully!</strong> Please check your email to verify your account.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-primary-text">
                Full Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="auth-input focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-primary-text">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="auth-input focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-primary-text">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="auth-input focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Enter your phone number (optional)"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-primary-text">
                Password *
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input pr-12 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-primary-text transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-text">
                Confirm Password *
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="auth-input focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || signUpSuccess}
                className="auth-button w-full py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
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
                  'Create Buyer Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Already have an account?</p>
              <button
                onClick={handleSignInRedirect}
                className="w-full bg-primary-red hover:bg-red-600 text-white py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 transform font-medium"
              >
                Sign in instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerSignUpForm
