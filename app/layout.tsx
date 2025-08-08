import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import LayoutWrapper from '@/components/LayoutWrapper'
import SignUpModalWrapper from '@/components/SignUpModalWrapper'
import SignInModalWrapper from '@/components/SignInModalWrapper'
import SellerModalWrapper from '@/components/SellerModalWrapper'
import ScrollToTopWrapper from '@/components/ScrollToTopWrapper'
import ScrollToTopButton from '@/components/ScrollToTopButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SecureAuth - Secure Authentication',
  description: 'Modern authentication system with secure sign-up and sign-in',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ModalProvider>
            <AuthProvider>
              <CartProvider>
                <ScrollToTopWrapper>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </ScrollToTopWrapper>
                <ScrollToTopButton />
                <SignUpModalWrapper />
                <SignInModalWrapper />
                <SellerModalWrapper />
              </CartProvider>
            </AuthProvider>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 