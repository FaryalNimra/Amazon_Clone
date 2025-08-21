'use client'

import React, { useState } from 'react'
import { useModal } from '@/contexts/ModalContext'
import RoleSelectionModal from './RoleSelectionModal'
import BuyerSignUpForm from './BuyerSignUpForm'
import SellerSignUpForm from './SellerSignUpForm'

type SignUpStep = 'role-selection' | 'buyer-form' | 'seller-form'

const SignUpModalWrapper: React.FC = () => {
  const { isSignUpModalOpen, closeSignUpModal, openSignInModal } = useModal()
  const [currentStep, setCurrentStep] = useState<SignUpStep>('role-selection')
  const [showBuyerSuccessModal, setShowBuyerSuccessModal] = useState(false)

  const handleRoleSelect = (role: 'buyer' | 'seller') => {
    if (role === 'buyer') {
      setCurrentStep('buyer-form')
    } else {
      setCurrentStep('seller-form')
    }
  }

  const handleBackToRoleSelection = () => {
    setCurrentStep('role-selection')
  }

  const handleClose = () => {
    setCurrentStep('role-selection')
    setShowBuyerSuccessModal(false)
    closeSignUpModal()
  }

  const handleBuyerSignUpSuccess = () => {
    setShowBuyerSuccessModal(true)
  }

  const handleSignInNow = () => {
    setShowBuyerSuccessModal(false)
    closeSignUpModal()
    openSignInModal()
  }

  // Buyer Success Modal
  if (showBuyerSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Account Created!
                </h2>
                
                <p className="text-gray-600 mb-8 text-lg">
                  ✅ Account created successfully! Please sign in to continue.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleSignInNow}
                    className="w-full bg-primary-red hover:bg-red-600 text-white px-6 py-4 rounded-xl hover:scale-105 transition-all duration-200 transform font-semibold text-lg flex items-center justify-center"
                  >
                    Sign In Now
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <button
                    onClick={handleClose}
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

  if (!isSignUpModalOpen) return null

  return (
    <>
      {/* Role Selection Modal */}
      {currentStep === 'role-selection' && (
        <RoleSelectionModal
          isOpen={isSignUpModalOpen}
          onClose={handleClose}
          onRoleSelect={handleRoleSelect}
        />
      )}

      {/* Buyer Sign Up Form */}
      {currentStep === 'buyer-form' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClose}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <BuyerSignUpForm 
                onClose={handleClose} 
                showOwnModal={false}
                onSignUpSuccess={handleBuyerSignUpSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Seller Sign Up Form */}
      {currentStep === 'seller-form' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClose}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <SellerSignUpForm onClose={handleClose} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SignUpModalWrapper


