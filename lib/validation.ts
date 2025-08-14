import { z } from 'zod'

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
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Seller signup schema — includes business-specific fields
export const sellerSignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  gstNumber: z.string().min(1, 'GST number is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: z.string().min(10, 'Business address must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
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

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SellerSignUpFormData = z.infer<typeof sellerSignUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
