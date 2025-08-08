'use client'

import React, { useState } from 'react'
import { useModal } from '@/contexts/ModalContext'
import RoleSelectionModal from './RoleSelectionModal'
import BuyerSignUpForm from './BuyerSignUpForm'
import SellerSignUpForm from './SellerSignUpForm'

type SignUpStep = 'role-selection' | 'buyer-form' | 'seller-form'

const SignUpModalWrapper: React.FC = () => {
  const { isSignUpModalOpen, closeSignUpModal } = useModal()
  const [currentStep, setCurrentStep] = useState<SignUpStep>('role-selection')

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
    closeSignUpModal()
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
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <BuyerSignUpForm onClose={handleClose} />
            </div>
          </div>
        </div>
      )}

      {/* Seller Sign Up Form */}
      {currentStep === 'seller-form' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
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


