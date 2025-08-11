'use client'

import React from 'react'
import { useModal } from '@/contexts/ModalContext'
import SignInModal from './SignInModal'

const SignInModalWrapper: React.FC = () => {
  const { isSignInModalOpen, closeSignInModal } = useModal()

  return (
    <SignInModal 
      isOpen={isSignInModalOpen} 
      onClose={closeSignInModal} 
    />
  )
}

export default SignInModalWrapper








