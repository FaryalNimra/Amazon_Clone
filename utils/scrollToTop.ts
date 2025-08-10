/**
 * Utility function to scroll to the top of the page
 * @param behavior - The scroll behavior ('auto' | 'smooth')
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    })
  }
}

/**
 * Utility function to scroll to top with instant behavior (no animation)
 */
export const scrollToTopInstant = () => {
  scrollToTop('auto')
}

/**
 * Utility function to scroll to top with smooth animation
 */
export const scrollToTopSmooth = () => {
  scrollToTop('smooth')
}


