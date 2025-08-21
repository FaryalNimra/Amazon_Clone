'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useBodyScroll } from '@/hooks/useBodyScroll'

interface ModalContextType {
  isSignUpModalOpen: boolean
  isSignInModalOpen: boolean
  isSellerSignUpModalOpen: boolean
  isSellerSignInModalOpen: boolean
  isAnyModalOpen: boolean
  openSignUpModal: () => void
  openSignInModal: () => void
  openSellerSignUpModal: () => void
  openSellerSignInModal: () => void
  closeSignUpModal: () => void
  closeSignInModal: () => void
  closeSellerSignUpModal: () => void
  closeSellerSignInModal: () => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalProviderProps {
  children: React.ReactNode
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSellerSignUpModalOpen, setIsSellerSignUpModalOpen] = useState(false)
  const [isSellerSignInModalOpen, setIsSellerSignInModalOpen] = useState(false)

  // Check if any modal is open
  const isAnyModalOpen = isSignUpModalOpen || isSignInModalOpen || isSellerSignUpModalOpen || isSellerSignInModalOpen

  // Use the body scroll hook to disable/enable scrolling
  useBodyScroll(isAnyModalOpen)

  const openSignUpModal = () => {
    setIsSignUpModalOpen(true)
  }

  const openSignInModal = () => {
    setIsSignInModalOpen(true)
  }

  const openSellerSignUpModal = () => {
    setIsSellerSignUpModalOpen(true)
  }

  const openSellerSignInModal = () => {
    setIsSellerSignInModalOpen(true)
  }

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false)
  }

  const closeSignInModal = () => {
    setIsSignInModalOpen(false)
  }

  const closeSellerSignUpModal = () => {
    setIsSellerSignUpModalOpen(false)
  }

  const closeSellerSignInModal = () => {
    setIsSellerSignInModalOpen(false)
  }

  // Utility function to close all modals
  const closeAllModals = () => {
    setIsSignUpModalOpen(false)
    setIsSignInModalOpen(false)
    setIsSellerSignUpModalOpen(false)
    setIsSellerSignInModalOpen(false)
  }

  return (
    <ModalContext.Provider value={{ 
      isSignUpModalOpen, 
      isSignInModalOpen,
      isSellerSignUpModalOpen,
      isSellerSignInModalOpen,
      isAnyModalOpen,
      openSignUpModal, 
      openSignInModal,
      openSellerSignUpModal,
      openSellerSignInModal,
      closeSignUpModal, 
      closeSignInModal,
      closeSellerSignUpModal,
      closeSellerSignInModal,
      closeAllModals
    }}>
      {children}
    </ModalContext.Provider>
  )
}
