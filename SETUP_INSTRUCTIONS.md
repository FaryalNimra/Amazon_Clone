# 🚀 Ecommerce Website Setup Guide

## 📋 Prerequisites
- Node.js installed
- Supabase account and project created

## 🔑 Step 1: Environment Variables Setup

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get these values:
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to **Settings** → **API**
5. Copy **Project URL** and **anon public** key

## 🗄️ Step 2: Database Tables Setup

### Option A: Manual Setup (Recommended)
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy the content from `create-tables.sql` file
4. Paste it in the SQL editor
5. Click **Run** to execute

### Option B: Using Setup Script
```bash
npm install dotenv
node setup-database.js
```

## ✅ Step 3: Test Your Setup

1. Start your development server:
```bash
npm run dev
```

2. Try to sign up a new buyer or seller account
3. Check the browser console for any errors
4. Check your Supabase dashboard → **Authentication** → **Users**

## 🔧 Current Status

**✅ Forms Modified:** Both buyer and seller forms now store data in auth metadata
**⏳ Database Tables:** Need to be created manually
**🔄 Next Step:** Create tables, then uncomment the database insert code

## 📝 What's Working Now

- ✅ User authentication (signup/signin)
- ✅ Data storage in user metadata
- ✅ Form validation
- ✅ Error handling

## 🎯 What Will Work After Table Creation

- ✅ Data storage in separate `buyers` and `sellers` tables
- ✅ Better data organization
- ✅ Easier queries and reporting
- ✅ Proper database structure

## 🚨 Troubleshooting

### "Missing Supabase environment variables"
- Check if `.env.local` file exists
- Verify the variable names are correct
- Restart your development server

### "Database error saving new user"
- This is expected until tables are created
- Forms will work with auth metadata only
- Create tables to enable full functionality

### Connection issues
- Verify your Supabase URL and key
- Check if your Supabase project is active
- Ensure your IP is not blocked

## 📞 Need Help?

1. Check Supabase documentation
2. Verify your environment variables
3. Test database connection
4. Check browser console for specific errors
