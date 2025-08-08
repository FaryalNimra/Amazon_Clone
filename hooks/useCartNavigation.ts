'use client'

import { useRouter } from 'next/navigation'

export const useCartNavigation = () => {
  const router = useRouter()

  const navigateToCart = () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    const cartUrl = `/cart?from=${encodeURIComponent(currentPath)}`
    router.push(cartUrl)
  }

  const getCartUrl = () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    return `/cart?from=${encodeURIComponent(currentPath)}`
  }

  const getPreviousPage = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const from = urlParams.get('from')
      // Validate the from parameter to prevent open redirects
      if (from && from.startsWith('/') && !from.includes('..')) {
        return from
      }
      return '/'
    }
    return '/'
  }

  const navigateBack = () => {
    const previousPage = getPreviousPage()
    router.push(previousPage)
  }

  return {
    navigateToCart,
    getCartUrl,
    getPreviousPage,
    navigateBack
  }
}
