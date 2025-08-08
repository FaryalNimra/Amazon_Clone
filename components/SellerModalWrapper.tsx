'use client'

import React from 'react'
import { useModal } from '@/contexts/ModalContext'
import SellerSignInModal from './SellerSignInModal'
import SellerSignUpModal from './SellerSignUpModal'

const SellerModalWrapper: React.FC = () => {
  const { 
    isSellerSignInModalOpen, 
    isSellerSignUpModalOpen,
    closeSellerSignInModal, 
    closeSellerSignUpModal 
  } = useModal()

  return (
    <>
      <SellerSignInModal 
        isOpen={isSellerSignInModalOpen} 
        onClose={closeSellerSignInModal} 
      />
      <SellerSignUpModal 
        isOpen={isSellerSignUpModalOpen} 
        onClose={closeSellerSignUpModal} 
      />
    </>
  )
}

export default SellerModalWrapper
