'use client'

import React from 'react'
import { X } from 'lucide-react'
import SignInForm from './SignInForm'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

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
          
          {/* Sign In Form */}
          <div className="relative">
            <SignInForm onClose={onClose} showCloseButton={false} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInModal





