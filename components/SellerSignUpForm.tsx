'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, X, ArrowRight } from 'lucide-react'
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
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<SellerSignUpFormData>({
    resolver: zodResolver(sellerSignUpSchema),
    mode: 'onChange',
  })

  // Watch form fields for real-time validation
  const watchedFields = watch()
  const isFormValid = isValid && isDirty

  // Watch GST number for real-time validation
  const gstNumber = watch('gstNumber')
  const phoneNumber = watch('phone')



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

      console.log('🚀 Submitting seller signup data:', data)

      // Direct insert into sellers table without Supabase auth
      try {
        console.log('🔄 Storing seller data directly in sellers table...')
        
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .insert({
            name: data.name,
            email: normalizedEmail,
            phone: data.phone,
            password: data.password, // Note: In production, hash this password
            store_name: data.storeName,
            gst_number: data.gstNumber,
            business_type: data.businessType,
            business_address: data.businessAddress,
            role: 'seller'
          })
          .select()

        if (sellerError) {
          console.error('❌ Error storing seller data:', sellerError)
          console.log('📝 Seller table error details:', {
            message: sellerError.message,
            details: sellerError.details,
            hint: sellerError.hint,
            code: sellerError.code
          })
          
          if (sellerError.code === '23505') {
            setError('An account with this email already exists.')
          } else if (sellerError.message.includes('duplicate key')) {
            setError('An account with this email already exists.')
          } else {
            setError(sellerError.message || 'Failed to create account. Please try again.')
          }
          return
        }

        if (sellerData && sellerData.length > 0) {
          console.log('✅ Seller data stored successfully in sellers table:', sellerData[0])
          
          // Create a simple user session and store in localStorage
          const seller = sellerData[0]
          console.log('🎉 Seller account created successfully!')
          console.log('📝 Seller data:', seller)
          
          // Store seller data in localStorage for session management
          const userData = {
            id: seller.id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            role: 'seller',
            storeName: seller.store_name,
            gstNumber: seller.gst_number,
            businessType: seller.business_type,
            businessAddress: seller.business_address,
            created_at: seller.created_at,
            updated_at: seller.updated_at
          }
          
          console.log('💾 Storing SELLER data in localStorage:', userData)
          localStorage.setItem('userData', JSON.stringify(userData))
          
          // Verify the data was stored correctly
          const storedData = localStorage.getItem('userData')
          console.log('✅ Verification - Stored data in localStorage:', storedData)
          
          // Dispatch custom event to notify AuthContext of user data change
          if (typeof window !== 'undefined') {
            console.log('📡 Dispatching userDataChanged event for SELLER')
            window.dispatchEvent(new Event('userDataChanged'))
            
            // Also trigger a storage event to ensure it's detected
            setTimeout(() => {
              console.log('📡 Triggering storage event for SELLER')
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
        
      } catch (sellerErr) {
        console.error('❌ Unexpected error storing seller data:', sellerErr)
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
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Seller Account Created!
                </h2>
                
                <p className="text-gray-600 mb-8 text-lg">
                  Welcome to our platform! Your seller account has been successfully created. You can now start selling your products.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleSignInRedirect}
                    className="w-full bg-primary-red hover:bg-red-600 text-white px-6 py-4 rounded-xl hover:scale-105 transition-all duration-200 transform font-semibold text-lg flex items-center justify-center"
                  >
                    Sign In Now
                    <ArrowRight className="w-5 h-5 ml-2" />
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
                      {!watchedFields.storeName || watchedFields.storeName.length < 2 && (
                        <li>• Store Name (at least 2 characters)</li>
                      )}
                      {!watchedFields.gstNumber || watchedFields.gstNumber.length !== 15 && (
                        <li>• GST Number (exactly 15 characters)</li>
                      )}
                      {!watchedFields.businessType && (
                        <li>• Business Type (must be selected)</li>
                      )}
                      {!watchedFields.businessAddress || watchedFields.businessAddress.length < 10 && (
                        <li>• Business Address (at least 10 characters)</li>
                      )}
                      {!watchedFields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFields.email) && (
                        <li>• Valid email address</li>
                      )}
                      {!watchedFields.phone || !/^(\+92|0)?[3-9]\d{9}$/.test(watchedFields.phone.replace(/\D/g, '')) && (
                        <li>• Valid Pakistani phone number</li>
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
              <label htmlFor="storeName" className="block text-sm font-semibold text-primary-text">
                Store Name *
              </label>
              <div className="relative">
                <input
                  {...register('storeName')}
                  type="text"
                  id="storeName"
                  className={`auth-input transition-all duration-200 ${
                    errors.storeName 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.storeName && watchedFields.storeName.length >= 2
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your store name"
                />
                {watchedFields.storeName && watchedFields.storeName.length >= 2 && !errors.storeName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.storeName && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.storeName.message}
                </p>
              )}

            </div>

            <div className="space-y-2">
              <label htmlFor="gstNumber" className="block text-sm font-semibold text-primary-text">
                GST Number
              </label>
              <div className="relative">
                <input
                  {...register('gstNumber')}
                  type="text"
                  id="gstNumber"
                  maxLength={15}
                  className={`auth-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-16 ${
                    errors.gstNumber ? 'gst-input-invalid' : 
                    (gstNumber?.length === 15 ? 'gst-input-valid' : '')
                  }`}
                  placeholder="Enter your 15-character GST number"
                  onChange={(e) => {
                    // Only allow numbers and uppercase letters
                    const value = e.target.value.replace(/[^0-9A-Z]/gi, '').toUpperCase()
                    e.target.value = value
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <span className={`text-xs font-medium gst-counter ${
                    (gstNumber?.length || 0) === 15 
                      ? 'valid' 
                      : (gstNumber?.length || 0) > 0
                      ? 'invalid'
                      : 'neutral'
                  }`}>
                    {gstNumber?.length || 0}/15
                  </span>
                  {(gstNumber?.length || 0) === 15 && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              {errors.gstNumber && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.gstNumber.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                GST number must be exactly 15 characters (e.g., 22AAAAA0000A1Z5)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="businessType" className="block text-sm font-semibold text-primary-text">
                Business Type
              </label>
                                <select
                    {...register('businessType')}
                    id="businessType"
                    className="auth-input focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                <p className="text-red-600 text-sm">{errors.businessType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="businessAddress" className="block text-sm font-semibold text-primary-text">
                Business Address *
              </label>
              <div className="relative">
                <textarea
                  {...register('businessAddress')}
                  id="businessAddress"
                  className={`auth-input transition-all duration-200 resize-none ${
                    errors.businessAddress 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : watchedFields.businessAddress && watchedFields.businessAddress.length >= 10
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  }`}
                  rows={3}
                  placeholder="Enter your complete business address"
                />
                {watchedFields.businessAddress && watchedFields.businessAddress.length >= 10 && !errors.businessAddress && (
                  <div className="absolute right-3 top-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.businessAddress && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.businessAddress.message}
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
                  className={`auth-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-16 ${
                    errors.phone ? 'phone-input-invalid' : 
                    (phoneNumber && (phoneNumber.replace(/\D/g, '').length === 11 || phoneNumber.replace(/\D/g, '').length === 10) ? 'phone-input-valid' : '')
                  }`}
                  placeholder="Enter your phone number"

                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <span className={`text-xs font-medium phone-counter ${
                    phoneNumber && (phoneNumber.replace(/\D/g, '').length === 11 || phoneNumber.replace(/\D/g, '').length === 10) 
                      ? 'valid' 
                      : phoneNumber && phoneNumber.replace(/\D/g, '').length > 0
                      ? 'invalid'
                      : 'neutral'
                  }`}>
                    {phoneNumber ? phoneNumber.replace(/\D/g, '').length : 0}/11
                  </span>
                  {phoneNumber && (phoneNumber.replace(/\D/g, '').length === 11 || phoneNumber.replace(/\D/g, '').length === 10) && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
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
                Enter a valid Pakistani phone number (e.g., 03001234567 or +92 300 1234567)
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
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Already have an account?</p>
              <button
                onClick={openSignInModal}
                className="text-primary-red hover:text-red-600 font-semibold hover:underline transition-colors"
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
