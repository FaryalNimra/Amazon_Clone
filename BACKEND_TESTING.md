# Backend Testing Guide for Product Form

## 🧪 Testing the Backend

The backend functionality for storing product form data has been implemented. Here's how to test it:

### 1. Database Setup
Make sure you have run the `database-setup.sql` script in your Supabase SQL Editor to create the necessary tables.

**If you get "column seller_id does not exist" error:**
1. Run the `fix-database-schema.sql` script in Supabase SQL Editor
2. This will add any missing columns and fix schema issues
3. Or run the complete `database-setup.sql` script to recreate the table

### 2. Test Database Connection
Visit `/api/test-db` in your browser to test if the database connection is working.

### 3. Test Product Creation
1. Go to the Seller Dashboard
2. Navigate to "Store Management" → "Add New Product"
3. Fill out the form with test data
4. Submit the form

### 4. What Happens When You Submit

#### Frontend Validation:
- ✅ Product name validation
- ✅ Description validation  
- ✅ Category selection validation
- ✅ Price validation (must be > 0)
- ✅ Stock validation (must be >= 0)
- ✅ Image validation (file upload or URL)

#### Backend Processing:
1. **Image Upload**: If you select a file, it gets uploaded to Supabase storage
2. **Database Insert**: Product data is inserted into the `products` table
3. **Success Response**: Form resets and shows success message
4. **Error Handling**: Any errors are displayed to the user

### 5. Database Schema
The product data is stored in the `products` table with these fields:
- `id` (UUID, auto-generated)
- `name` (VARCHAR, required)
- `description` (TEXT, required)
- `category` (VARCHAR, required)
- `price` (DECIMAL, required, >= 0)
- `stock` (INTEGER, required, >= 0)
- `image_url` (TEXT, optional)
- `seller_id` (UUID, references auth.users)
- `created_at` (TIMESTAMP, auto-generated)
- `updated_at` (TIMESTAMP, auto-updated)

### 6. Storage Bucket
Images are stored in the `product-images` bucket with the path structure:
```
sellers/{seller_id}/products/{timestamp}-{random}.{extension}
```

### 7. Security Features
- **Row Level Security (RLS)**: Sellers can only manage their own products
- **Authentication Required**: Must be logged in as a seller
- **Input Validation**: Both client-side and server-side validation
- **File Type Validation**: Only image files allowed
- **File Size Limit**: 10MB maximum

### 8. Testing Checklist
- [ ] Database connection works
- [ ] Form validation works
- [ ] Image upload works
- [ ] Product creation works
- [ ] Error handling works
- [ ] Success messages display
- [ ] Form resets after submission

### 9. Common Issues & Solutions

#### "Table doesn't exist"
- Run the `database-setup.sql` script in Supabase

#### "column seller_id does not exist"
- Run the `fix-database-schema.sql` script in Supabase SQL Editor
- This will add missing columns and fix schema issues
- Or run the complete `database-setup.sql` script to recreate the table

#### "Storage bucket not found"
- Create a `product-images` bucket in Supabase Storage

#### "RLS policy error"
- Check that RLS policies are enabled and configured correctly

#### "Authentication error"
- Make sure you're logged in as a seller user

#### "Schema mismatch"
- Use the `check-database-schema.js` script to diagnose issues
- Run `node check-database-schema.js` to see what columns actually exist

### 10. Monitoring
Check the browser console and Supabase logs for detailed error messages and debugging information.

## 🎯 Success Indicators
When everything is working correctly, you should see:
- ✅ Form submits without errors
- ✅ Success toast message appears
- ✅ Form resets to empty state
- ✅ Product appears in your products list
- ✅ Image is accessible via the generated URL
- ✅ Product count increases in seller dashboard

## 🚀 Next Steps
After confirming the backend works:
1. Test with different product types
2. Test error scenarios (invalid data, network issues)
3. Test image upload with various file types
4. Verify products appear in the buyer view
5. Test product editing and deletion features
