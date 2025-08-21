'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, X, ArrowRight } from 'lucide-react'
import { signUpSchema, type SignUpFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useModal } from '@/contexts/ModalContext'
import Logo from './Logo'
import AuthHero from './AuthHero'

interface BuyerSignUpFormProps {
  onClose?: () => void
  showOwnModal?: boolean // Control whether to show own modal or not
  onSignUpSuccess?: () => void // Callback when sign-up is successful
}

const BuyerSignUpForm: React.FC<BuyerSignUpFormProps> = ({ onClose, showOwnModal = true, onSignUpSuccess }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false)
  const [showAccountCreatedModal, setShowAccountCreatedModal] = useState(false)
  const router = useRouter()
  const { openSignInModal } = useModal()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  // Watch form fields for real-time validation
  const watchedFields = watch()
  const isFormValid = isValid && isDirty

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
          
          console.log('🎉 Buyer account created successfully!')
          console.log('📝 Buyer data:', data[0])
          
          // IMPORTANT: Do NOT store user data in localStorage or set authentication state
          // The user must sign in separately to establish a session
          console.log('ℹ️ Account created but user NOT authenticated - must sign in separately')
          
          setSignUpSuccess(true)
          setShowAccountCreatedModal(true)
          
          // Call the success callback if provided
          if (onSignUpSuccess) {
            onSignUpSuccess()
          }
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

  // Account Created Successfully Modal
  if (showAccountCreatedModal && showOwnModal) {
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
                  ✅ Account created successfully! Please sign in to continue.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowAccountCreatedModal(false)
                      if (onClose) onClose()
                      // Open the sign-in modal instead of redirecting
                      openSignInModal()
                    }}
                    className="w-full bg-primary-red hover:bg-red-600 text-white px-6 py-4 rounded-xl hover:scale-105 transition-all duration-200 transform font-semibold text-lg flex items-center justify-center"
                  >
                    Sign In Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountCreatedModal(false)
                      if (onClose) onClose()
                      router.push('/')
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
            {/* Form Validation Summary */}
            {!isFormValid && isDirty && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-yellow-800 text-sm">
                    <p className="font-medium mb-2">Please complete the following fields:</p>
                    <ul className="space-y-1 text-xs">
                      {!watchedFields.name || watchedFields.name.length < 2 && (
                        <li>• Full Name (at least 2 characters)</li>
                      )}
                      {!watchedFields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFields.email) && (
                        <li>• Valid email address</li>
                      )}
                      {!watchedFields.password || watchedFields.password.length < 8 && (
                        <li>• Password (at least 8 characters with uppercase, lowercase, and number)</li>
                      )}
                      {!watchedFields.confirmPassword || watchedFields.password !== watchedFields.confirmPassword && (
                        <li>• Confirm password (must match)</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}



            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-primary-text">
                Full Name *
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`auth-input transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.name && watchedFields.name.length >= 2
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {watchedFields.name && watchedFields.name.length >= 2 && !errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name.message}
                </p>
              )}

            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-primary-text">
                Email *
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`auth-input transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFields.email)
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your email"
                />
                {watchedFields.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFields.email) && !errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}

            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-primary-text">
                Phone Number
              </label>
              <div className="relative">
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  maxLength={15}
                  className={`auth-input transition-all duration-200 pr-16 ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.phone && watchedFields.phone.length > 0 && /^(\+92|0)?[3-9]\d{9}$/.test(watchedFields.phone.replace(/\D/g, ''))
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your phone number (optional)"
                  onChange={(e) => {
                    // Only allow digits, spaces, +, and -
                    const value = e.target.value.replace(/[^0-9+\-\s]/g, '')
                    e.target.value = value
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {watchedFields.phone && watchedFields.phone.length > 0 && (
                    <span className={`text-xs font-medium ${
                      /^(\+92|0)?[3-9]\d{9}$/.test(watchedFields.phone.replace(/\D/g, ''))
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {watchedFields.phone.replace(/\D/g, '').length} digits
                    </span>
                  )}
                  {watchedFields.phone && /^(\+92|0)?[3-9]\d{9}$/.test(watchedFields.phone.replace(/\D/g, '')) && !errors.phone && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Format: 03001234567, +92 300 1234567, or 3001234567
              </p>
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
                  className={`auth-input pr-12 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.password && watchedFields.password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(watchedFields.password)
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
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
              
              {/* Password Strength Indicator */}
              {watchedFields.password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[
                      { test: watchedFields.password.length >= 8, label: '8+ chars' },
                      { test: /[a-z]/.test(watchedFields.password), label: 'lowercase' },
                      { test: /[A-Z]/.test(watchedFields.password), label: 'uppercase' },
                      { test: /\d/.test(watchedFields.password), label: 'number' }
                    ].map((requirement, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          requirement.test
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {requirement.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-text">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className={`auth-input transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Confirm your password"
                />
                {watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}

            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || signUpSuccess || !isFormValid}
                className="auth-button w-full py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
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
                onClick={() => {
                  if (onClose) onClose()
                  router.push('/')
                }}
                className="text-primary-red hover:text-red-600 font-semibold hover:underline transition-colors"
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
