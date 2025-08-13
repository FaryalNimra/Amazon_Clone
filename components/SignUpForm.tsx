'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, Shield, Lock, Key, X } from 'lucide-react'
import { signUpSchema, type SignUpFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/contexts/ModalContext'
import Logo from './Logo'
import AuthHero from './AuthHero'

interface SignUpFormProps {
  onClose?: () => void
  showCloseButton?: boolean
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onClose, showCloseButton = true }) => {
  const { openSignInModal, closeSignUpModal } = useModal()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const password = watch('password')

  const handleSignIn = () => {
    closeSignUpModal()
    openSignInModal()
  }

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Close modal after a delay to show success message
        setTimeout(() => {
          if (onClose) {
            onClose()
          }
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <AuthHero />
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="auth-card py-8 px-6 relative">
            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
            <Logo />
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-text mb-4">
                Check your email
              </h2>
              <p className="text-text-muted mb-6">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="auth-button"
              >
                Back to Sign Up
              </button>
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
              Create Account
            </h1>
            <p className="text-text-muted">
              Join us and secure your digital identity
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-text mb-2">
                Your name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="auth-input"
                placeholder="First and last name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-2">{errors.name.message}</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input pr-12"
                  placeholder="At least 8 characters"
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
                Re-enter password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="auth-input pr-12"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-primary-text transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary-text mb-2">
                Mobile phone number (optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="auth-input"
                placeholder="Mobile phone number"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-2">{errors.phone.message}</p>
              )}
            </div>

            <div className="text-xs text-text-muted mb-6">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose || (() => window.history.back())}
                className="auth-secondary-button flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="auth-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create your account'
                )}
              </button>
            </div>
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
                onClick={handleSignIn}
                className="auth-secondary-button block text-center w-full"
              >
                Sign in to your account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm