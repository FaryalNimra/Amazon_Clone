'use client'

import React from 'react'
import { X } from 'lucide-react'
import { useModal } from '@/contexts/ModalContext'
import SellerSignUpForm from './SellerSignUpForm'

interface SellerSignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

const SellerSignUpModal: React.FC<SellerSignUpModalProps> = ({ isOpen, onClose }) => {
  const { openSellerSignInModal } = useModal()

  if (!isOpen) return null

  const handleSwitchToSignIn = () => {
    onClose()
    openSellerSignInModal()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-text-muted hover:text-primary-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Sign Up Form */}
          <div className="relative">
            <SellerSignUpForm onClose={onClose} showCloseButton={false} />
            
            {/* Seller-specific footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Already have a seller account?
              </p>
              <button
                onClick={handleSwitchToSignIn}
                className="text-primary-red hover:text-red-600 font-medium transition-colors"
              >
                Sign In to Seller Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerSignUpModal
