import { z } from 'zod'

// Phone number validation function
const validatePhoneNumber = (phone: string) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check if it's a valid Pakistani phone number
  // Pakistani numbers: +92 3XX XXXXXXX, 03XX XXXXXXX, 3XX XXXXXXX
  // Length should be 10 digits (excluding country code)
  if (cleanPhone.length === 10) {
    // Check if it starts with valid Pakistani mobile prefixes
    // 03XX (03 followed by any 2 digits) or 3XX (3 followed by any 2 digits)
    const validPrefixes = ['03', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39']
    return validPrefixes.some(prefix => cleanPhone.startsWith(prefix))
  }
  
  // If it's 12 digits and starts with 92 (country code)
  if (cleanPhone.length === 12 && cleanPhone.startsWith('92')) {
    const mobileNumber = cleanPhone.slice(2)
    const validPrefixes = ['03', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39']
    return validPrefixes.some(prefix => mobileNumber.startsWith(prefix))
  }
  
  // If it's 11 digits and starts with 0 (local format)
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    const mobileNumber = cleanPhone.slice(1)
    const validPrefixes = ['3']
    return validPrefixes.some(prefix => mobileNumber.startsWith(prefix))
  }
  
  return false
}

// Buyer signup schema — email + password + name + phone
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || validatePhoneNumber(val), {
      message: 'Please enter a valid Pakistani phone number (e.g., 03001234567 or +92 300 1234567)'
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Seller signup schema — includes business-specific fields
export const sellerSignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  gstNumber: z
    .string()
    .min(1, 'GST number is required')
    .length(15, 'GST number must be exactly 15 characters')
    .regex(/^[0-9A-Z]{15}$/, 'GST number must contain only numbers and uppercase letters'),
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: z.string().min(10, 'Business address must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(validatePhoneNumber, {
      message: 'Please enter a valid Pakistani phone number (e.g., 03001234567 or +92 300 1234567)'
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Sign in schema
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Forgot password schemas
export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// New password schema for direct password reset
export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SellerSignUpFormData = z.infer<typeof sellerSignUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type NewPasswordData = z.infer<typeof newPasswordSchema>
