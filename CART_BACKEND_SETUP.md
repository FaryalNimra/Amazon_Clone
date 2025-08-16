# 🛒 Cart Backend Integration Setup

## Overview
This document explains how to set up and use the backend cart system for storing cart items in the database instead of just localStorage.

## 🗄️ Database Setup

### 1. Create Cart Items Table
Run the updated `create-tables.sql` file which now includes the `cart_items` table:

```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  product_image TEXT,
  product_category VARCHAR(100) NOT NULL,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable RLS (Row Level Security)
The table automatically enables RLS with policies that ensure users can only access their own cart items.

## 🚀 API Endpoints

### Cart Operations
- **GET** `/api/cart?userId={userId}` - Fetch user's cart items
- **POST** `/api/cart` - Add item to cart or update quantity
- **PUT** `/api/cart` - Update cart item quantity
- **DELETE** `/api/cart?cartItemId={id}&userId={userId}` - Remove item from cart
- **POST** `/api/cart/clear` - Clear entire cart

### Example Usage

#### Add Item to Cart
```typescript
const response = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    productId: 'product-uuid',
    quantity: 1,
    productData: {
      name: 'Product Name',
      description: 'Product Description',
      price: 29.99,
      image_url: 'image-url',
      category: 'Electronics',
      seller_id: 'seller-uuid'
    }
  })
})
```

#### Update Quantity
```typescript
const response = await fetch('/api/cart', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cartItemId: 'cart-item-uuid',
    quantity: 3
  })
})
```

## 🔧 Integration with CartContext

The `CartContext` has been updated to support backend synchronization:

### Current Implementation
- **Local State**: Cart updates immediately for better UX
- **Backend Sync**: TODO comments show where backend sync should be implemented
- **Fallback**: Falls back to localStorage if backend sync fails

### Future Implementation
When user authentication is implemented, uncomment the backend sync code in `CartContext`:

```typescript
// In addToCart function
const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
  // Update local state immediately
  dispatch({ type: 'ADD_ITEM', payload: item as CartItem })
  
  // Sync with backend
  try {
    const userId = getCurrentUserId()
    if (userId) {
      await addToCartBackend({
        userId,
        productId: item.id,
        quantity: 1,
        productData: item
      })
    }
  } catch (error) {
    console.error('Error syncing cart with backend:', error)
  }
}
```

## 🛠️ Utility Functions

Use the utility functions in `utils/cartSync.ts` for backend operations:

```typescript
import { 
  addToCartBackend, 
  updateCartItemBackend, 
  removeCartItemBackend,
  clearCartBackend,
  loadCartFromBackend,
  syncLocalCartWithBackend
} from '@/utils/cartSync'

// Examples
await addToCartBackend(cartData)
await updateCartItemBackend('cart-item-id', 5)
await removeCartItemBackend('cart-item-id')
await clearCartBackend('user-id')
const cartItems = await loadCartFromBackend('user-id')
```

## 🔄 Cart Synchronization Strategy

### 1. **Immediate Local Update**
- Cart updates happen instantly in local state
- Provides smooth user experience

### 2. **Background Backend Sync**
- Backend operations happen asynchronously
- Local state is updated regardless of backend success/failure

### 3. **User Login Sync**
- When user logs in, merge local cart with backend cart
- Resolve conflicts by using higher quantities
- Update backend with merged data

### 4. **Error Handling**
- Backend failures don't affect local cart functionality
- Errors are logged for debugging
- Cart continues to work offline

## 📱 Benefits

### For Users
- **Cross-device sync**: Cart items available on all devices
- **Persistence**: Cart survives browser clearing and device changes
- **Reliability**: Data backed up in database

### For Business
- **Analytics**: Track cart behavior and abandonment
- **User insights**: Understand shopping patterns
- **Data recovery**: Recover lost cart data

## 🚧 Current Status

- ✅ **Backend API**: Complete and tested
- ✅ **Database Schema**: Ready for implementation
- ✅ **Utility Functions**: Available for use
- ✅ **CartContext**: Prepared for backend integration
- ⏳ **User Authentication**: Required for full implementation
- ⏳ **Backend Sync**: Ready to uncomment when auth is ready

## 🔮 Next Steps

1. **Implement User Authentication** (if not already done)
2. **Uncomment backend sync code** in CartContext
3. **Test backend integration** with real users
4. **Monitor performance** and optimize if needed
5. **Add analytics** for cart behavior insights

## 🐛 Troubleshooting

### Common Issues

1. **Cart items not syncing**
   - Check if user is authenticated
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Database errors**
   - Ensure cart_items table exists
   - Verify RLS policies are correct
   - Check user permissions

3. **Performance issues**
   - Implement debouncing for rapid cart updates
   - Use batch operations for multiple items
   - Consider caching strategies

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
