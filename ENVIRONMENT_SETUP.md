# Environment Variables Setup Guide

## Local Development

1. **Create a `.env.local` file** in your project root:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

2. **Get your Supabase credentials**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or select existing one
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

3. **Replace the placeholders** in `.env.local` with your actual values

## Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

4. **Redeploy your project** after adding the environment variables

## Important Notes

- **Never commit `.env.local`** to version control (it's already in `.gitignore`)
- **The `NEXT_PUBLIC_` prefix** means these variables are exposed to the browser
- **This is safe** for Supabase anon keys as they are designed to be public
- **Restart your development server** after creating `.env.local`

## Troubleshooting

### Build Errors
If you see "Missing Supabase environment variables" during build:
1. Ensure environment variables are set in Vercel
2. Check that variable names match exactly (case-sensitive)
3. Redeploy after adding environment variables

### Local Development Issues
If Supabase doesn't work locally:
1. Verify `.env.local` exists and has correct values
2. Restart your development server
3. Check browser console for error messages

## Security

- **Supabase anon keys are safe** to expose in the browser
- **Service role keys should NEVER** be exposed (they have full database access)
- **Use Row Level Security (RLS)** in Supabase to secure your data
