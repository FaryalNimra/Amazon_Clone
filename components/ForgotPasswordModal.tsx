'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, X, ArrowLeft, Shield } from 'lucide-react'
import { forgotPasswordEmailSchema, newPasswordSchema, type ForgotPasswordEmailData, type NewPasswordData } from '@/lib/validation'
import { checkEmailExists, updatePassword } from '@/lib/supabase'
import Logo from './Logo'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const emailForm = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  })

  const passwordForm = useForm<NewPasswordData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const handleEmailSubmit = async (data: ForgotPasswordEmailData) => {
    setIsLoading(true)
    setError('')

    try {
      console.log('🔍 Checking if email exists:', data.email)
      const result = await checkEmailExists(data.email)

      if (result.exists && result.userType) {
        setEmail(data.email)
        setUserType(result.userType)
        setUserName(result.name || '')
        setStep('password')
        console.log('✅ Email found, proceeding to password reset')
      } else {
        setError('No account found with this email address. Please check your email or create a new account.')
      }
    } catch (err: any) {
      console.error('❌ Error checking email:', err)
      setError('An error occurred while checking your email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (data: NewPasswordData) => {
    if (!userType) {
      setError('User type not found. Please try again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Starting password update process...')
      console.log('📧 Email:', email)
      console.log('👤 User Type:', userType)
      console.log('🔑 New Password Length:', data.newPassword.length)
      
      const result = await updatePassword(email, userType, data.newPassword)
      
      console.log('📊 Password update result:', result)

      if (result.success) {
        setStep('success')
        console.log('✅ Password updated successfully')
      } else {
        console.error('❌ Password update failed:', result.error)
        setError(result.error || 'Failed to update password. Please try again.')
      }
    } catch (err: any) {
      console.error('❌ Error updating password:', err)
      console.error('❌ Error stack:', err.stack)
      setError('An error occurred while updating your password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setError('')
    emailForm.reset()
    passwordForm.reset()
  }

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setUserType(null)
    setUserName('')
    setError('')
    emailForm.reset()
    passwordForm.reset()
    onClose()
  }

  const handleSignIn = () => {
    handleClose()
    // You can add logic here to open the sign-in modal if needed
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-light">
          <h2 className="text-xl font-semibold text-primary-text">
            {step === 'email' && 'Forgot Password'}
            {step === 'password' && 'Reset Password'}
            {step === 'success' && 'Success!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-primary-text transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'email' && (
            // Email Step
            <div>
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 bg-primary-red/10 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-7 w-7 text-primary-red" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text mb-2">
                  Reset Your Password
                </h3>
                <p className="text-text-muted text-sm">
                  Enter your email address to reset your password.
                </p>
              </div>

              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-1">
                    Email Address
                  </label>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    id="email"
                    className="auth-input w-full"
                    placeholder="Enter your email address"
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'password' && (
            // Password Reset Step
            <div>
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 bg-primary-red/10 rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-7 w-7 text-primary-red" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text mb-2">
                  Set New Password
                </h3>
                <p className="text-text-muted text-sm">
                  Hi {userName}! Set a new password for your {userType} account.
                </p>
                <p className="text-sm font-medium text-primary-text mt-1">{email}</p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-3">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-primary-text mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      className="auth-input w-full pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary-text"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-text mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="auth-input w-full pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary-text"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="auth-secondary-button flex-1 py-3 px-6 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-button flex-1 py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            // Success Step
            <div>
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text mb-2">
                  Password Updated Successfully!
                </h3>
                <p className="text-text-muted text-sm">
                  Your password has been updated. Please sign in with your new password.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-green-700 text-sm mt-2 space-y-1">
                    <li>• Your password has been updated in the system</li>
                    <li>• You can now sign in with your new password</li>
                    <li>• No email verification or OTP required</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleSignIn}
                  className="auth-button w-full py-3 px-6 rounded-xl"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordModal
