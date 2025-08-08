# Amazon Sign-Up Clone

A responsive sign-up page inspired by Amazon's design, built with Next.js, Supabase, Tailwind CSS, and TypeScript.

## Features

- 🎨 **Amazon-inspired Design**: Clean, modern UI that closely resembles Amazon's sign-up page
- 📱 **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- ✅ **Form Validation**: Comprehensive validation using Zod schema
- 🔐 **Authentication**: Secure user registration with Supabase
- 👁️ **Password Visibility**: Toggle password visibility for better UX
- 🎯 **TypeScript**: Full type safety throughout the application
- 🎨 **Tailwind CSS**: Utility-first CSS framework for styling

## Tech Stack

- **Next.js 14**: React framework with App Router
- **Supabase**: Backend-as-a-Service for authentication and database
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **Lucide React**: Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazon-signup-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy the values to your environment file

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and Tailwind directives
│   ├── layout.tsx           # Root layout component
│   └── page.tsx            # Main page component
├── components/
│   ├── AmazonLogo.tsx      # Amazon logo component
│   └── SignUpForm.tsx      # Main sign-up form component
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   └── validation.ts       # Form validation schemas
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Features in Detail

### Form Validation
- Name: Minimum 2 characters
- Email: Valid email format
- Password: Minimum 8 characters with uppercase, lowercase, and number
- Password confirmation: Must match password
- Phone number: Optional field

### Authentication Flow
1. User fills out the sign-up form
2. Form validation runs on client-side
3. Data is sent to Supabase for user registration
4. User receives email verification link
5. Success page is shown with instructions

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Consistent spacing and typography
- Touch-friendly form elements

### Security Features
- Password strength requirements
- Email verification
- Secure data transmission
- Input sanitization

## Customization

### Colors
The project uses Amazon-inspired colors defined in `tailwind.config.js`:
- `amazon-orange`: #ff9900
- `amazon-dark`: #232f3e
- `amazon-blue`: #146eb4
- `amazon-light-gray`: #f8f9fa

### Styling
Custom CSS classes are defined in `app/globals.css`:
- `.amazon-input`: Styled form inputs
- `.amazon-button`: Primary action buttons
- `.amazon-secondary-button`: Secondary action buttons

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes. Amazon is a registered trademark of Amazon.com, Inc.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 