'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

const ResetPasswordPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [session, setSession] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Check if user has a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSession(session)
      } else {
        // Check if there's a recovery token in the URL
        const recoveryToken = searchParams.get('recovery_token')
        const email = searchParams.get('email')
        
        if (recoveryToken && email) {
          // For password recovery in Supabase v2, we need to exchange the recovery token
          // for a session using the auth API
          try {
            // Exchange recovery token for session
            const { data, error } = await supabase.auth.verifyOtp({
              token: recoveryToken,
              type: 'recovery',
              email: email
            })
            
            if (error) {
              console.error('Recovery token verification error:', error)
              setError('Invalid or expired reset link. Please request a new password reset.')
            } else if (data.session) {
              setSession(data.session)
            }
          } catch (err) {
            console.error('Error verifying recovery token:', err)
            setError('Invalid reset link. Please request a new password reset.')
          }
        } else {
          setError('Invalid reset link. Please request a new password reset.')
        }
      }
    }

    checkSession()
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordData) => {
    if (!session?.user) {
      setError('No valid session found. Please request a new password reset.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Updating password for user:', session.user.email)
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) {
        console.error('❌ Error updating password:', updateError)
        setError(updateError.message || 'Failed to update password. Please try again.')
        return
      }

      console.log('✅ Password updated successfully')
      setSuccess(true)
      
      // Redirect to sign in page after a delay
      setTimeout(() => {
        router.push('/signin')
      }, 3000)
      
    } catch (err: any) {
      console.error('❌ Error updating password:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-text-muted">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-primary-text mb-2">
            Reset Link Invalid
          </h1>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="auth-button w-full py-3 px-6 rounded-xl"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-primary-text mb-2">
            Set New Password
          </h1>
          <p className="text-text-muted">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          // Success State
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-primary-text mb-2">
              Password Updated Successfully!
            </h2>
            <p className="text-text-muted mb-6">
              Your password has been updated. You will be redirected to the sign-in page shortly.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red mx-auto"></div>
          </div>
        ) : (
          // Password Reset Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-primary-text mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  className="auth-input pr-12 w-full"
                  placeholder="Enter new password"
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
              {errors.newPassword && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-text mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="auth-input pr-12 w-full"
                  placeholder="Confirm new password"
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
                <p className="text-red-600 text-sm mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-button w-full py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/signin')}
                className="text-primary-red hover:underline transition-colors text-sm"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
