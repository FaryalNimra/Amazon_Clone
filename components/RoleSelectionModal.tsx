'use client'

import React from 'react'
import { X, ShoppingBag, Store } from 'lucide-react'

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onRoleSelect: (role: 'buyer' | 'seller') => void
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onRoleSelect 
}) => {
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
          
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Continue as
              </h2>
              <p className="text-text-muted">
                Choose your account type to get started
              </p>
            </div>

            <div className="space-y-4">
              {/* Buyer Option */}
              <button
                onClick={() => onRoleSelect('buyer')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-red hover:bg-red-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-red rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-primary-text group-hover:text-red-700 transition-colors">
                      Buyer
                    </h3>
                    <p className="text-sm text-text-muted">
                      Shop and purchase products
                    </p>
                  </div>
                </div>
              </button>

              {/* Seller Option */}
              <button
                onClick={() => onRoleSelect('seller')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-red hover:bg-red-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-red rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-primary-text group-hover:text-red-700 transition-colors">
                      Seller
                    </h3>
                    <p className="text-sm text-text-muted">
                      Sell products and manage your store
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-text-muted">
                You can change your account type later in settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelectionModal





